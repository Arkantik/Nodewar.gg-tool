import Button from "@/components/ui/Button";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuActivity, LuChartPie, LuInfo, LuOctagonPause, LuPlay, LuSkull, LuSword } from "react-icons/lu";
import type { LogType } from "../components/create-config/config";
import Logger from "../components/create-config/Logger";
import EnemyStats from "../components/ui/EnemyStats";
import GuildStats from "../components/ui/GuildStats";
import Icon from "../components/ui/Icon";
import KDTimeline from "../components/ui/KDTimeline";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { DemoLogGenerator } from "../logic/demoGenerator";
import { useElementHeight } from "../logic/useElementHeight";

function DemoPage() {
	const { t } = useTranslation();
	const [logs, setLogs] = useState<LogType[]>([]);
	const [stats, setStats] = useState({ kills: 0, deaths: 0, kdr: 0 });
	const [isRunning, setIsRunning] = useState(false);
	const [guildStatsKey, setGuildStatsKey] = useState({ playerTwo: 1, guild: 2 });
	const generatorRef = useRef<DemoLogGenerator | null>(null);
	const { ref: headerBlockRef, height: headerBlockHeight } = useElementHeight<HTMLDivElement>();

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
		<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] grid-rows-[auto_minmax(0,1fr)] gap-4 h-full w-full p-8">
			<div ref={headerBlockRef} className="flex flex-col gap-4 min-w-0">
				<PageHeader
					icon={LuInfo}
					title={t("demo.title")}
					subtitle={t("demo.description")}
					cardHighlight
					iconAccent
					action={
						<div className="flex items-center gap-2">
							{logs.length > 0 && (
								<Button
									onClick={handleClearLogs}
									size="sm"
									className="glass-card border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-sm font-medium text-red-400">
									{t("demo.controls.clearLogs")}
								</Button>
							)}

							{!isRunning ? (
								<Button onClick={handleStart} size="sm" className="bg-green-600 hover:bg-green-500 text-white">
									<Icon icon={LuPlay} size="sm" className="mr-1" />
									{t("demo.controls.startDemo")}
								</Button>
							) : (
								<Button onClick={handleStop} size="sm" className="bg-red-600 hover:bg-red-500 text-white">
									<Icon icon={LuOctagonPause} size="sm" className="mr-1" />
									{t("demo.controls.stopDemo")}
								</Button>
							)}
						</div>
					}
				/>

				<div className="grid grid-cols-4 gap-4">
					<StatCard label={t("record.stats.events")} value={logs.length} icon={LuActivity} />

					<StatCard label={t("record.stats.kills")} value={stats.kills} icon={LuSword} valueColor="text-blue-400" />

					<StatCard label={t("record.stats.deaths")} value={stats.deaths} icon={LuSkull} valueColor="text-red-400" />

					<StatCard label={t("record.stats.kdRatio")} value={stats.kdr} icon={LuChartPie} valueColor={stats.kdr >= 1 ? "text-green-400" : "text-red-400"} />
				</div>

				<KDTimeline kdr={stats.kdr} kills={stats.kills} deaths={stats.deaths} />
			</div>

			<div className="hidden lg:flex lg:flex-col gap-4 overflow-hidden min-h-0 row-span-2">
				<div className="shrink-0 overflow-hidden" style={{ height: headerBlockHeight || undefined }}>
					<GuildStats logs={logs} guildIndex={guildStatsKey.guild} playerIndex={guildStatsKey.playerTwo} />
				</div>
				<div className="flex-1 min-h-0 overflow-hidden">
					<EnemyStats logs={logs} playerIndex={guildStatsKey.playerTwo} />
				</div>
			</div>

			<div className="glass-card rounded-md p-4 border border-white/10 overflow-hidden min-h-0 min-w-0">
				<Logger logs={logs} onStatsUpdate={setStats} onDeleteLog={handleDeleteLog} onIndicesChange={handleIndicesChange} />
			</div>
		</div>
	);
}

export default DemoPage;
