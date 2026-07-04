import { ipcMain } from "electron";
import type { LoggerMode } from "../../shared/ipc-contract";
import type { LoggerProcessManager } from "../logger/process-manager";

export function registerLoggerIpc(manager: LoggerProcessManager) {
  ipcMain.handle("logger:start", (_event, mode: LoggerMode, extraArgs?: string[]) =>
    manager.start(mode, extraArgs ?? [])
  );
  ipcMain.handle("logger:stop", (_event, sessionId: string) => manager.stop(sessionId));
}
