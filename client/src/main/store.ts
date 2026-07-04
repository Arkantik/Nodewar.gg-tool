import { app } from "electron";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function getStorePath(): string {
  return join(app.getPath("userData"), "store.json");
}

function readStore(): Record<string, unknown> {
  const path = getStorePath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return {};
  }
}

export function getValue<T>(key: string): T | null {
  const store = readStore();
  return key in store ? (store[key] as T) : null;
}

export function setValue<T>(key: string, value: T): void {
  const store = readStore();
  store[key] = value;
  writeFileSync(getStorePath(), JSON.stringify(store, null, 2), "utf-8");
}
