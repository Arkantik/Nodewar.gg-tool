import { ipcMain } from "electron";
import { getValue, setValue } from "../store";

export function registerConfigIpc() {
  ipcMain.handle("config:get", (_event, key: string) => getValue(key));
  ipcMain.handle("config:set", (_event, key: string, value: unknown) => setValue(key, value));
}
