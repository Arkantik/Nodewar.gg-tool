import { app } from "electron";
import { join } from "node:path";

export function resolveLoggerExePath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, "logger", "logger.exe");
  }
  return join(app.getAppPath(), "..", "logger", "dist", "logger.exe");
}
