import { contextBridge, ipcRenderer } from "electron";
import type { OverlayPayload, OverlayPreloadApi, OverlaySettings, OverlaySize } from "../shared/ipc-contract";

function subscribe<T>(channel: string, cb: (payload: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => cb(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const overlayApi: OverlayPreloadApi = {
  onPayload: (cb) => subscribe<OverlayPayload>("overlay:payload", cb),
  onSettings: (cb) => subscribe<OverlaySettings>("overlay:settings", cb),
  reportSize: (size: OverlaySize) => ipcRenderer.send("overlay:reportSize", size)
};

contextBridge.exposeInMainWorld("overlayApi", overlayApi);
