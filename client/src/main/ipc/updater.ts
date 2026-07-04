import { ipcMain } from "electron";

interface UpdaterActions {
  check: () => Promise<void>;
  download: () => Promise<void>;
}

export function registerUpdaterIpc(updater: UpdaterActions) {
  ipcMain.handle("updater:check", () => updater.check());
  ipcMain.handle("updater:download", () => updater.download());
}
