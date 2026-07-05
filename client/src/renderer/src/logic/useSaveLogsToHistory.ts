import { useHistoryStore } from "./history-store";

export interface LogsSummary {
	text: string;
	kills: number;
	deaths: number;
	kdr: number;
	topGuild: string | null;
	topEnemy: string | null;
}

export function useSaveLogsToHistory() {
	const addEntry = useHistoryStore((s) => s.addEntry);

	return async function saveLogsToHistory(summary: LogsSummary) {
		await addEntry({
			date: new Date().toISOString(),
			kills: summary.kills,
			deaths: summary.deaths,
			kdr: summary.kdr,
			topGuild: summary.topGuild,
			topEnemy: summary.topEnemy,
			logText: summary.text,
		});
	};
}
