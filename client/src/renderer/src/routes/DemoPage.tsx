import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuActivity, LuChartPie, LuInfo, LuOctagonPause, LuPlay, LuSkull, LuSword } from "react-icons/lu";
import type { LogType } from "../components/create-config/config";
import Logger from "../components/create-config/Logger";
import GuildStats from "../components/ui/GuildStats";
import Icon from "../components/ui/Icon";
import KDTimeline from "../components/ui/KDTimeline";
import StatCard from "../components/ui/StatCard";
import { DemoLogGenerator } from "../logic/demoGenerator";

function DemoPage() {
	const { t } = useTranslation();
	const [logs, setLogs] = useState<LogType[]>([]);
	const [stats, setStats] = useState({ kills: 0, deaths: 0, kdr: 0 });
	const [isRunning, setIsRunning] = useState(false);
	const [guildStatsKey, setGuildStatsKey] = useState({ playerTwo: 1, guild: 2 });
	const generatorRef = useRef<DemoLogGenerator | null>(null);

	useEffect(() => {
		generatorRef.current = new DemoLogGenerator();

		return () => {
			if (generatorRef.current) {
				generatorRef.current.stop();
			}
		};
	}, []);

	const handleStart = () => {
		if (!generatorRef.current || isRunning) return;

		setIsRunning(true);
		generatorRef.current.start((log: LogType) => {
			setLogs((prevLogs) => [...prevLogs, log]);
		}, 1500);
	};

	const handleStop = () => {
		if (!generatorRef.current) return;

		generatorRef.current.stop();
		setIsRunning(false);
	};

	const handleDeleteLog = (index: number) => {
		setLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
	};

	const handleIndicesChange = (indices: { playerTwo: number; guild: number }) => {
		setGuildStatsKey(indices);
	};

	const handleClearLogs = () => {
		setLogs([]);
		setStats({ kills: 0, deaths: 0, kdr: 0 });
	};

	return (
		<div className="flex flex-col h-full w-full p-8 gap-4">
			<div className="glass-card rounded-md p-4 border border-cta-500/50 bg-cta-500/5">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-cta-500/10 rounded-md">
							<Icon icon={LuInfo} className="text-cta-400" />
						</div>
						<div>
							<h3 className="text-sm font-bold text-white">{t("demo.title")}</h3>
							<p className="text-xs text-gray-400">{t("demo.description")}</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						{logs.length > 0 && (
							<button
								onClick={handleClearLogs}
								className="cursor-pointer px-4 py-2 rounded-md glass-card border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50 text-sm font-medium text-red-400">
								{t("demo.controls.clearLogs")}
							</button>
						)}

						{!isRunning ? (
							<button
								onClick={handleStart}
								className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md transition-all duration-150 ease-out active:scale-[0.97] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50 text-sm font-medium">
								<Icon icon={LuPlay} size="sm" />
								{t("demo.controls.startDemo")}
							</button>
						) : (
							<button
								onClick={handleStop}
								className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md transition-all duration-150 ease-out active:scale-[0.97] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50 text-sm font-medium">
								<Icon icon={LuOctagonPause} size="sm" />
								{t("demo.controls.stopDemo")}
							</button>
						)}
					</div>
				</div>
			</div>

			<div className="grid grid-cols-4 gap-4">
				<StatCard label={t("record.stats.events")} value={logs.length} icon={LuActivity} />

				<StatCard label={t("record.stats.kills")} value={stats.kills} icon={LuSword} valueColor="text-blue-400" />

				<StatCard label={t("record.stats.deaths")} value={stats.deaths} icon={LuSkull} valueColor="text-red-400" />

				<StatCard label={t("record.stats.kdRatio")} value={stats.kdr} icon={LuChartPie} valueColor={stats.kdr >= 1 ? "text-green-400" : "text-red-400"} />
			</div>

			<KDTimeline kdr={stats.kdr} kills={stats.kills} deaths={stats.deaths} />

			<div className="flex-1 flex gap-4 overflow-hidden">
				<div className="flex-1 glass-card rounded-md p-4 border border-white/10 overflow-hidden">
					<Logger logs={logs} onStatsUpdate={setStats} onDeleteLog={handleDeleteLog} onIndicesChange={handleIndicesChange} />
				</div>

				<div className="w-64 flex flex-col overflow-hidden">
					<GuildStats logs={logs} guildIndex={guildStatsKey.guild} playerIndex={guildStatsKey.playerTwo} />
				</div>
			</div>
		</div>
	);
}

export default DemoPage;
