import type { Config, LogType, NamedLog } from "../components/create-config/config";
import { getNetworkIsKill } from "./deathLogs";
import { readNameAt } from "./offsetHeuristics";

export function enrichLogs(
	logs: LogType[],
	config: Pick<Config, "guild" | "player_two"> | null,
	guildStatsKey: { playerTwo: number; guild: number },
	killOffset: number | undefined,
): NamedLog[] {
	return logs.map((log) => {
		const names = log.names.map((n) => ({ name: n.name }));
		if (config) {
			if (names[guildStatsKey.guild]) names[guildStatsKey.guild] = { name: readNameAt(log.hex, config.guild) };
			if (names[guildStatsKey.playerTwo]) names[guildStatsKey.playerTwo] = { name: readNameAt(log.hex, config.player_two) };
		}
		return { names, isKill: getNetworkIsKill(log.hex, killOffset) };
	});
}

export { readNameAt };
