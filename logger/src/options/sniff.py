from .. import config, parser
from scapy.all import sniff

def start_sniff(output):
    if config.config.invalid:
        print("Could not locate config file or config is invalid", flush=True)
        return
    print("Reading Network...", flush=True)
    sniff(filter="tcp", prn=lambda x: parser.package_handler(x, output, False), store=0)

