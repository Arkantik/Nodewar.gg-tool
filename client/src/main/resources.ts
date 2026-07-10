import { app } from "electron";
import { join } from "node:path";

export function resolveTrayIconPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, "tray-icon.ico");
  }
  return join(app.getAppPath(), "..", "logger", "icon", "icon-2.ico");
}
