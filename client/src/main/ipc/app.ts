import { app, ipcMain } from "electron";
import { spawn } from "node:child_process";
import { getPersistentLoggerPath } from "../logger/resolve-exe-path";

export function registerAppIpc() {
	ipcMain.handle("app:getVersion", () => app.getVersion());
	ipcMain.handle("app:exit", () => { app.quit(); });
	ipcMain.handle("app:getLoggerPath", () => getPersistentLoggerPath());
	ipcMain.handle("app:grantLinuxCapability", () =>
		new Promise<{ success: boolean; error?: string }>((resolve) => {
			const path = getPersistentLoggerPath();
			const proc = spawn("pkexec", ["setcap", "cap_net_raw+eip", path], { stdio: "pipe" });
			let stderr = "";
			proc.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
			proc.on("close", (code) => {
				if (code === 0) resolve({ success: true });
				else resolve({ success: false, error: stderr.trim() || `Exit code ${code}` });
			});
			proc.on("error", (err) => resolve({ success: false, error: err.message }));
		})
	);
}
