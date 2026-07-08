import { create } from "zustand";
import type { LogType } from "../components/create-config/config";
import { useConfigStore } from "../components/create-config/config-store";
import i18n from "../i18n";
import type { LoggerMode } from "../../../shared/ipc-contract";
import { appendUniqueLog, parseLoggerLine } from "./logParsing";

const MAX_RETRIES = 3;
const MODE: LoggerMode = "analyze";

export interface RecordingStats {
	kills: number;
	deaths: number;
	kdr: number;
}

interface RecordingState {
	hasStarted: boolean;
	sessionActive: boolean;
	logs: LogType[];
	stats: RecordingStats;
	killOffset: number | undefined;
	guildStatsKey: { playerTwo: number; guild: number };
	duration: number;
	startedAt: number;
	start: () => Promise<void>;
	stopCapture: () => Promise<void>;
	resume: () => Promise<void>;
	restart: () => Promise<void>;
	deleteLog: (index: number) => void;
	setStats: (stats: RecordingStats) => void;
	setGuildStatsKey: (indices: { playerTwo: number; guild: number }) => void;
	setKillOffset: (offset: number | undefined) => void;
}

let activeSessionId: string | null = null;
let unsubscribe: (() => void) | null = null;
let retryCount = 0;

async function stopUnderlyingSession() {
	unsubscribe?.();
	unsubscribe = null;

	const sessionId = activeSessionId;
	activeSessionId = null;
	if (sessionId) await window.api.logger.stop(sessionId);
}

// Lives at module scope (not inside a component), so the capture process and
// accumulated logs survive navigating away from RecordPage instead of being
// torn down on unmount.
export const useRecordingStore = create<RecordingState>((set, get) => ({
	hasStarted: false,
	sessionActive: false,
	logs: [],
	stats: { kills: 0, deaths: 0, kdr: 0 },
	killOffset: undefined,
	guildStatsKey: { playerTwo: 1, guild: 2 },
	duration: 0,
	startedAt: Date.now(),

	start: async () => {
		await stopUnderlyingSession();
		set({ hasStarted: true, sessionActive: true });

		const cfg = await useConfigStore.getState().ensureLoaded();
		const extraArgs = [...(cfg.all_interfaces ? ["-i"] : []), ...(cfg.ip_filter ? ["-p"] : [])];

		const { sessionId } = await window.api.logger.start(MODE, extraArgs);
		activeSessionId = sessionId;

		unsubscribe = window.api.logger.onEvent((evt) => {
			if (evt.sessionId !== sessionId) return;

			if (evt.kind === "stdout") {
				const newLog = parseLoggerLine(evt.data);
				if (newLog) {
					set((state) => ({ logs: appendUniqueLog(state.logs, newLog) }));
				} else if (evt.data.includes("Error while reading network.")) {
					alert(i18n.t("record.errors.networkError"));
				}
				return;
			}

			if (evt.kind === "stderr") {
				console.error(evt.data);
				alert(i18n.t("record.errors.loggerError", { message: evt.data }));
			}

			if (retryCount < MAX_RETRIES) {
				retryCount++;
				void get().start();
			} else {
				alert(i18n.t("record.errors.loggerFailedRetry"));
				retryCount = 0;
			}
		});
	},

	stopCapture: async () => {
		if (!get().sessionActive) return;
		await stopUnderlyingSession();
		set((state) => ({ sessionActive: false, duration: Date.now() - state.startedAt }));
	},

	resume: async () => {
		if (get().sessionActive) return;
		await get().start();
	},

	restart: async () => {
		retryCount = 0;
		set({
			logs: [],
			stats: { kills: 0, deaths: 0, kdr: 0 },
			guildStatsKey: { playerTwo: 1, guild: 2 },
			killOffset: undefined,
			duration: 0,
			startedAt: Date.now(),
		});
		await get().start();
	},

	deleteLog: (index) => set((state) => ({ logs: state.logs.filter((_, i) => i !== index) })),
	setStats: (stats) => set({ stats }),
	setGuildStatsKey: (guildStatsKey) => set({ guildStatsKey }),
	setKillOffset: (killOffset) => set({ killOffset }),
}));
