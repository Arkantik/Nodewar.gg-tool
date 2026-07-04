import { ipcMain } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { extname } from "node:path";

const ALLOWED_READ_EXTENSIONS = new Set([".log", ".txt"]);

export function registerFsIpc() {
  ipcMain.handle("fs:readTextFile", async (_event, path: string) => {
    const ext = extname(path).toLowerCase();
    if (!ALLOWED_READ_EXTENSIONS.has(ext)) {
      throw new Error(`Refusing to read file with extension "${ext}"`);
    }
    return readFile(path, "utf-8");
  });

  ipcMain.handle("fs:writeFile", async (_event, path: string, contents: string) => {
    await writeFile(path, contents, "utf-8");
  });
}
