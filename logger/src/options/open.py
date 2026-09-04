import os
from scapy.all import sniff, rdpcap
from .. import config, parser

def open_pcap(file, output):
    if config.config.invalid:
        print("Could not locate config file or config is invalid", flush=True)
        return
    if file is None or not os.path.isfile(file):
        print("Invalid file", flush=True)
        return
    print("Reading " + file, flush=True)
    if os.name == "nt":
        print("Loading file into ram. This may take a while.", flush=True)
        cap = rdpcap(file)
        index = 0
        for package in cap:
            parser.package_handler(package, output, False)
            if index % 10000 == 0:
                print(f"{index}/{len(cap)} packages analyzed.", flush=True)
            index += 1
    else:
        sniff(offline=file, filter="tcp", prn=lambda x: parser.package_handler(x, output, False), store=0)

    print(f"Logs saved under: {output}\nYou can close this window now.", flush=True)
