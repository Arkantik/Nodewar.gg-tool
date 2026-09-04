import { app } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";

const LOGGER_BIN_NAME = process.platform === "win32" ? "logger.exe" : "logger";

export function resolveLoggerExePath(): string {
	const path = app.isPackaged ? join(process.resourcesPath, "logger", LOGGER_BIN_NAME) : join(app.getAppPath(), "..", "logger", "dist", LOGGER_BIN_NAME);

	if (!existsSync(path)) {
		throw new Error(`Logger executable not found at "${path}"`);
	}
	return path;
}
