import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { LuSkull } from "react-icons/lu";
import type { NamedLog } from "../create-config/config";
import { aggregatePlayers } from "../../logic/enemyAggregation";
import Icon from "./Icon";

interface EnemyStatsProps {
	logs: NamedLog[];
	playerIndex: number;
	guildIndex: number;
}

const MAX_PLAYERS = 10;

function EnemyStats({ logs, playerIndex, guildIndex }: EnemyStatsProps) {
	const { t } = useTranslation();

	const sortedPlayers = useMemo(() => aggregatePlayers(logs, playerIndex, guildIndex, MAX_PLAYERS), [logs, playerIndex, guildIndex]);

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
						{sortedPlayers.map(({ name, guild, kills, deaths }) => {
							const total = kills + deaths;
							const killShare = total > 0 ? (kills / total) * 100 : 0;

							return (
								<div key={name} className="flex items-center py-0.5 px-2 gap-2">
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium text-white truncate">{name}</p>
										{guild && <p className="text-[11px] text-gray-500 truncate">{guild}</p>}
									</div>

									<span className="text-xs font-semibold text-green-400/80 w-5 text-right shrink-0">{kills}</span>

									{total > 0 ? (
										<div className="w-10 h-1 rounded-full bg-white/5 overflow-hidden shrink-0 flex">
											<div className="h-full bg-green-500/70" style={{ width: `${killShare}%` }} />
											<div className="h-full bg-red-500/70" style={{ width: `${100 - killShare}%` }} />
										</div>
									) : (
										<div className="w-10 h-1 rounded-full bg-white/10 shrink-0" />
									)}

									<span className="text-xs font-semibold text-red-400/80 w-5 shrink-0">{deaths}</span>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}

export default EnemyStats;
