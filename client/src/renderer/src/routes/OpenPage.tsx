import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuActivity, LuChartPie, LuFileText, LuFolder, LuSkull, LuSword } from "react-icons/lu";
import { useLocation } from "react-router-dom";
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
import { open_file } from "../logic/file";
import { useElementHeight } from "../logic/useElementHeight";
import { useLoggerSession, type LoggerSessionCallback } from "../logic/useLoggerSession";

const LOG_REGEX = /\[(.+)\] (\w+) (died to|has killed|killed|was slain by) (\w+) (?:from|of|from the) (?:the )?(\w+|-1)(?: \((\w+),(\w+)\))?/;

interface OpenPageNavState {
	logText?: string;
	fileName?: string;
}

function parseTextLog(data: string): Log[] {
	const lines = data.split("\n");
	const newCombatLogs: Log[] = [];

	for (const line of lines) {
		const match = line.match(LOG_REGEX);
		if (match) {
			newCombatLogs.push({
				time: match[1],
				names: [match[2], match[4], match[5], match[6] || "", match[7] || ""].filter((n) => n),
				kill: match[3] === "has killed" || match[3] === "killed",
			});
		}
	}

	return newCombatLogs;
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
	const [timelineKey, setTimelineKey] = useState(0);
	const { start } = useLoggerSession();
	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
	const { ref: headerBlockRef, height: headerBlockHeight } = useElementHeight<HTMLDivElement>();

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

	const namedLogs: NamedLog[] = useMemo(() => {
		return isNetwork ? logs : combatLogs.map((log) => ({ names: log.names.map((name) => ({ name })) }));
	}, [isNetwork, logs, combatLogs]);

	const loggerCallback: LoggerSessionCallback = (data, status) => {
		if (status === "running") {
			const d = data.split(",");
			if (d.length === 8 && !data.includes("Network Interfaces:")) {
				const newLog: LogType = {
					identifier: d[0],
					time: d[1],
					names: d.slice(2, 7).map((name) => {
						const split = name.split(" ");
						return { name: split[0], offset: +split[1] };
					}),
					hex: d[7],
				};

				setLogs((prevLogs) => {
					const exists = prevLogs.find((log) => log.identifier === newLog.identifier && log.time === newLog.time && log.names.length === newLog.names.length && log.names.every((name, i) => name.name === newLog.names[i].name));

					if (exists) return prevLogs;
					return [...prevLogs, newLog];
				});
			}
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
		setTimelineKey((prev) => prev + 1);

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

				<KDTimeline key={timelineKey} kdr={stats.kdr} kills={stats.kills} deaths={stats.deaths} allLogs={isNetwork ? undefined : combatLogs} />
			</div>

			<div className="hidden lg:flex lg:flex-col gap-4 overflow-hidden min-h-0 row-span-2">
				<div className="shrink-0 overflow-hidden" style={{ height: headerBlockHeight || undefined }}>
					<GuildStats logs={namedLogs} guildIndex={guildStatsKey.guild} playerIndex={guildStatsKey.playerTwo} />
				</div>
				<div className="flex-1 min-h-0 overflow-hidden">
					<EnemyStats logs={namedLogs} playerIndex={guildStatsKey.playerTwo} />
				</div>
			</div>

			<div className="glass-card rounded-md p-4 border border-white/10 overflow-hidden min-h-0 min-w-0">
				{isNetwork ? (
					<Logger logs={logs} loading={loading} onStatsUpdate={setNetworkStats} onDeleteLog={handleDeleteLog} onIndicesChange={handleIndicesChange} />
				) : (
					<LogEditor logs={combatLogs} loading={loading} onDeleteLog={handleDeleteCombatLog} onIndicesChange={handleIndicesChange} />
				)}
			</div>
		</div>
	);
}

export default OpenPage;
