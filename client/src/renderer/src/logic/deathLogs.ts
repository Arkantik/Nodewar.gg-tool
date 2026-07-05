import type { Log, LogType } from "../components/create-config/config";

/** Network-captured logs encode kill/death as a "1"/not-"1" byte at a heuristically detected hex offset. */
export function getNetworkDeathLogs<T extends Pick<LogType, "hex">>(logs: T[], killOffset: number | undefined): T[] {
  if (killOffset === undefined) return [];
  return logs.filter((log) => log.hex.length > killOffset && log.hex[killOffset] !== "1");
}

/** Text-log-derived entries already carry an explicit `kill` boolean. */
export function getCombatDeathLogs<T extends Pick<Log, "kill">>(logs: T[]): T[] {
  return logs.filter((log) => !log.kill);
}
