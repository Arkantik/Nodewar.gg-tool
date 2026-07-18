import { app, Menu, Tray, type BrowserWindow } from "electron";
import type { AppAction, RecordingStatus } from "../shared/ipc-contract";
import { resolveTrayIconPath } from "./resources";

export interface TrayApi {
  setRecordingStatus: (status: RecordingStatus) => void;
  getStatus: () => RecordingStatus;
  destroy: () => void;
}

export function setupTray(getWindow: () => BrowserWindow | null, send: (action: AppAction) => void): TrayApi {
  const tray = new Tray(resolveTrayIconPath());
  let status: RecordingStatus = "idle";

  function showWindow() {
    const win = getWindow();
    if (!win) return;
    win.show();
    win.focus();
  }

  function buildMenu() {
    return Menu.buildFromTemplate([
      { label: "Show Nodewar.gg Tool", click: showWindow },
      { type: "separator" },
      { label: "Stop & Save", enabled: status === "recording", click: () => send("stop-and-save") },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() }
    ]);
  }

  tray.setToolTip("Nodewar.gg Tool");
  tray.setContextMenu(buildMenu());
  tray.on("click", showWindow);

  return {
    setRecordingStatus(next) {
      status = next;
      tray.setToolTip(next === "recording" ? "Nodewar.gg Tool - Recording" : "Nodewar.gg Tool");
      tray.setContextMenu(buildMenu());
    },
    getStatus() {
      return status;
    },
    destroy() {
      tray.destroy();
    }
  };
}
