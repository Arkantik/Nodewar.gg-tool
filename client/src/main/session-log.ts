import { app } from "electron";
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { OrphanedSession, SessionLogMeta } from "../shared/ipc-contract";

const META_SUFFIX = ".meta.json";

function getSessionsDir(): string {
  const dir = join(app.getPath("userData"), "sessions");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function sessionPaths(sessionId: string) {
  const dir = getSessionsDir();
  return { logPath: join(dir, `${sessionId}.jsonl`), metaPath: join(dir, `${sessionId}${META_SUFFIX}`) };
}

export function beginSession(sessionId: string): void {
  const { logPath, metaPath } = sessionPaths(sessionId);
  writeFileSync(logPath, "", "utf-8");
  const meta: SessionLogMeta = { killOffset: undefined, guildStatsKey: { playerTwo: 1, guild: 2 } };
  writeFileSync(metaPath, JSON.stringify(meta), "utf-8");
}

export function appendLines(sessionId: string, lines: string[]): void {
  if (lines.length === 0) return;
  const { logPath } = sessionPaths(sessionId);
  appendFileSync(logPath, lines.map((line) => line + "\n").join(""), "utf-8");
}

export function setMeta(sessionId: string, meta: SessionLogMeta): void {
  const { metaPath } = sessionPaths(sessionId);
  writeFileSync(metaPath, JSON.stringify(meta), "utf-8");
}

export function discardSession(sessionId: string): void {
  const { logPath, metaPath } = sessionPaths(sessionId);
  rmSync(logPath, { force: true });
  rmSync(metaPath, { force: true });
}

export function listOrphanedSessions(): OrphanedSession[] {
  const dir = getSessionsDir();
  const orphaned: OrphanedSession[] = [];

  for (const file of readdirSync(dir)) {
    if (!file.endsWith(META_SUFFIX)) continue;
    const sessionId = file.slice(0, -META_SUFFIX.length);
    const { logPath, metaPath } = sessionPaths(sessionId);

    let meta: SessionLogMeta;
    try {
      meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    } catch {
      continue;
    }

    if (!existsSync(logPath)) continue;
    const lines = readFileSync(logPath, "utf-8")
      .split("\n")
      .filter((line) => line.trim().length > 0);
    if (lines.length === 0) continue;

    orphaned.push({ sessionId, lines, meta });
  }

  return orphaned;
}
