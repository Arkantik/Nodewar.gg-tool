from time import localtime, strftime
from collections import OrderedDict
from . import config
from scapy.all import wrpcap
import os

def dec(bytes):
    message = str(bytes, "latin-1")
    message = message.replace("\x00", "")
    return message


def extract_string(hex, offset, length):
    if hex[offset:offset+2] == "00":
        return -1

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
        if actual_length < 0:
            raise ValueError('Package too short')

        return dec(bytes.fromhex(hex[offset:offset+actual_length]))
    except ValueError as e:
        print(e, flush=True)
        return -1

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


def package_handler(package, output, record=False):

    if "IP" not in package:
        return

    package_src = package["IP"].src

    # checks if the package derives from bdo
    is_bdo_ip = len(([ip for ip in config.config.ips if ip in package_src])) > 0

    # checks if the packages comes from a tcp stream
    uses_tcp = "TCP" in package and hasattr(package["TCP"].payload, "load")
    if is_bdo_ip and uses_tcp:

        if record:
           wrpcap(output+".pcap", package, append=True)
           return

        # loads the payload as raw hex
        payload = bytes(package["TCP"].payload).hex()

        # scope the pending buffer to this specific connection so interleaved
        # packets from other connections can never corrupt or evict it
        conn_key = (package_src, package["TCP"].sport, package["IP"].dst, package["TCP"].dport)
        payload = get_pending(conn_key) + payload

        while config.config.identifier in payload:
            # get starting position for the combat log
            start_index = payload.find(config.config.identifier)
            if start_index == -1:
                break

            # remove unnecessary information
            payload = payload[start_index:]

            # if the combat log is not complete
            if config.config.log_length > len(payload):
                # save payload for next package
                set_pending(conn_key, payload)
                return

            # extract log information
            timestamp = strftime("%I:%M:%S", localtime(int(package.time)))
            guild = extract_string(payload, config.config.guild_offset, config.config.name_length)
            player_one = extract_string(
                payload, config.config.player_one_offset, config.config.name_length)
            player_two = extract_string(
                payload, config.config.player_two_offset, config.config.name_length)
            is_kill = payload[config.config.kill_offset: config.config.kill_offset+1] == "1"

            if guild != -1 and player_one != -1 and player_two != -1:
                if is_kill:
                    log = f"[{timestamp}] {player_one} has killed {player_two} from {guild}"
                else:
                    log = f"[{timestamp}] {player_one} died to {player_two} from {guild}"

                print(log, flush=True)
                directory = os.path.dirname(output)
                if directory and not os.path.exists(directory):
                    os.makedirs(directory)

                with open(output, "a") as file:
                    try:
                        file.write(log + "\n")
                    except UnicodeEncodeError as error:
                        print(error, flush=True)

            payload = payload[len(config.config.identifier):]

        # reset pending buffer for this connection
        set_pending(conn_key, "")
