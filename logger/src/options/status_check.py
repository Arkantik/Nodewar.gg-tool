import os
import sys
from datetime import datetime, timedelta
from .. import config

CAP_NET_RAW_BIT = 1 << 13


def is_outdated():
    date = datetime.strptime(config.config.patch, "%d.%m.%Y")
    now = datetime.now()
    delta = now - date
    return delta > timedelta(days=7)


def has_capture_permission():
    if os.geteuid() == 0:
        return True
    with open("/proc/self/status") as f:
        for line in f:
            if line.startswith("CapEff:"):
                return (int(line.split()[1], 16) & CAP_NET_RAW_BIT) != 0
    return False


def check_health():
    if sys.platform == "win32":
        if os.path.exists(os.path.join(os.environ['SystemRoot'], 'System32', 'drivers', 'npcap.sys')):
            print("Npcap is installed", flush=True)
        else:
            print("Npcap is not installed", flush=True)
    else:
        if has_capture_permission():
            print("Packet capture permission is granted", flush=True)
        else:
            print("Packet capture permission is missing", flush=True)

    if config.config.invalid:
        print("Could not locate config file or config is invalid", flush=True)
        return

    print("The config is from the patch: " + config.config.patch, flush=True)
    
    if is_outdated():
        print("The config is older than 7 days. It might not work anymore. Try to update the config by using:\nlogger.exe -u", flush=True)
    else:
        print("The config is up to date.", flush=True)
