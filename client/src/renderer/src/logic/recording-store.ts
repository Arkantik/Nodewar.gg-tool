import { create } from "zustand";
import { ToastManager } from "../components/toast/toast-store";
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
	saved: boolean;
	sessionId: string | null;
	logs: LogType[];
	stats: RecordingStats;
	killOffset: number | undefined;
	guildStatsKey: { playerTwo: number; guild: number };
	duration: number;
	startedAt: number;
	start: () => Promise<void>;
	stopCapture: () => Promise<void>;
	stopAndSave: () => Promise<void>;
	resume: () => Promise<void>;
	restart: () => Promise<void>;
	deleteLog: (index: number) => void;
	setStats: (stats: RecordingStats) => void;
	setGuildStatsKey: (indices: { playerTwo: number; guild: number }) => void;
	setKillOffset: (offset: number | undefined) => void;
	registerSaveHandler: (handler: (() => Promise<void>) | null) => void;
}

let activeSessionId: string | null = null;
let unsubscribe: (() => void) | null = null;
let retryCount = 0;

let saveHandler: (() => Promise<void>) | null = null;

let pendingLines: string[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

function flushPendingLines(sessionId: string) {
	if (pendingLines.length === 0) return;
	const lines = pendingLines;
	pendingLines = [];
	void window.api.sessionLog.append(sessionId, lines);
}

async function stopUnderlyingSession() {
	unsubscribe?.();
	unsubscribe = null;

	if (flushTimer) {
		clearInterval(flushTimer);
		flushTimer = null;
	}
	const durableSessionId = useRecordingStore.getState().sessionId;
	if (durableSessionId) flushPendingLines(durableSessionId);

	const sessionId = activeSessionId;
	activeSessionId = null;
	if (sessionId) await window.api.logger.stop(sessionId);
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
	hasStarted: false,
	sessionActive: false,
	saved: true,
	sessionId: null,
	logs: [],
	stats: { kills: 0, deaths: 0, kdr: 0 },
	killOffset: undefined,
	guildStatsKey: { playerTwo: 1, guild: 2 },
	duration: 0,
	startedAt: Date.now(),

	start: async () => {
		await stopUnderlyingSession();

		const isNewSession = get().sessionId === null;
		const durableSessionId = get().sessionId ?? crypto.randomUUID();
		set({ hasStarted: true, sessionActive: true, sessionId: durableSessionId });
		if (isNewSession) void window.api.sessionLog.begin(durableSessionId);
		flushTimer = setInterval(() => flushPendingLines(durableSessionId), 1000);

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
					pendingLines.push(evt.data);
				} else if (evt.data.includes("Error while reading network.")) {
					ToastManager.warning(i18n.t("record.errors.networkError"));
				}
				return;
			}

			if (evt.kind === "stderr") {
				console.error(evt.data);
				ToastManager.error(i18n.t("record.errors.loggerError", { message: evt.data }));
			}

			if (retryCount < MAX_RETRIES) {
				retryCount++;
				void get().start();
			} else {
				ToastManager.error(i18n.t("record.errors.loggerFailedRetry"));
				retryCount = 0;
			}
		});
	},

	stopCapture: async () => {
		if (!get().sessionActive) return;
		await stopUnderlyingSession();
		set((state) => ({ sessionActive: false, saved: false, duration: Date.now() - state.startedAt }));
	},

	stopAndSave: async () => {
		await get().stopCapture();
		const durableSessionId = get().sessionId;

		if (get().logs.length === 0) {
			set({ saved: true });
			if (durableSessionId) void window.api.sessionLog.discard(durableSessionId);
			return;
		}
		if (saveHandler) {
			await saveHandler();
			set({ saved: true });
			if (durableSessionId) void window.api.sessionLog.discard(durableSessionId);
		} else {
			ToastManager.warning(i18n.t("record.errors.saveDeferred"));
		}
	},

	resume: async () => {
		if (get().sessionActive) return;
		await get().start();
	},

	restart: async () => {
		retryCount = 0;
		const oldSessionId = get().sessionId;
		if (oldSessionId) void window.api.sessionLog.discard(oldSessionId);

		set({
			logs: [],
			stats: { kills: 0, deaths: 0, kdr: 0 },
			guildStatsKey: { playerTwo: 1, guild: 2 },
			killOffset: undefined,
			duration: 0,
			startedAt: Date.now(),
			saved: true,
			sessionId: null,
		});
		await get().start();
	},

	deleteLog: (index) => set((state) => ({ logs: state.logs.filter((_, i) => i !== index) })),
	setStats: (stats) => {
		set({ stats });
		void window.api.overlay.pushStats(stats);
	},
	setGuildStatsKey: (guildStatsKey) => {
		set({ guildStatsKey });
		const sessionId = get().sessionId;
		if (sessionId) void window.api.sessionLog.setMeta(sessionId, { killOffset: get().killOffset, guildStatsKey });
	},
	setKillOffset: (killOffset) => {
		set({ killOffset });
		const sessionId = get().sessionId;
		if (sessionId) void window.api.sessionLog.setMeta(sessionId, { killOffset, guildStatsKey: get().guildStatsKey });
	},
	registerSaveHandler: (handler) => {
		saveHandler = handler;
	},
}));

useRecordingStore.subscribe((state, prevState) => {
	if (state.sessionActive === prevState.sessionActive) return;
	void window.api.tray.setRecordingStatus(state.sessionActive ? "recording" : "idle");
});
