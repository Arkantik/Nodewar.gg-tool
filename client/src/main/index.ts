import { app, BrowserWindow, Menu, shell } from "electron";
import { join } from "node:path";
import { registerAppIpc } from "./ipc/app";
import { registerClipboardIpc } from "./ipc/clipboard";
import { registerConfigIpc } from "./ipc/config";
import { registerDialogIpc } from "./ipc/dialogs";
import { registerFsIpc } from "./ipc/fs";
import { registerLoggerIpc } from "./ipc/logger";
import { registerShellIpc } from "./ipc/shell";
import { registerUpdaterIpc } from "./ipc/updater";
import { LoggerProcessManager } from "./logger/process-manager";
import { setupUpdater } from "./updater";

let mainWindow: BrowserWindow | null = null;
const getWindow = () => mainWindow;

const loggerManager = new LoggerProcessManager((evt) => {
  mainWindow?.webContents.send("logger:event", evt);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    resizable: true,
    show: false,
    icon: app.isPackaged ? undefined : join(app.getAppPath(), "..", "logger", "icon", "icon-2.ico"),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());

  mainWindow.on("close", () => {
    void loggerManager.stop();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;
  const isAppUrl = (url: string) => (rendererUrl ? url.startsWith(rendererUrl) : url.startsWith("file://"));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    void shell.openExternal(url);
  });

  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);

  registerLoggerIpc(loggerManager);
  registerDialogIpc(getWindow);
  registerFsIpc();
  registerClipboardIpc();
  registerConfigIpc();
  registerShellIpc();
  registerUpdaterIpc(setupUpdater(getWindow));
  registerAppIpc();

  createWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
