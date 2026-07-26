import { ToastManager } from "../components/toast/toast-store";
import { get_config } from "../components/create-config/config";
import i18n from "../i18n";
import { readNameAt } from "./configNames";
import { getNetworkDeathLogs, getNetworkIsKill } from "./deathLogs";
import { useHistoryStore } from "./history-store";
import { parseLoggerLine } from "./logParsing";
import { mostFrequent } from "./util";

let recoveryInFlight = false;

export async function recoverOrphanedSessions() {
	if (recoveryInFlight) return;
	recoveryInFlight = true;
	try {
		await recoverOrphanedSessionsInternal();
	} finally {
		recoveryInFlight = false;
	}
}

async function recoverOrphanedSessionsInternal() {
	const orphaned = await window.api.sessionLog.listOrphaned();
	if (orphaned.length === 0) return;

	await useHistoryStore.getState().ensureLoaded();
	const addEntry = useHistoryStore.getState().addEntry;

	let recoveredCount = 0;
	const config = await get_config();

	for (const session of orphaned) {
		const { killOffset } = session.meta;
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
				const playerTwo = readNameAt(log.hex, config.player_two) || "?";
				const guild = readNameAt(log.hex, config.guild) || "?";
				return `[${log.time}] ${isKill ? "killed" : "died to"} ${playerTwo} from ${guild}`;
			})
			.join("\n");

		await addEntry({
			date: new Date().toISOString(),
			kills,
			deaths,
			kdr,
			topGuild: mostFrequent(logs.map((log) => readNameAt(log.hex, config.guild))),
			topEnemy: mostFrequent(deathLogs.map((log) => readNameAt(log.hex, config.player_two))),
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
