import os
import re
import sys
from collections import OrderedDict
from scapy.all import sniff, rdpcap, get_if_list
if sys.platform == "win32":
    from scapy.arch.windows import get_windows_if_list
from time import localtime, strftime
from .. import config, trace


def dec(bytes):
    message = str(bytes, "latin-1")
    message = message.replace("\x00", "")
    return message


def extract_string(hex, offset, length):
    # check whether the string begins with a 0x00, if so, return -1
    if hex[offset : offset + 2] == "00":
        return -1

    # check whether the characters are always spaced by 1 byte (0x00), if not, return -1
    test_offset = offset + 2
    actual_length = length
    while test_offset < offset + length - 2:
        byte = hex[test_offset : test_offset + 2]
        previous_byte = hex[test_offset - 2 : test_offset]

        if previous_byte == "00":
            actual_length = test_offset - offset
            break
        if byte != "00":
            return -1
        test_offset += 4

    try:
        actual_length = min(len(hex) - offset, actual_length)
        if length < 0:
            raise ValueError("Package too short")

        return dec(bytes.fromhex(hex[offset : offset + actual_length]))
    except ValueError as e:
        # print(e, flush=True)
        return -1


current_position = 0

identifier_regex = r"[56][0-9a-f]0100[0-9a-f]{4}"
name_regex = r"^[A-Z][a-zA-Z0-9_]{2,15}$"

# Hex-char window scanned for the identifier + 5 names (unchanged, proven layout).
NAME_WINDOW = 600
# Hex-char window actually exported as `hex` for each log line. Wider than
# NAME_WINDOW so it also reaches the death-location floats, which sit ~278
# hex chars past the victim name's offset (i.e. past NAME_WINDOW in the
# worst case), plus a safety margin for offset drift across patches.
EXPORT_WINDOW = 800

# identifier_regex is fixed-length; this many trailing hex chars are enough
# to catch an identifier split across a packet boundary on the next call.
IDENTIFIER_LEN = 10
MAX_TRACKED_CONNECTIONS = 128
_pending_by_connection = OrderedDict()


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


def package_handler(package, output, ip_filter=True):
    if "IP" not in package:
        return

    package_src = package["IP"].src


    # checks if the package derives from bdo
    is_bdo_ip = (not ip_filter) or (
        len(
            (
                [
                    ip
                    for ip in ["20.76.13", "20.76.14", "13.64.17", "13.93.181", "52.137.41", "52.137.42", "44.228.191", "54.150.104"]
                    if ip in package_src
                ]
            )
        )
        > 0
    )

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
        position = 0
        while len(payload[position:]) >= EXPORT_WINDOW:
            payload = payload[position:]
            position = 0
            match_location = 0
            matches = list(re.finditer(identifier_regex, payload))

            if len(matches) == 0:
                # won't drop the payload outright (that loses an identifier split across
                # this packet boundary) and don't keep the whole thing either
                # (non-combat traffic would make this grow without bound)
                # - keep just enough trailing hex to bridge a split.
                set_pending(conn_key, payload[-(IDENTIFIER_LEN - 1):])
                return
            elif len(matches) == 1:
                match_location = matches[0].start()
            else:
                all_offsets = [m.start() for m in matches]
                while len(matches) > 1:
                    if matches[0].start() + EXPORT_WINDOW < matches[1].start():
                        match_location = matches[0].start()
                        break
                    elif len(matches) > 2:
                        matches.pop(0)
                    else:
                        match_location = matches[1].start()
                        break

                # Debug-only: capture every ambiguous "multiple candidate
                # identifiers" case as-is, without changing behavior, so it can
                # be replayed offline to see what the discarded candidate(s)
                # actually contained.
                trace.tracer.write(
                    {
                        "kind": "ambiguous_match",
                        "epoch": package.time,
                        "conn": [str(part) for part in conn_key],
                        "candidate_offsets": all_offsets,
                        "chosen_offset": match_location,
                        "hex": payload[0 : min(len(payload), all_offsets[-1] + EXPORT_WINDOW)],
                    }
                )

            payload = payload[match_location:]

            if len(payload) >= EXPORT_WINDOW:
                possible_log = payload[0:EXPORT_WINDOW]
                i = 0
                names = []
                while i < NAME_WINDOW:
                    name = extract_string(possible_log, i, 64)
                    if name == -1:
                        i += 1
                        continue
                    is_valid = re.match(name_regex, name)
                    if is_valid:
                        names.append(name + " " + str(i))
                        i += 64
                    else:
                        i += 1
                if len(names) == 5:
                    time = strftime("%I:%M:%S", localtime(int(package.time)))
                    trace.tracer.write(
                        {
                            "epoch": package.time,
                            "time": time,
                            "src": package_src,
                            "identifier": payload[0:10],
                            "names": names,
                            "hex": possible_log,
                        }
                    )
                    print(
                        payload[0:10]
                        + ","
                        + time
                        + ","
                        + ",".join(names)
                        + ","
                        + possible_log,
                        flush=True,
                    )
                    position = EXPORT_WINDOW
                else:
                    position = 1

            else:
                break

        set_pending(conn_key, payload[position:])


def open_pcap(file, output, ip_filter=True):
    if file != None and not os.path.isfile(file):
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
