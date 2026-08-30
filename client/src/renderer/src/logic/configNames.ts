import { hexToString, type Config, type LogType, type NamedLog } from "../components/create-config/config";
import { getNetworkIsKill } from "./deathLogs";

export function readNameAt(hex: string, offset: number): string {
	const decoded = hexToString(hex.slice(offset, offset + 64))
		.replaceAll("\0", "")
		.replaceAll(" ", "");
	// Network captures sometimes carry stray bytes around the name field (0xFF
	// filler, leftover buffer data, tabs). BDO names start with a capital letter
	// and only contain [A-Za-z0-9_], so anchor on the first real token and drop
	// the noise - mirrors the name validation done on the Python side.
	const match = decoded.match(/[A-Z][A-Za-z0-9_]*/);
	return match ? match[0] : decoded;
}

export function enrichLogs(logs: LogType[], config: Pick<Config, "guild" | "player_two"> | null, guildStatsKey: { playerTwo: number; guild: number }, killOffset: number | undefined): NamedLog[] {
	return logs.map((log) => {
		const names = log.names.map((n) => ({ name: n.name }));
		if (config) {
			if (names[guildStatsKey.guild]) names[guildStatsKey.guild] = { name: readNameAt(log.hex, config.guild) };
			if (names[guildStatsKey.playerTwo]) names[guildStatsKey.playerTwo] = { name: readNameAt(log.hex, config.player_two) };
		}
		return { names, isKill: getNetworkIsKill(log.hex, killOffset) };
	});
}
