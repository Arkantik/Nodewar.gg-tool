import os
import re
import sys
from collections import OrderedDict
from scapy.all import sniff, rdpcap, get_if_list
if sys.platform == "win32":
    from scapy.arch.windows import get_windows_if_list
from time import localtime, strftime
from .. import config, trace
from ..parser import extract_string

current_position = 0

identifier_regex = r"[0-9a-f]{2}0100[0-9a-f]{4}"
name_regex = r"^[A-Z][a-zA-Z0-9_]{2,15}$"

name_start_regex = r"(?=(?:4[1-9a-f]|5[0-9a])00)"

NAME_WINDOW = 600
EXPORT_WINDOW = 800
HEADER_LOOKBACK = 64
IDENTIFIER_LEN = 10
MAX_TRACKED_CONNECTIONS = 128
_pending_by_connection = OrderedDict()

_identifier_pattern = re.compile(identifier_regex)
_name_start_pattern = re.compile(name_start_regex)
_name_pattern = re.compile(name_regex)


def get_pending(conn_key):
    if conn_key in _pending_by_connection:
        _pending_by_connection.move_to_end(conn_key)
        return _pending_by_connection[conn_key]
    return ""


def set_pending(conn_key, value):
    _pending_by_connection[conn_key] = value
    _pending_by_connection.move_to_end(conn_key)
    while len(_pending_by_connection) > MAX_TRACKED_CONNECTIONS:
        _pending_by_connection.popitem(last=False)


def scan_names(payload):
    names = []
    guard = 0
    for match in _name_start_pattern.finditer(payload):
        offset = match.start()
        if offset < guard:
            continue
        name = extract_string(payload, offset, 64)
        if name != -1 and _name_pattern.match(name):
            names.append((name, offset))
            guard = offset + 64
    return names


def find_logs(payload):
    names = scan_names(payload)
    index = 0
    while index + 4 < len(names):
        first = names[index][1]

        start = None
        for match in _identifier_pattern.finditer(payload, max(0, first - HEADER_LOOKBACK), first):
            start = match.start()
        if start is None:
            index += 1
            continue

        if len(payload) - start < EXPORT_WINDOW:
            return

        if names[index + 4][1] - start >= NAME_WINDOW:
            index += 1
            continue
        if index > 0 and names[index - 1][1] >= start:
            index += 1
            continue
        if index + 5 < len(names) and names[index + 5][1] - start < NAME_WINDOW:
            index += 1
            continue

        yield start, [(name, offset - start) for name, offset in names[index : index + 5]]
        index += 5


DEFAULT_IPS = ["20.76.13", "20.76.14", "13.64.17", "13.93.181", "52.137.41", "52.137.42", "44.228.191", "54.150.104"]
_allowed_ips_cache = None


def allowed_ips():
    global _allowed_ips_cache
    if _allowed_ips_cache is None:
        configured = getattr(config.config, "ips", None) or []
        _allowed_ips_cache = list(dict.fromkeys(DEFAULT_IPS + list(configured)))
    return _allowed_ips_cache


def package_handler(package, output, ip_filter=True):
    if "IP" not in package:
        return

    package_src = package["IP"].src

    # checks if the package derives from bdo
    is_bdo_ip = (not ip_filter) or any(ip in package_src for ip in allowed_ips())

    # checkes if the packages comes from a tcp stream
    uses_tcp = "TCP" in package and hasattr(package["TCP"].payload, "load")
    if is_bdo_ip and uses_tcp:
        # loads the payload as raw hex
        payload = bytes(package["TCP"].payload).hex()

        # scope the pending buffer to this specific connection so interleaved
        # packets from other connections can never corrupt or evict it
        conn_key = (package["IP"].src, package["TCP"].sport, package["IP"].dst, package["TCP"].dport)

        # iterate through the payload and try to find the identifier + player names + guild name + kill
        payload = get_pending(conn_key) + payload
        consumed = 0
        found = 0
        for start, names in find_logs(payload):
            found += 1
            consumed = start + IDENTIFIER_LEN
            possible_log = payload[start : start + EXPORT_WINDOW]
            labelled = [name + " " + str(offset) for name, offset in names]
            time = strftime("%I:%M:%S", localtime(int(package.time)))
            trace.tracer.write(
                {
                    "epoch": package.time,
                    "time": time,
                    "src": package_src,
                    "identifier": payload[start : start + IDENTIFIER_LEN],
                    "names": labelled,
                    "hex": possible_log,
                }
            )
            print(
                payload[start : start + IDENTIFIER_LEN]
                + ","
                + time
                + ","
                + ",".join(labelled)
                + ","
                + possible_log,
                flush=True,
            )

        set_pending(conn_key, payload[max(consumed, len(payload) - (EXPORT_WINDOW - 1), 0) :])

        # Debug-only: a packet carrying enough names for a record that produced
        # nothing is the signature of a patch moving the layout - exactly the
        # case that is impossible to diagnose after the fact without the bytes.
        if found == 0 and trace.tracer.enabled:
            all_names = scan_names(payload)
            if len(all_names) >= 5:
                trace.tracer.write(
                    {
                        "kind": "unmatched_names",
                        "epoch": package.time,
                        "conn": [str(part) for part in conn_key],
                        "name_offsets": [offset for _, offset in all_names],
                        "hex": payload,
                    }
                )


def open_pcap(file, output, ip_filter=True):
    if file is None or not os.path.isfile(file):
        print("Invalid file", flush=True)
        return
    print("Reading " + file, flush=True)
    if os.name == "nt":
        print("Loading file into ram. This may take a while.", flush=True)
        cap = rdpcap(file)
        index = 0
        for package in cap:
            package_handler(package, output, ip_filter)
            if index % 10000 == 0:
                print(f"{index}/{len(cap)} packages analyzed.", flush=True)
            index += 1
    else:
        sniff(offline=file, filter="tcp", prn=lambda x: package_handler(x, output, ip_filter), store=0)

    print(f"Logs saved under: {output}\nYou can close this window now.", flush=True)


def read_network_interfaces():
    if sys.platform == "win32":
        winList = get_windows_if_list()
        # get_if_list() returns pcap device paths like \Device\NPF_{GUID}, while
        # get_windows_if_list() gives bare GUIDs like {GUID} - an exact-match lookup
        # between the two never hits, which silently made this return [] and made
        # all_interfaces a no-op (always falling back to scapy's single default
        # interface). Match by substring instead so the friendly-name lookup works.
        intfList = get_if_list()
        # Hyper-V virtual switch adapters mirror whatever physical adapter they're 
        # bound to at the NDIS level, so listening on both means every real packet 
        # gets captured (and processed)twice. They never carry traffic that isn't also 
        # visible on the underlying physical adapter, unlike a VPN's tunnel adapter, so skipping them is safe.
        names = []
        for entry in winList:
            if "hyper-v virtual ethernet adapter" in entry.get("description", "").lower():
                continue
            if any(entry["guid"] in dev for dev in intfList):
                names.append(entry["name"])
        return names
    return get_if_list()


def start_sniff(output, all_interfaces=True, ip_filter=True):
    try:
        print("Reading Network...", flush=True)
        namesAllowedList = read_network_interfaces()
        # print("Network Interfaces: ", namesAllowedList, flush=True)
        sniff(
            filter="tcp",
            prn=lambda x: package_handler(x, output, ip_filter),
            store=0,
            iface=namesAllowedList
            if len(namesAllowedList) > 0 and all_interfaces
            else None,
        )
    except Exception as e:
        print("Error while reading network.", flush=True)
        print(e, flush=True)
