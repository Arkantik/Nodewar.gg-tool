import type { Log, LogType } from "../components/create-config/config";

const TEXT_LOG_REGEX = /\[(.+)\] (\w+) (died to|has killed|killed|was slain by) (\w+) (?:from|of|from the) (?:the )?(\w+|-1)(?: \((\w+),(\w+)\))?( \{[^}]*\})?/;

export function parseTextLog(data: string): Log[] {
	const lines = data.split("\n");
	const newCombatLogs: Log[] = [];

	for (const line of lines) {
		const match = line.match(TEXT_LOG_REGEX);
		if (match) {
			newCombatLogs.push({
				time: match[1],
				names: [match[2], match[4], match[5], match[6] || "", match[7] || ""].filter((n) => n),
				kill: match[3] === "has killed" || match[3] === "killed",
				coords: match[8] || "",
			});
		}
	}

	return newCombatLogs;
}

export function parseLoggerLine(data: string): LogType | null {
	const d = data.split(",");
	if (d.length !== 8 || data.includes("Network Interfaces:")) return null;

	const names: LogType["names"] = [];
	for (const name of d.slice(2, 7)) {
		const split = name.split(" ");
		const offset = +split[1];
		if (split[0] === undefined || Number.isNaN(offset)) return null;
		names.push({ name: split[0], offset });
	}

	return {
		identifier: d[0],
		time: d[1],
		names,
		hex: d[7],
	};
}

export function appendUniqueLog(prevLogs: LogType[], newLog: LogType): LogType[] {
	const exists = prevLogs.some((log) => log.identifier === newLog.identifier && log.time === newLog.time && log.names.length === newLog.names.length && log.names.every((name, i) => name.name === newLog.names[i].name));

	if (exists) return prevLogs;
	return [...prevLogs, newLog];
}
