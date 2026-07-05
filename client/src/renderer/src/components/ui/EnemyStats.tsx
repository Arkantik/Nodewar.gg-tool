import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCrosshair } from "react-icons/lu";
import type { NamedLog } from "../create-config/config";
import Icon from "./Icon";

interface EnemyStatsProps {
	logs: NamedLog[];
	playerIndex: number;
}

function EnemyStats({ logs, playerIndex }: EnemyStatsProps) {
	const { t } = useTranslation();
	const [enemies, setEnemies] = useState<Map<string, number>>(new Map());

	useEffect(() => {
		const enemyMap = new Map<string, number>();

		logs.forEach((log) => {
			const names = log.names.map((n) => n.name);
			if (names.length > playerIndex) {
				const name = names[playerIndex];
				if (!name || name === "-1" || name.trim() === "") return;

				enemyMap.set(name, (enemyMap.get(name) || 0) + 1);
			}
		});

		setEnemies(enemyMap);
	}, [logs, playerIndex]);

	const sortedEnemies = Array.from(enemies.entries()).sort((a, b) => b[1] - a[1]);
	const maxCount = sortedEnemies[0]?.[1] ?? 0;

	return (
		<div className="glass-card rounded-md p-4 border border-white/10 h-full flex flex-col">
			<div className="flex items-center gap-2 mb-3">
				<Icon icon={LuCrosshair} size="sm" className="text-gray-500" />
				<h3 className="section-label">{t("enemyStats.title")}</h3>
			</div>

			<div className="flex-1 overflow-hidden">
				{sortedEnemies.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<p className="text-xs text-gray-500">{t("enemyStats.empty")}</p>
					</div>
				) : (
					<div className="h-full overflow-y-auto space-y-1.5">
						{sortedEnemies.map(([name, count], index) => (
							<div key={name} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-white/5">
								<span className="w-5 h-5 flex items-center justify-center rounded bg-white/5 text-[10px] font-semibold text-gray-400 shrink-0">{index + 1}</span>
								<span className="flex-1 text-sm font-medium text-white truncate">{name}</span>
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
