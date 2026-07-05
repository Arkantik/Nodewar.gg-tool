import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuSkull } from "react-icons/lu";
import type { NamedLog } from "../create-config/config";
import Icon from "./Icon";

interface EnemyStatsProps {
	logs: NamedLog[];
	playerIndex: number;
	guildIndex: number;
}

interface PlayerData {
	name: string;
	guild: string;
	count: number;
}

const MAX_PLAYERS = 10;

function EnemyStats({ logs, playerIndex, guildIndex }: EnemyStatsProps) {
	const { t } = useTranslation();

	const players = useMemo(() => {
		const playerMap = new Map<string, PlayerData>();

		logs.forEach((log) => {
			const names = log.names.map((n) => n.name);
			if (names.length > playerIndex) {
				const name = names[playerIndex];
				if (!name || name === "-1" || name.trim() === "") return;

				const guildName = names.length > guildIndex ? names[guildIndex] : undefined;
				const existing = playerMap.get(name);
				if (existing) {
					existing.count += 1;
				} else {
					playerMap.set(name, { name, guild: guildName && guildName !== "-1" ? guildName : "", count: 1 });
				}
			}
		});

		return playerMap;
	}, [logs, playerIndex, guildIndex]);

	const sortedPlayers = Array.from(players.values())
		.sort((a, b) => b.count - a.count)
		.slice(0, MAX_PLAYERS);
	const maxCount = sortedPlayers[0]?.count ?? 0;

	return (
		<div className="glass-card rounded-md p-4 border border-white/10 h-full flex flex-col">
			<div className="flex items-center gap-2 mb-3">
				<Icon icon={LuSkull} size="sm" className="text-gray-500" />
				<h3 className="section-label">{t("enemyStats.title")}</h3>
			</div>

			<div className="flex-1 overflow-hidden">
				{sortedPlayers.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<p className="text-xs text-gray-500">{t("enemyStats.empty")}</p>
					</div>
				) : (
					<div className="h-full overflow-y-auto space-y-0.5">
						{sortedPlayers.map(({ name, guild, count }) => (
							<div key={name} className="flex items-center py-0.5 px-2 gap-1">
								<div className="flex-1 min-w-0">
									<p className="text-xs font-medium text-white truncate">{name}</p>
									{guild && <p className="text-[11px] text-gray-500 truncate">{guild}</p>}
								</div>
								<div className="w-12 h-1 rounded-full bg-white/5 overflow-hidden shrink-0">
									<div className="h-full bg-cta-500 rounded-full" style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }} />
								</div>
								<span className="text-xs font-semibold text-gray-400 w-4 text-right shrink-0">{count}</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default EnemyStats;
