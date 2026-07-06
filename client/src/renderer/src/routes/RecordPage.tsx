import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuActivity, LuChartPie, LuPlay, LuRotateCcw, LuSkull, LuSquare, LuSword } from "react-icons/lu";
import { useConfigStore } from "../components/create-config/config-store";
import type { LogType, NamedLog } from "../components/create-config/config";
import Logger, { type LoggerHandle } from "../components/create-config/Logger";
import Button from "../components/ui/Button";
import EnemyStats from "../components/ui/EnemyStats";
import GuildStats from "../components/ui/GuildStats";
import Icon from "../components/ui/Icon";
import KDTimeline from "../components/ui/KDTimeline";
import StatCard from "../components/ui/StatCard";
import { getNetworkDeathLogs, getNetworkIsKill } from "../logic/deathLogs";
import { appendUniqueLog, parseLoggerLine } from "../logic/logParsing";
import { mostFrequent } from "../logic/util";
import { useElementHeight } from "../logic/useElementHeight";
import { useLoggerSession, type LoggerSessionCallback } from "../logic/useLoggerSession";

const MAX_RETRIES = 3;

function formatDuration(ms: number) {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function RecordPage() {
	const { t } = useTranslation();
	const tRef = useRef(t);
	tRef.current = t;
	const [logs, setLogs] = useState<LogType[]>([]);
	const retryCountRef = useRef(0);
	const [stats, setStats] = useState({ kills: 0, deaths: 0, kdr: 0 });
	const [guildStatsKey, setGuildStatsKey] = useState({ playerTwo: 1, guild: 2 });
	const [killOffset, setKillOffset] = useState<number>();
	const [sessionActive, setSessionActive] = useState(true);
	const [duration, setDuration] = useState(0);
	const startedAtRef = useRef(Date.now());
	const loggerRef = useRef<LoggerHandle>(null);
	const { start, stop } = useLoggerSession();
	const { ref: headerBlockRef, height: headerBlockHeight } = useElementHeight<HTMLDivElement>();

	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);

	const startSession = useCallback(async () => {
		const cfg = await ensureConfigLoaded();
		const extraArgs = [...(cfg.all_interfaces ? ["-i"] : []), ...(cfg.ip_filter ? ["-p"] : [])];

		const loggerCallback: LoggerSessionCallback = (data, status) => {
			if (status === "running") {
				const newLog = parseLoggerLine(data);
				if (newLog) {
					setLogs((prevLogs) => appendUniqueLog(prevLogs, newLog));
				} else if (data.includes("Error while reading network.")) {
					alert(tRef.current("record.errors.networkError"));
				}
				return;
			}

			if (status === "error") {
				console.error(data);
				alert(tRef.current("record.errors.loggerError", { message: data }));
			}

			if (retryCountRef.current < MAX_RETRIES) {
				retryCountRef.current++;
				start("analyze", extraArgs, loggerCallback);
			} else {
				alert(tRef.current("record.errors.loggerFailedRetry"));
				retryCountRef.current = 0;
			}
		};

		start("analyze", extraArgs, loggerCallback);
	}, [start, ensureConfigLoaded]);

	useEffect(() => {
		startSession();
	}, [startSession]);

	const handleDeleteLog = (index: number) => {
		setLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
	};

	const handleIndicesChange = (indices: { playerTwo: number; guild: number }) => {
		setGuildStatsKey(indices);
	};

	const handleStop = async () => {
		if (!sessionActive) return;
		await stop();
		if (logs.length > 0) await loggerRef.current?.saveSessionToHistory();
		setDuration(Date.now() - startedAtRef.current);
		setSessionActive(false);
	};

	const handleResume = async () => {
		if (sessionActive) return;
		setSessionActive(true);
		await startSession();
	};

	const handleRestart = async () => {
		retryCountRef.current = 0;
		setLogs([]);
		setStats({ kills: 0, deaths: 0, kdr: 0 });
		setGuildStatsKey({ playerTwo: 1, guild: 2 });
		setKillOffset(undefined);
		setDuration(0);
		startedAtRef.current = Date.now();
		setSessionActive(true);
		await startSession();
	};

	const deathLogs = useMemo(() => getNetworkDeathLogs(logs, killOffset), [logs, killOffset]);

	const enrichedLogs: NamedLog[] = useMemo(
		() => logs.map((log) => ({ names: log.names, isKill: getNetworkIsKill(log.hex, killOffset) })),
		[logs, killOffset],
	);

	const recap = useMemo(() => {
		if (sessionActive) return null;
		return {
			topGuild: mostFrequent(logs.map((log) => log.names[guildStatsKey.guild]?.name)),
			topEnemy: mostFrequent(deathLogs.map((log) => log.names[guildStatsKey.playerTwo]?.name)),
		};
	}, [sessionActive, logs, deathLogs, guildStatsKey]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] grid-rows-[auto_minmax(0,1fr)] gap-4 h-full w-full p-8">
			<div ref={headerBlockRef} className="flex flex-col gap-4 min-w-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className={`w-2 h-2 rounded-full ${sessionActive ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
						<span className="text-sm font-medium text-gray-300">{sessionActive ? t("record.status.recording") : t("record.status.stopped")}</span>
					</div>

					{sessionActive ? (
						<Button size="sm" color="outline" onClick={handleStop}>
							<Icon icon={LuSquare} size="sm" className="mr-2" />
							{t("record.stopRecording")}
						</Button>
					) : (
						<div className="flex items-center gap-2">
							<Button size="sm" color="outline" onClick={handleResume}>
								<Icon icon={LuPlay} size="sm" className="mr-2" />
								{t("record.resumeRecording")}
							</Button>
							<Button size="sm" color="outline" onClick={handleRestart}>
								<Icon icon={LuRotateCcw} size="sm" className="mr-2" />
								{t("record.restartRecording")}
							</Button>
						</div>
					)}
				</div>

				{recap && (
					<div className="glass-card rounded-md p-4 border border-cta-500/30">
						<h3 className="section-label mb-1">{t("record.recap.title")}</h3>
						<p className="text-sm text-gray-300">{t("record.recap.summary", { duration: formatDuration(duration), kills: stats.kills, deaths: stats.deaths, kdr: stats.kdr })}</p>
						{recap.topGuild && <p className="text-xs text-gray-400 mt-1">{t("record.recap.topGuild", { guild: recap.topGuild })}</p>}
						{recap.topEnemy && <p className="text-xs text-gray-400">{t("record.recap.topEnemy", { enemy: recap.topEnemy })}</p>}
					</div>
				)}

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
					<GuildStats logs={enrichedLogs} guildIndex={guildStatsKey.guild} playerIndex={guildStatsKey.playerTwo} />
				</div>
				<div className="flex-1 min-h-0 overflow-hidden">
					<EnemyStats logs={enrichedLogs} playerIndex={guildStatsKey.playerTwo} guildIndex={guildStatsKey.guild} />
				</div>
			</div>

			<div className="glass-card rounded-md p-4 border border-white/10 overflow-hidden min-h-0 min-w-0">
				<Logger ref={loggerRef} logs={logs} onStatsUpdate={setStats} onDeleteLog={handleDeleteLog} onIndicesChange={handleIndicesChange} onKillOffsetChange={setKillOffset} />
			</div>
		</div>
	);
}

export default RecordPage;
