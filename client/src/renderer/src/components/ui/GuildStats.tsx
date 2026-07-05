import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuUsers } from "react-icons/lu";
import type { NamedLog } from "../create-config/config";
import Icon from "./Icon";

interface GuildStatsProps {
	logs: NamedLog[];
	guildIndex: number;
	playerIndex: number;
}

interface GuildData {
	name: string;
	members: Set<string>;
	kills: number;
	deaths: number;
}

function GuildStats({ logs, guildIndex, playerIndex }: GuildStatsProps) {
	const { t } = useTranslation();

	const guilds = useMemo(() => {
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
				if (log.isKill === true) guild.kills++;
				else if (log.isKill === false) guild.deaths++;
			}
		});

		return guildMap;
	}, [logs, guildIndex, playerIndex]);

	const sortedGuilds = Array.from(guilds.values()).sort((a, b) => {
		return b.members.size - a.members.size;
	});

	return (
		<div className="glass-card rounded-md p-4 border border-white/10 h-full flex flex-col">
			<div className="flex items-center gap-2 mb-3">
				<Icon icon={LuUsers} size="sm" className="text-gray-500" />
				<h3 className="section-label">{t("guildStats.title")}</h3>
			</div>

			<div className="flex-1 overflow-hidden">
				{sortedGuilds.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<p className="text-xs text-gray-500">{t("guildStats.empty")}</p>
					</div>
				) : (
					<div className="h-full overflow-y-auto space-y-1.5">
						{sortedGuilds.map((guild) => {
							const total = guild.kills + guild.deaths;
							const killShare = total > 0 ? (guild.kills / total) * 100 : 0;

							return (
								<div key={guild.name} className="flex items-center py-1.5 px-2 gap-2">
									<div className="flex-1 min-w-0 flex items-baseline gap-1">
										<span className="text-xs font-medium text-white truncate">{guild.name}</span>
										<span className="text-[11px] text-gray-500 shrink-0">({guild.members.size})</span>
									</div>

									<span className="text-xs font-semibold text-green-400/80 w-5 text-right shrink-0">{guild.kills}</span>

									{total > 0 ? (
										<div className="w-10 h-1 rounded-full bg-white/5 overflow-hidden shrink-0 flex">
											<div className="h-full bg-green-500/70" style={{ width: `${killShare}%` }} />
											<div className="h-full bg-red-500/70" style={{ width: `${100 - killShare}%` }} />
										</div>
									) : (
										<div className="w-10 h-1 rounded-full bg-white/10 shrink-0" />
									)}

									<span className="text-xs font-semibold text-red-400/80 w-5 shrink-0">{guild.deaths}</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export default GuildStats;
