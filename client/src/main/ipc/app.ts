import { app, ipcMain } from "electron";

export function registerAppIpc() {
  ipcMain.handle("app:getVersion", () => app.getVersion());
  ipcMain.handle("app:exit", () => {
    app.quit();
  });
}
