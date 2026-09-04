import { app, BrowserWindow, dialog, Menu, shell } from "electron";
import { join } from "node:path";
import type { AppAction } from "../shared/ipc-contract";
import { setupGlobalHotkey, type HotkeyApi } from "./hotkey";
import { registerAppIpc } from "./ipc/app";
import { registerClipboardIpc } from "./ipc/clipboard";
import { registerConfigIpc } from "./ipc/config";
import { registerDialogIpc } from "./ipc/dialogs";
import { registerFsIpc } from "./ipc/fs";
import { registerHotkeyIpc } from "./ipc/hotkey";
import { registerLoggerIpc } from "./ipc/logger";
import { registerOverlayIpc } from "./ipc/overlay";
import { registerSessionLogIpc } from "./ipc/session-log";
import { registerShellIpc } from "./ipc/shell";
import { registerTrayIpc } from "./ipc/tray";
import { registerUpdaterIpc } from "./ipc/updater";
import { registerVersionsIpc } from "./ipc/versions";
import { registerWindowIpc } from "./ipc/window";
import { LoggerProcessManager } from "./logger/process-manager";
import { setupOverlay, type OverlayController } from "./overlay";
import { setupTray, type TrayApi } from "./tray";
import { setupUpdater } from "./updater";
import { createVersionManager } from "./version-manager";

app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("disable-renderer-backgrounding");

process.on("uncaughtException", (err) => {
	console.error("Uncaught exception in main process:", err);
});

process.on("unhandledRejection", (reason) => {
	console.error("Unhandled promise rejection in main process:", reason);
});

let mainWindow: BrowserWindow | null = null;
let isQuitConfirmed = false;
let trayApi: TrayApi | null = null;
let hotkeyApi: HotkeyApi | null = null;
let overlayApi: OverlayController | null = null;
const getWindow = () => mainWindow;

const loggerManager = new LoggerProcessManager((evt) => {
	mainWindow?.webContents.send("logger:event", evt);
});
const versionManager = createVersionManager(getWindow);

function sendCommand(action: AppAction) {
	mainWindow?.webContents.send("commands:trigger", action);
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 1000,
		minHeight: 700,
		resizable: true,
		show: false,
		backgroundColor: "#0a0a0c",
		icon: app.isPackaged ? undefined : join(app.getAppPath(), "..", "logger", "icon", "icon-2.ico"),
		frame: false,
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	});

	mainWindow.once("ready-to-show", () => mainWindow?.show());

	mainWindow.on("close", (event) => {
		if (isQuitConfirmed || trayApi?.getStatus() !== "recording") {
			void loggerManager.stop();
			return;
		}

		event.preventDefault();
		void dialog
			.showMessageBox(mainWindow!, {
				type: "warning",
				buttons: ["Cancel", "Quit Anyway"],
				defaultId: 0,
				cancelId: 0,
				title: "Recording in progress",
				message: "A recording is currently in progress.",
				detail: "Closing the app now will stop the recording. Are you sure you want to quit?",
			})
			.then(({ response }) => {
				if (response !== 1) return;
				isQuitConfirmed = true;
				mainWindow?.close();
			});
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
		overlayApi?.destroy();
		app.quit();
	});

	mainWindow.on("maximize", () => mainWindow?.webContents.send("window:stateChanged", true));
	mainWindow.on("unmaximize", () => mainWindow?.webContents.send("window:stateChanged", false));

	const rendererUrl = process.env.ELECTRON_RENDERER_URL;
	const isAppUrl = (url: string) => (rendererUrl ? url.startsWith(rendererUrl) : url.startsWith("file://"));

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		void shell.openExternal(url);
		return { action: "deny" };
	});
	mainWindow.webContents.on("will-navigate", (event, url) => {
		if (isAppUrl(url)) return;
		event.preventDefault();
		void shell.openExternal(url);
	});

	if (rendererUrl) {
		mainWindow.loadURL(rendererUrl);
	} else {
		mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
	}
}

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);

	registerLoggerIpc(loggerManager);
	registerDialogIpc(getWindow);
	registerFsIpc();
	registerClipboardIpc();
	registerConfigIpc();
	registerShellIpc();
	registerUpdaterIpc(setupUpdater(getWindow));
	registerVersionsIpc(versionManager);
	registerAppIpc();
	overlayApi = setupOverlay();
	registerTrayIpc(
		() => trayApi,
		() => overlayApi,
	);
	registerHotkeyIpc(() => hotkeyApi);
	registerOverlayIpc(() => overlayApi);
	registerSessionLogIpc();
	registerWindowIpc(getWindow);

	createWindow();

	try {
		trayApi = setupTray(getWindow, sendCommand);
	} catch (err) {
		console.error("Failed to create tray icon:", err);
	}

	hotkeyApi = setupGlobalHotkey(sendCommand);
	if (!hotkeyApi.getAccelerator()) {
		console.error("Failed to register global recording hotkey (likely already bound by another app).");
	}
});

app.on("will-quit", () => {
	hotkeyApi?.destroy();
	trayApi?.destroy();
	overlayApi?.destroy();
});

app.on("window-all-closed", () => {
	app.quit();
});
