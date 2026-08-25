import glob
import json
import os
import time
from datetime import date

MAX_TRACE_FILE_BYTES = 25 * 1024 * 1024
TRACE_RETENTION_DAYS = 7


class PacketTracer:
    def __init__(self, enabled=False, output_dir="logger/.tmp"):
        self.enabled = enabled
        self.output_dir = output_dir
        self._path = None
        self._part = 0

    def _cleanup_old_traces(self):
        cutoff = time.time() - TRACE_RETENTION_DAYS * 86400
        for path in glob.glob(os.path.join(self.output_dir, "*.trace.jsonl")):
            try:
                if os.path.getmtime(path) < cutoff:
                    os.remove(path)
            except OSError:
                pass

    def _ensure_path(self):
        if self._path is None:
            os.makedirs(self.output_dir, exist_ok=True)
            self._cleanup_old_traces()
            self._path = os.path.join(self.output_dir, f"{date.today()}.trace.jsonl")
        elif os.path.isfile(self._path) and os.path.getsize(self._path) >= MAX_TRACE_FILE_BYTES:
            self._part += 1
            self._path = os.path.join(self.output_dir, f"{date.today()}.trace.{self._part}.jsonl")
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
