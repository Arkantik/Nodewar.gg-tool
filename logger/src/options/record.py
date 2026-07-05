from .. import config, parser
from scapy.all import sniff


def record(output):
    if config.config.invalid:
        print("Could not locate config file or config is invalid", flush=True)
        return
    print("Recording Network...", flush=True)
    sniff(filter="tcp", prn=lambda x: parser.package_handler(
        x, output, True), store=0)
