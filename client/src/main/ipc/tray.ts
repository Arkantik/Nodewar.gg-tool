import { ipcMain } from "electron";
import type { RecordingStatus } from "../../shared/ipc-contract";
import type { OverlayController } from "../overlay";
import type { TrayApi } from "../tray";

export function registerTrayIpc(getTray: () => TrayApi | null, getOverlay: () => OverlayController | null) {
  ipcMain.handle("tray:setRecordingStatus", (_event, status: RecordingStatus) => {
    getTray()?.setRecordingStatus(status);
    if (status === "recording") {
      getOverlay()?.show();
    } else {
      getOverlay()?.hide();
    }
  });
}
