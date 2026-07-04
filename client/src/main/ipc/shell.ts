import { ipcMain, shell } from "electron";

export function registerShellIpc() {
  ipcMain.handle("shell:openExternal", async (_event, url: string) => {
    if (!/^https?:\/\//i.test(url)) {
      throw new Error(`Refusing to open non-http(s) URL: ${url}`);
    }
    await shell.openExternal(url);
  });
}
