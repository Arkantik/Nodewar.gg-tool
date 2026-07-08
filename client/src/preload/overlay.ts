import { contextBridge, ipcRenderer } from "electron";
import type { OverlayPreloadApi, OverlayStats } from "../shared/ipc-contract";

function subscribe<T>(channel: string, cb: (payload: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => cb(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const overlayApi: OverlayPreloadApi = {
  onStats: (cb) => subscribe<OverlayStats>("overlay:stats", cb)
};

contextBridge.exposeInMainWorld("overlayApi", overlayApi);
