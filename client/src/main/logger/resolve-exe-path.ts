import { app } from "electron";
import { join } from "node:path";

const LOGGER_BIN_NAME = process.platform === "win32" ? "logger.exe" : "logger";

export function resolveLoggerExePath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, "logger", LOGGER_BIN_NAME);
  }
  return join(app.getAppPath(), "..", "logger", "dist", LOGGER_BIN_NAME);
}
