import { ipcMain } from "electron";
import type { OverlayStats } from "../../shared/ipc-contract";
import type { OverlayController } from "../overlay";

export function registerOverlayIpc(getOverlay: () => OverlayController | null) {
  ipcMain.handle("overlay:pushStats", (_event, stats: OverlayStats) => {
    getOverlay()?.pushStats(stats);
  });
}
