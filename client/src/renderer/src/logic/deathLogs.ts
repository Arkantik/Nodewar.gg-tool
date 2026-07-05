import type { Log, LogType } from "../components/create-config/config";

/** Network-captured logs encode kill/death as a "1"/not-"1" byte at a heuristically detected hex offset. */
export function getNetworkIsKill(hex: string, killOffset: number | undefined): boolean | undefined {
  if (killOffset === undefined || hex.length <= killOffset) return undefined;
  return hex[killOffset] === "1";
}

export function getNetworkDeathLogs<T extends Pick<LogType, "hex">>(logs: T[], killOffset: number | undefined): T[] {
  if (killOffset === undefined) return [];
  return logs.filter((log) => getNetworkIsKill(log.hex, killOffset) === false);
}

/** Text-log-derived entries already carry an explicit `kill` boolean. */
export function getCombatDeathLogs<T extends Pick<Log, "kill">>(logs: T[]): T[] {
  return logs.filter((log) => !log.kill);
}
