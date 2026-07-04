import { type BrowserWindow, dialog, ipcMain } from "electron";
import type { OpenFileOptions, SaveFileOptions } from "../../shared/ipc-contract";

export function registerDialogIpc(getWindow: () => BrowserWindow | null) {
  ipcMain.handle("dialog:openFile", async (_event, options?: OpenFileOptions) => {
    const win = getWindow();
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters,
      properties: ["openFile"]
    });
    return result.canceled ? null : result.filePaths;
  });

  ipcMain.handle("dialog:saveFile", async (_event, options?: SaveFileOptions) => {
    const win = getWindow();
    if (!win) return null;
    const result = await dialog.showSaveDialog(win, {
      title: options?.title,
      defaultPath: options?.defaultPath,
      filters: options?.filters
    });
    return result.canceled || !result.filePath ? null : result.filePath;
  });
}
