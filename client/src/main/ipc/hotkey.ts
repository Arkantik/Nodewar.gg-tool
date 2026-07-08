import { ipcMain } from "electron";
import type { HotkeyApi } from "../hotkey";

export function registerHotkeyIpc(getHotkey: () => HotkeyApi | null) {
  ipcMain.handle("hotkey:get", () => getHotkey()?.getAccelerator() ?? null);
  ipcMain.handle("hotkey:set", (_event, accelerator: string) => ({
    success: getHotkey()?.setAccelerator(accelerator) ?? false
  }));
  ipcMain.handle("hotkey:pause", () => getHotkey()?.pause());
  ipcMain.handle("hotkey:resume", () => getHotkey()?.resume());
}
