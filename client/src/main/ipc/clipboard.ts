import { clipboard, ipcMain } from "electron";

export function registerClipboardIpc() {
  ipcMain.handle("clipboard:writeText", (_event, text: string) => {
    clipboard.writeText(text);
  });
}
