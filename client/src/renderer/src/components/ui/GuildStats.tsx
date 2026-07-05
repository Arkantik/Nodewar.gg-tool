import { useEffect, useState } from "react";
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
}

function GuildStats({ logs, guildIndex, playerIndex }: GuildStatsProps) {
	const { t } = useTranslation();
	const [guilds, setGuilds] = useState<Map<string, GuildData>>(new Map());

	const calculateGuilds = () => {
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
					guildMap.set(guildName, {
						name: guildName,
						members: new Set<string>(),
					});
				}

				guildMap.get(guildName)!.members.add(playerName);
			}
		});

		setGuilds(guildMap);
	};

	useEffect(() => {
		calculateGuilds();
	}, [logs, guildIndex, playerIndex]);

	const sortedGuilds = Array.from(guilds.values()).sort((a, b) => {
		return b.members.size - a.members.size;
	});
	const maxMembers = sortedGuilds[0]?.members.size ?? 0;

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
						{sortedGuilds.map((guild, index) => (
							<div key={guild.name} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-white/5">
								<span className="w-5 h-5 flex items-center justify-center rounded bg-white/5 text-[10px] font-semibold text-gray-400 shrink-0">{index + 1}</span>
								<span className="flex-1 text-sm font-medium text-white truncate">{guild.name}</span>
								<div className="w-12 h-1 rounded-full bg-white/5 overflow-hidden shrink-0">
									<div className="h-full bg-cta-500 rounded-full" style={{ width: `${maxMembers > 0 ? (guild.members.size / maxMembers) * 100 : 0}%` }} />
								</div>
								<span className="text-xs font-semibold text-gray-400 w-4 text-right shrink-0">{guild.members.size}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default GuildStats;
