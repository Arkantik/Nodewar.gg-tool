import json
import os
from datetime import date


class PacketTracer:
    def __init__(self, enabled=False, output_dir="logger/.tmp"):
        self.enabled = enabled
        self.output_dir = output_dir
        self._path = None

    def _ensure_path(self):
        if self._path is None:
            os.makedirs(self.output_dir, exist_ok=True)
            self._path = os.path.join(self.output_dir, f"{date.today()}.trace.jsonl")
        return self._path

    def write(self, record):
        if not self.enabled:
            return
        path = self._ensure_path()
        with open(path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record) + "\n")


tracer = PacketTracer()


def init(enabled, output_dir="logger/.tmp"):
    global tracer
    tracer = PacketTracer(enabled, output_dir)
