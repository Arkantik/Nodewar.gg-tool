import { app } from "electron";
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const LOGGER_BIN_NAME = process.platform === "win32" ? "logger.exe" : "logger";

function getSourceLoggerPath(): string {
	return app.isPackaged
		? join(process.resourcesPath, "logger", LOGGER_BIN_NAME)
		: join(app.getAppPath(), "..", "logger", "dist", LOGGER_BIN_NAME);
}

export function getPersistentLoggerPath(): string {
	return join(app.getPath("userData"), "bin", LOGGER_BIN_NAME);
}

export function ensurePersistentLoggerCopy(): void {
	if (process.platform !== "linux") return;

	const sourcePath = getSourceLoggerPath();
	if (!existsSync(sourcePath)) return;

	const persistentPath = getPersistentLoggerPath();
	const versionFile = `${persistentPath}.ver`;
	const currentVersion = app.getVersion();

	const alreadyCurrent =
		existsSync(persistentPath) &&
		existsSync(versionFile) &&
		readFileSync(versionFile, "utf8").trim() === currentVersion;

	if (alreadyCurrent) return;

	mkdirSync(dirname(persistentPath), { recursive: true });
	copyFileSync(sourcePath, persistentPath);
	chmodSync(persistentPath, 0o755);
	writeFileSync(versionFile, currentVersion, "utf8");
}

export function resolveLoggerExePath(): string {
	if (process.platform === "linux") {
		const persistentPath = getPersistentLoggerPath();
		if (existsSync(persistentPath)) return persistentPath;
	}

	const path = getSourceLoggerPath();
	if (!existsSync(path)) {
		throw new Error(`Logger executable not found at "${path}"`);
	}
	return path;
}
