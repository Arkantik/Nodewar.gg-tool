import type { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import type { UpdaterEvent } from "../shared/ipc-contract";

export function setupUpdater(getWindow: () => BrowserWindow | null) {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  const send = (evt: UpdaterEvent) => getWindow()?.webContents.send("updater:event", evt);

  autoUpdater.on("checking-for-update", () => send({ status: "checking" }));
  autoUpdater.on("update-available", (info) => send({ status: "available", version: info.version }));
  autoUpdater.on("update-not-available", () => send({ status: "not-available" }));
  autoUpdater.on("download-progress", (progress) =>
    send({ status: "downloading", percent: progress.percent })
  );
  autoUpdater.on("update-downloaded", (info) => {
    send({ status: "downloaded", version: info.version });
    autoUpdater.quitAndInstall();
  });
  autoUpdater.on("error", (err) => send({ status: "error", message: err.message }));

  return {
    check: async () => {
      try {
        await autoUpdater.checkForUpdates();
      } catch (err) {
        send({ status: "error", message: (err as Error).message });
      }
    },
    download: async () => {
      try {
        await autoUpdater.downloadUpdate();
      } catch (err) {
        send({ status: "error", message: (err as Error).message });
      }
    }
  };
}
