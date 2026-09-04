import { ipcMain } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const ALLOWED_READ_EXTENSIONS = new Set([".log", ".txt"]);
const ALLOWED_WRITE_EXTENSIONS = new Set([".log"]);

export function registerFsIpc() {
	ipcMain.handle("fs:readTextFile", async (_event, path: string) => {
		const ext = extname(path).toLowerCase();
		if (!ALLOWED_READ_EXTENSIONS.has(ext)) {
			throw new Error(`Refusing to read file with extension "${ext}"`);
		}
		return readFile(path, "utf-8");
	});

	ipcMain.handle("fs:writeFile", async (_event, path: string, contents: string) => {
		const ext = extname(path).toLowerCase();
		if (!ALLOWED_WRITE_EXTENSIONS.has(ext)) {
			throw new Error(`Refusing to write file with extension "${ext}"`);
		}
		await writeFile(path, contents, "utf-8");
	});
}
