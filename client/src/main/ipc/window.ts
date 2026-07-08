import { type BrowserWindow, ipcMain } from "electron";

export function registerWindowIpc(getWindow: () => BrowserWindow | null) {
  ipcMain.handle("window:minimize", () => {
    getWindow()?.minimize();
  });

  ipcMain.handle("window:toggleMaximize", () => {
    const win = getWindow();
    if (!win) return;
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });

  ipcMain.handle("window:close", () => {
    getWindow()?.close();
  });

  ipcMain.handle("window:isMaximized", () => getWindow()?.isMaximized() ?? false);
}
