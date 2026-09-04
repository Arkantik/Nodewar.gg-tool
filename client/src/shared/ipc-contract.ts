export type LoggerMode = "sniff" | "open_file" | "status" | "update" | "record" | "analyze";

export interface LoggerEvent {
	sessionId: string;
	kind: "stdout" | "stderr" | "exit";
	data: string;
}

export interface FileFilter {
	name: string;
	extensions: string[];
}

export interface OpenFileOptions {
	title?: string;
	defaultPath?: string;
	filters?: FileFilter[];
}

export interface SaveFileOptions {
	title?: string;
	defaultPath?: string;
	filters?: FileFilter[];
}

export type UpdaterEvent =
	{ status: "checking" } | { status: "available"; version: string } | { status: "not-available" } | { status: "downloading"; percent: number } | { status: "downloaded"; version: string } | { status: "error"; message: string };

export interface ReleaseSummary {
	version: string;
	tag: string;
	publishedAt: string;
	notes: string;
	htmlUrl: string;
}

export interface ReleaseListResult {
	supported: boolean;
	releases: ReleaseSummary[];
}

export type DowngradeEvent = { status: "downloading"; percent: number } | { status: "error"; message: string };

export type RecordingStatus = "idle" | "recording";

export type AppAction = "toggle-recording" | "stop-and-save";

export interface OverlayStats {
	kills: number;
	deaths: number;
	kdr: number;
}

export type OverlayAnchor = "top-left" | "top-center" | "top-right" | "center-left" | "center-right" | "bottom-left" | "bottom-right";

export interface OverlaySettings {
	enabled: boolean;
	anchor: OverlayAnchor;
	showGuilds: boolean;
	showGuildKD: boolean;
	showGuildKDDetails: boolean;
	showPlayers: boolean;
	showPlayerKD: boolean;
	showPlayerKDDetails: boolean;
}

export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
	enabled: true,
	anchor: "top-right",
	showGuilds: false,
	showGuildKD: false,
	showGuildKDDetails: false,
	showPlayers: false,
	showPlayerKD: false,
	showPlayerKDDetails: false,
};

export interface OverlayGuildEntry {
	name: string;
	kills: number;
	deaths: number;
}

export interface OverlayPlayerEntry {
	name: string;
	guild: string;
	kills: number;
	deaths: number;
}

export interface OverlayPayload {
	stats: OverlayStats;
	elapsedSeconds: number;
	topGuilds: OverlayGuildEntry[];
	topPlayers: OverlayPlayerEntry[];
}

export interface OverlaySize {
	width: number;
	height: number;
}

export interface OverlayPreloadApi {
	getSettings: () => Promise<OverlaySettings>;
	onPayload: (cb: (payload: OverlayPayload) => void) => () => void;
	onSettings: (cb: (settings: OverlaySettings) => void) => () => void;
	reportSize: (size: OverlaySize) => void;
}

export interface SessionLogMeta {
	killOffset: number | undefined;
	guildStatsKey: { playerTwo: number; guild: number };
}

export interface OrphanedSession {
	sessionId: string;
	lines: string[];
	meta: SessionLogMeta;
}

export interface IpcApi {
	logger: {
		start: (mode: LoggerMode, extraArgs?: string[]) => Promise<{ sessionId: string }>;
		stop: (sessionId: string) => Promise<void>;
		onEvent: (cb: (evt: LoggerEvent) => void) => () => void;
	};
	dialog: {
		openFile: (options?: OpenFileOptions) => Promise<string[] | null>;
		saveFile: (options?: SaveFileOptions) => Promise<string | null>;
	};
	fs: {
		readTextFile: (path: string) => Promise<string>;
		writeFile: (path: string, contents: string) => Promise<void>;
	};
	clipboard: {
		writeText: (text: string) => Promise<void>;
	};
	shell: {
		openExternal: (url: string) => Promise<void>;
	};
	config: {
		get: <T>(key: string) => Promise<T | null>;
		set: <T>(key: string, value: T) => Promise<void>;
	};
	updater: {
		check: () => Promise<void>;
		download: () => Promise<void>;
		onEvent: (cb: (evt: UpdaterEvent) => void) => () => void;
	};
	versions: {
		list: () => Promise<ReleaseListResult>;
		downgradeTo: (tag: string) => Promise<void>;
		onEvent: (cb: (evt: DowngradeEvent) => void) => () => void;
	};
	app: {
		getVersion: () => Promise<string>;
		exit: () => Promise<void>;
	};
	tray: {
		setRecordingStatus: (status: RecordingStatus) => Promise<void>;
	};
	commands: {
		onTrigger: (cb: (action: AppAction) => void) => () => void;
	};
	hotkey: {
		get: () => Promise<string | null>;
		set: (accelerator: string) => Promise<{ success: boolean }>;
		pause: () => Promise<void>;
		resume: () => Promise<void>;
	};
	overlay: {
		pushPayload: (payload: OverlayPayload) => Promise<void>;
		getSettings: () => Promise<OverlaySettings>;
		setSettings: (settings: Partial<OverlaySettings>) => Promise<OverlaySettings>;
	};
	sessionLog: {
		begin: (sessionId: string) => Promise<void>;
		append: (sessionId: string, lines: string[]) => Promise<void>;
		setMeta: (sessionId: string, meta: SessionLogMeta) => Promise<void>;
		discard: (sessionId: string) => Promise<void>;
		listOrphaned: () => Promise<OrphanedSession[]>;
	};
	window: {
		minimize: () => Promise<void>;
		toggleMaximize: () => Promise<void>;
		close: () => Promise<void>;
		isMaximized: () => Promise<boolean>;
		onStateChanged: (cb: (maximized: boolean) => void) => () => void;
	};
}
