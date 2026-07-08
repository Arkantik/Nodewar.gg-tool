import { ipcMain } from "electron";
import { DEFAULT_OVERLAY_SETTINGS, type OverlayPayload, type OverlaySettings, type OverlaySize } from "../../shared/ipc-contract";
import type { OverlayController } from "../overlay";
import { getValue, setValue } from "../store";

const OVERLAY_SETTINGS_KEY = "overlaySettings";

export function registerOverlayIpc(getOverlay: () => OverlayController | null) {
  ipcMain.handle("overlay:pushPayload", (_event, payload: OverlayPayload) => {
    getOverlay()?.pushPayload(payload);
  });

  ipcMain.on("overlay:reportSize", (_event, size: OverlaySize) => {
    getOverlay()?.reportContentSize(size);
  });

  ipcMain.handle("overlay:getSettings", (): OverlaySettings => {
    return getValue<OverlaySettings>(OVERLAY_SETTINGS_KEY) ?? DEFAULT_OVERLAY_SETTINGS;
  });

  ipcMain.handle("overlay:setSettings", (_event, partial: Partial<OverlaySettings>): OverlaySettings => {
    const current = getValue<OverlaySettings>(OVERLAY_SETTINGS_KEY) ?? DEFAULT_OVERLAY_SETTINGS;
    const next = { ...current, ...partial };
    setValue(OVERLAY_SETTINGS_KEY, next);
    getOverlay()?.updateSettings(next);
    return next;
  });
}
