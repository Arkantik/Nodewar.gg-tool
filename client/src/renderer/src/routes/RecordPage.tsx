import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { LuActivity, LuChartPie, LuPlay, LuRotateCcw, LuSave, LuSkull, LuSquare, LuSword } from "react-icons/lu";
import type { NamedLog } from "../components/create-config/config";
import Logger, { type LoggerHandle } from "../components/create-config/Logger";
import Button from "../components/ui/Button";
import EnemyStats from "../components/ui/EnemyStats";
import GuildStats from "../components/ui/GuildStats";
import Icon from "../components/ui/Icon";
import KDTimeline from "../components/ui/KDTimeline";
import StatCard from "../components/ui/StatCard";
import { getNetworkDeathLogs } from "../logic/deathLogs";
import { enrichLogs, readNameAt } from "../logic/configNames";
import { mostFrequent } from "../logic/util";
import { useElementHeight } from "../logic/useElementHeight";
import { useRecordingStore } from "../logic/recording-store";
import { useConfigStore } from "../components/create-config/config-store";

function formatDuration(ms: number) {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function RecordPage() {
	const { t } = useTranslation();
	const loggerRef = useRef<LoggerHandle>(null);
	const { ref: headerBlockRef, height: headerBlockHeight } = useElementHeight<HTMLDivElement>();

	const hasStarted = useRecordingStore((s) => s.hasStarted);
	const sessionActive = useRecordingStore((s) => s.sessionActive);
	const saved = useRecordingStore((s) => s.saved);
	const logs = useRecordingStore((s) => s.logs);
	const stats = useRecordingStore((s) => s.stats);
	const killOffset = useRecordingStore((s) => s.killOffset);
	const guildStatsKey = useRecordingStore((s) => s.guildStatsKey);
	const duration = useRecordingStore((s) => s.duration);
	const start = useRecordingStore((s) => s.start);
	const stopAndSave = useRecordingStore((s) => s.stopAndSave);
	const resume = useRecordingStore((s) => s.resume);
	const restart = useRecordingStore((s) => s.restart);
	const deleteLog = useRecordingStore((s) => s.deleteLog);
	const setStats = useRecordingStore((s) => s.setStats);
	const setGuildStatsKey = useRecordingStore((s) => s.setGuildStatsKey);
	const setKillOffset = useRecordingStore((s) => s.setKillOffset);
	const registerSaveHandler = useRecordingStore((s) => s.registerSaveHandler);

	useEffect(() => {
		if (!hasStarted) start();
	}, [hasStarted, start]);

	// Lets the tray menu / global hotkey trigger a full "stop & save" without
	// this page being mounted, as long as it was mounted at some point during
	// the session (see recording-store.ts's saveHandler).
	useEffect(() => {
		registerSaveHandler(async () => {
			await loggerRef.current?.saveSessionToHistory();
		});
		return () => registerSaveHandler(null);
	}, [registerSaveHandler]);

	const config = useConfigStore((s) => s.config);

	const deathLogs = useMemo(() => getNetworkDeathLogs(logs, killOffset), [logs, killOffset]);

	const enrichedLogs: NamedLog[] = useMemo(
		() => enrichLogs(logs, config, guildStatsKey, killOffset),
		[logs, config, guildStatsKey, killOffset],
	);

	const recap = useMemo(() => {
		if (sessionActive) return null;
		return {
			topGuild: config ? mostFrequent(logs.map((log) => readNameAt(log.hex, config.guild))) : undefined,
			topEnemy: config ? mostFrequent(deathLogs.map((log) => readNameAt(log.hex, config.player_two))) : undefined,
		};
	}, [sessionActive, logs, deathLogs, config]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] grid-rows-[auto_minmax(0,1fr)] gap-4 h-full w-full p-8">
			<div ref={headerBlockRef} className="flex flex-col gap-4 min-w-0">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<span className={`w-2 h-2 rounded-full ${sessionActive ? "bg-green-400 animate-pulse" : "bg-gray-500"}`} />
						<span className="text-sm font-medium text-gray-300">{sessionActive ? t("record.status.recording") : t("record.status.stopped")}</span>
					</div>

					{sessionActive ? (
						<Button size="sm" color="secondary" onClick={stopAndSave}>
							<Icon icon={LuSquare} size="sm" className="mr-2" />
							{t("record.stopRecording")}
						</Button>
					) : (
						<div className="flex items-center gap-2">
							{!saved && logs.length > 0 && (
								<Button size="sm" color="secondary" onClick={stopAndSave}>
									<Icon icon={LuSave} size="sm" className="mr-2" />
									{t("record.saveToHistory")}
								</Button>
							)}
							<Button size="sm" color="secondary" onClick={resume}>
								<Icon icon={LuPlay} size="sm" className="mr-2" />
								{t("record.resumeRecording")}
							</Button>
							<Button size="sm" color="secondary" onClick={restart}>
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
				<Logger ref={loggerRef} logs={logs} onStatsUpdate={setStats} onDeleteLog={deleteLog} onIndicesChange={setGuildStatsKey} onKillOffsetChange={setKillOffset} />
			</div>
		</div>
	);
}

export default RecordPage;
