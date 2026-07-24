import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuActivity, LuChartPie, LuFileText, LuFolder, LuSkull, LuSword } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { useListRef } from "react-window";
import type { Log, LogType, NamedLog } from "../components/create-config/config";
import { useConfigStore } from "../components/create-config/config-store";
import LogEditor from "../components/create-config/LogEditor";
import Logger from "../components/create-config/Logger";
import Button from "../components/ui/Button";
import EnemyStats from "../components/ui/EnemyStats";
import GuildStats from "../components/ui/GuildStats";
import Icon from "../components/ui/Icon";
import KDTimeline from "../components/ui/KDTimeline";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { enrichLogs } from "../logic/configNames";
import { open_file } from "../logic/file";
import { appendUniqueLog, parseLoggerLine, parseTextLog } from "../logic/logParsing";
import { useElementHeight } from "../logic/useElementHeight";
import { useLoggerSession, type LoggerSessionCallback } from "../logic/useLoggerSession";

interface OpenPageNavState {
	logText?: string;
	fileName?: string;
}

function OpenPage() {
	const { t } = useTranslation();
	const location = useLocation();
	const [initialNavState] = useState(() => location.state as OpenPageNavState | null);
	const [logs, setLogs] = useState<LogType[]>([]);
	const [combatLogs, setCombatLogs] = useState<Log[]>(() => (initialNavState?.logText ? parseTextLog(initialNavState.logText) : []));
	const [loading, setLoading] = useState(false);
	const [isNetwork, setIsNetwork] = useState(false);
	const [fileName, setFileName] = useState<string>(() => initialNavState?.fileName ?? "");
	const [networkStats, setNetworkStats] = useState({ kills: 0, deaths: 0, kdr: 0 });
	const [guildStatsKey, setGuildStatsKey] = useState({ playerTwo: 1, guild: 2 });
	const [killOffset, setKillOffset] = useState<number>();
	const [timelineKey, setTimelineKey] = useState(0);
	const [scrubIndex, setScrubIndex] = useState<number | null>(null);
	const { start } = useLoggerSession();
	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
	const config = useConfigStore((s) => s.config);
	const { ref: headerBlockRef, height: headerBlockHeight } = useElementHeight<HTMLDivElement>();
	const logListRef = useListRef(null);

	function handleScrub(index: number | null) {
		setScrubIndex(index);
		if (index !== null) logListRef.current?.scrollToRow({ index, align: "center", behavior: "smooth" });
	}

	const combatLogStats = useMemo(() => {
		let kills = 0;
		let deaths = 0;

		combatLogs.forEach((log) => {
			log.kill ? kills++ : deaths++;
		});

		const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
		return { kills, deaths, kdr };
	}, [combatLogs]);

	const stats = isNetwork ? networkStats : combatLogStats;

	const enrichedLogs: NamedLog[] = useMemo(() => {
		if (isNetwork) return enrichLogs(logs, config, guildStatsKey, killOffset);
		return combatLogs.map((log) => ({ names: log.names.map((name) => ({ name })), isKill: log.kill }));
	}, [isNetwork, logs, combatLogs, config, guildStatsKey, killOffset]);

	const loggerCallback: LoggerSessionCallback = (data, status) => {
		if (status === "running") {
			const newLog = parseLoggerLine(data);
			if (newLog) setLogs((prevLogs) => appendUniqueLog(prevLogs, newLog));
		} else if (status === "error") {
			console.error(data);
			setLoading(false);
		} else {
			setLoading(false);
		}
	};

	async function openPcap() {
		setLogs([]);
		setCombatLogs([]);
		setFileName("");
		setNetworkStats({ kills: 0, deaths: 0, kdr: 0 });
		setGuildStatsKey({ playerTwo: 1, guild: 2 });
		setKillOffset(undefined);
		setTimelineKey((prev) => prev + 1);
		setScrubIndex(null);

		const filePaths = await open_file();
		if (!filePaths || filePaths.length === 0) return;

		const filePath = filePaths[0];
		const config = await ensureConfigLoaded();

		const pathParts = filePath.split(/[\\/]/);
		setFileName(pathParts[pathParts.length - 1]);

		if (filePath.includes(".txt") || filePath.includes(".log")) {
			setIsNetwork(false);
			const data = await window.api.fs.readTextFile(filePath);
			if (!data) return;

			setCombatLogs(parseTextLog(data));
		} else {
			setIsNetwork(true);
			setLoading(true);
			// Passed as separate argv entries (no shell involved), so the path never needs quoting
			// regardless of what characters it contains.
			start("analyze", ["-f", filePath, ...(config.ip_filter ? ["-p"] : [])], loggerCallback);
		}
	}

	const handleDeleteLog = (index: number) => {
		setLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
	};

	const handleDeleteCombatLog = (index: number) => {
		setCombatLogs((prevLogs) => prevLogs.filter((_, i) => i !== index));
	};

	const handleIndicesChange = (indices: { playerTwo: number; guild: number }) => {
		setGuildStatsKey(indices);
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] grid-rows-[auto_minmax(0,1fr)] gap-4 h-full w-full p-8">
			<div ref={headerBlockRef} className="flex flex-col gap-4 min-w-0">
				<PageHeader
					icon={fileName ? LuFileText : LuFolder}
					title={t("open.fileSelection.selectedFile")}
					subtitle={fileName || t("open.fileSelection.noFileSelected")}
					action={
						<Button onClick={openPcap} size="sm" color="primary">
							<Icon icon={LuFolder} size="sm" className="mr-2" />
							{t("open.fileSelection.importFile")}
						</Button>
					}
				/>

				<div className="grid grid-cols-4 gap-4">
					<StatCard label={t("record.stats.events")} value={isNetwork ? logs.length : combatLogs.length} icon={LuActivity} />

					<StatCard label={t("record.stats.kills")} value={stats.kills} icon={LuSword} valueColor="text-blue-400" />

					<StatCard label={t("record.stats.deaths")} value={stats.deaths} icon={LuSkull} valueColor="text-red-400" />

					<StatCard label={t("record.stats.kdRatio")} value={stats.kdr} icon={LuChartPie} valueColor={stats.kdr >= 1 ? "text-green-400" : "text-red-400"} />
				</div>

				<KDTimeline key={timelineKey} kdr={stats.kdr} kills={stats.kills} deaths={stats.deaths} allLogs={isNetwork ? undefined : combatLogs} onScrub={isNetwork ? undefined : handleScrub} />
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
				{isNetwork ? (
					<Logger logs={logs} loading={loading} onStatsUpdate={setNetworkStats} onDeleteLog={handleDeleteLog} onIndicesChange={handleIndicesChange} onKillOffsetChange={setKillOffset} />
				) : (
					<LogEditor logs={combatLogs} loading={loading} onDeleteLog={handleDeleteCombatLog} onIndicesChange={handleIndicesChange} listRef={logListRef} highlightIndex={scrubIndex} />
				)}
			</div>
		</div>
	);
}

export default OpenPage;
