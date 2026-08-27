import { ipcMain } from "electron";
import type { createVersionManager } from "../version-manager";

export function registerVersionsIpc(manager: ReturnType<typeof createVersionManager>) {
	ipcMain.handle("versions:list", () => manager.list());
	ipcMain.handle("versions:downgradeTo", (_event, tag: string) => manager.downgradeTo(tag));
}
