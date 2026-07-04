import { contextBridge, ipcRenderer } from "electron";
import type {
  IpcApi,
  LoggerEvent,
  LoggerMode,
  OpenFileOptions,
  SaveFileOptions,
  UpdaterEvent
} from "../shared/ipc-contract";

function subscribe<T>(channel: string, cb: (payload: T) => void): () => void {
  const listener = (_event: Electron.IpcRendererEvent, payload: T) => cb(payload);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

const api: IpcApi = {
  logger: {
    start: (mode: LoggerMode, extraArgs?: string[]) => ipcRenderer.invoke("logger:start", mode, extraArgs),
    stop: (sessionId: string) => ipcRenderer.invoke("logger:stop", sessionId),
    onEvent: (cb) => subscribe<LoggerEvent>("logger:event", cb)
  },
  dialog: {
    openFile: (options?: OpenFileOptions) => ipcRenderer.invoke("dialog:openFile", options),
    saveFile: (options?: SaveFileOptions) => ipcRenderer.invoke("dialog:saveFile", options)
  },
  fs: {
    readTextFile: (path: string) => ipcRenderer.invoke("fs:readTextFile", path),
    writeFile: (path: string, contents: string) => ipcRenderer.invoke("fs:writeFile", path, contents)
  },
  clipboard: {
    writeText: (text: string) => ipcRenderer.invoke("clipboard:writeText", text)
  },
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url)
  },
  config: {
    get: (key: string) => ipcRenderer.invoke("config:get", key),
    set: (key: string, value: unknown) => ipcRenderer.invoke("config:set", key, value)
  },
  updater: {
    check: () => ipcRenderer.invoke("updater:check"),
    download: () => ipcRenderer.invoke("updater:download"),
    onEvent: (cb) => subscribe<UpdaterEvent>("updater:event", cb)
  },
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
    exit: () => ipcRenderer.invoke("app:exit")
  }
};

contextBridge.exposeInMainWorld("api", api);
