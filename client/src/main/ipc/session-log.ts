import { ipcMain } from "electron";
import type { SessionLogMeta } from "../../shared/ipc-contract";
import { appendLines, beginSession, discardSession, listOrphanedSessions, setMeta } from "../session-log";

export function registerSessionLogIpc() {
  ipcMain.handle("sessionLog:begin", (_event, sessionId: string) => beginSession(sessionId));
  ipcMain.handle("sessionLog:append", (_event, sessionId: string, lines: string[]) => appendLines(sessionId, lines));
  ipcMain.handle("sessionLog:setMeta", (_event, sessionId: string, meta: SessionLogMeta) => setMeta(sessionId, meta));
  ipcMain.handle("sessionLog:discard", (_event, sessionId: string) => discardSession(sessionId));
  ipcMain.handle("sessionLog:listOrphaned", () => listOrphanedSessions());
}
