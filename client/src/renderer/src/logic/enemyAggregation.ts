import type { NamedLog } from "../components/create-config/config";

export interface GuildData {
	name: string;
	members: Set<string>;
	kills: number;
	deaths: number;
}

export interface PlayerData {
	name: string;
	guild: string;
	kills: number;
	deaths: number;
}

export function kdRatio(kills: number, deaths: number): number {
	return deaths > 0 ? kills / deaths : kills;
}

export function aggregateGuilds(logs: NamedLog[], guildIndex: number, playerIndex: number): GuildData[] {
	const guildMap = new Map<string, GuildData>();

	logs.forEach((log) => {
		const names = log.names.map((n) => n.name);

		// The format is: [PlayerOne, PlayerTwo, Guild, Character1, Character2]
		// PlayerTwo (index 1) belongs to Guild (index 2)
		if (names.length > Math.max(guildIndex, playerIndex)) {
			const playerName = names[playerIndex];
			const guildName = names[guildIndex];

			if (!guildName || guildName === "-1" || guildName.trim() === "") return;
			if (!playerName || playerName === "-1" || playerName.trim() === "") return;

			if (!guildMap.has(guildName)) {
				guildMap.set(guildName, { name: guildName, members: new Set<string>(), kills: 0, deaths: 0 });
			}

			const guild = guildMap.get(guildName)!;
			guild.members.add(playerName);
			if (log.isKill === true) guild.deaths++;
			else if (log.isKill === false) guild.kills++;
		}
	});

	return Array.from(guildMap.values()).sort((a, b) => b.members.size - a.members.size);
}

export function aggregatePlayers(logs: NamedLog[], playerIndex: number, guildIndex: number, max = 10): PlayerData[] {
	const playerMap = new Map<string, PlayerData>();

	logs.forEach((log) => {
		const names = log.names.map((n) => n.name);
		if (names.length > playerIndex) {
			const name = names[playerIndex];
			if (!name || name === "-1" || name.trim() === "") return;

			const guildName = names.length > guildIndex ? names[guildIndex] : undefined;
			const existing = playerMap.get(name);
			const player = existing ?? { name, guild: guildName && guildName !== "-1" ? guildName : "", kills: 0, deaths: 0 };

			if (log.isKill === true) player.deaths++;
			else if (log.isKill === false) player.kills++;

			playerMap.set(name, player);
		}
	});

	return Array.from(playerMap.values())
		.sort((a, b) => kdRatio(b.kills, b.deaths) - kdRatio(a.kills, a.deaths) || b.kills - a.kills)
		.slice(0, max);
}
