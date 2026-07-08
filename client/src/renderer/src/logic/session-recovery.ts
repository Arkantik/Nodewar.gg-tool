import { ToastManager } from "../components/toast/toast-store";
import i18n from "../i18n";
import { getNetworkDeathLogs, getNetworkIsKill } from "./deathLogs";
import { useHistoryStore } from "./history-store";
import { parseLoggerLine } from "./logParsing";
import { mostFrequent } from "./util";

export async function recoverOrphanedSessions() {
	const orphaned = await window.api.sessionLog.listOrphaned();
	if (orphaned.length === 0) return;

	await useHistoryStore.getState().ensureLoaded();
	const addEntry = useHistoryStore.getState().addEntry;

	let recoveredCount = 0;

	for (const session of orphaned) {
		const { killOffset, guildStatsKey } = session.meta;
		const logs = session.lines.map(parseLoggerLine).filter((log) => log !== null);

		if (logs.length === 0) {
			await window.api.sessionLog.discard(session.sessionId);
			continue;
		}

		let kills = 0;
		let deaths = 0;
		for (const log of logs) {
			const isKill = getNetworkIsKill(log.hex, killOffset);
			if (isKill === true) kills++;
			else if (isKill === false) deaths++;
		}
		const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
		const deathLogs = getNetworkDeathLogs(logs, killOffset);

		const text = logs
			.map((log) => {
				const isKill = getNetworkIsKill(log.hex, killOffset);
				const playerTwo = log.names[guildStatsKey.playerTwo]?.name ?? "?";
				const guild = log.names[guildStatsKey.guild]?.name ?? "?";
				return `[${log.time}] ${isKill ? "killed" : "died to"} ${playerTwo} from ${guild}`;
			})
			.join("\n");

		await addEntry({
			date: new Date().toISOString(),
			kills,
			deaths,
			kdr,
			topGuild: mostFrequent(logs.map((log) => log.names[guildStatsKey.guild]?.name)),
			topEnemy: mostFrequent(deathLogs.map((log) => log.names[guildStatsKey.playerTwo]?.name)),
			logText: text,
			recovered: true,
		});

		await window.api.sessionLog.discard(session.sessionId);
		recoveredCount++;
	}

	if (recoveredCount > 0) {
		ToastManager.info(i18n.t("history.recoveredSessions", { count: recoveredCount }));
	}
}
