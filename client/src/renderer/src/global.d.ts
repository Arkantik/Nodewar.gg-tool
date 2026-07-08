import type { IpcApi, OverlayPreloadApi } from "../../shared/ipc-contract";

declare global {
  interface Window {
    api: IpcApi;
    overlayApi: OverlayPreloadApi;
  }
}

export {};
