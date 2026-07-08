import { contextBridge, ipcRenderer } from "electron";
import type {
  AppAction,
  IpcApi,
  LoggerEvent,
  LoggerMode,
  OpenFileOptions,
  OverlayPayload,
  OverlaySettings,
  RecordingStatus,
  SaveFileOptions,
  SessionLogMeta,
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
  },
  tray: {
    setRecordingStatus: (status: RecordingStatus) => ipcRenderer.invoke("tray:setRecordingStatus", status)
  },
  commands: {
    onTrigger: (cb) => subscribe<AppAction>("commands:trigger", cb)
  },
  hotkey: {
    get: () => ipcRenderer.invoke("hotkey:get"),
    set: (accelerator: string) => ipcRenderer.invoke("hotkey:set", accelerator),
    pause: () => ipcRenderer.invoke("hotkey:pause"),
    resume: () => ipcRenderer.invoke("hotkey:resume")
  },
  overlay: {
    pushPayload: (payload: OverlayPayload) => ipcRenderer.invoke("overlay:pushPayload", payload),
    getSettings: () => ipcRenderer.invoke("overlay:getSettings"),
    setSettings: (settings: Partial<OverlaySettings>) => ipcRenderer.invoke("overlay:setSettings", settings)
  },
  sessionLog: {
    begin: (sessionId: string) => ipcRenderer.invoke("sessionLog:begin", sessionId),
    append: (sessionId: string, lines: string[]) => ipcRenderer.invoke("sessionLog:append", sessionId, lines),
    setMeta: (sessionId: string, meta: SessionLogMeta) => ipcRenderer.invoke("sessionLog:setMeta", sessionId, meta),
    discard: (sessionId: string) => ipcRenderer.invoke("sessionLog:discard", sessionId),
    listOrphaned: () => ipcRenderer.invoke("sessionLog:listOrphaned")
  },
  window: {
    minimize: () => ipcRenderer.invoke("window:minimize"),
    toggleMaximize: () => ipcRenderer.invoke("window:toggleMaximize"),
    close: () => ipcRenderer.invoke("window:close"),
    isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
    onStateChanged: (cb) => subscribe<boolean>("window:stateChanged", cb)
  }
};

contextBridge.exposeInMainWorld("api", api);
