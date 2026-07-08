import { BrowserWindow, screen } from "electron";
import { join } from "node:path";
import type { OverlayStats } from "../shared/ipc-contract";

export interface OverlayController {
  show: () => void;
  hide: () => void;
  pushStats: (stats: OverlayStats) => void;
  destroy: () => void;
}

const OVERLAY_WIDTH = 220;
const OVERLAY_HEIGHT = 84;
const OVERLAY_MARGIN = 16;

export function setupOverlay(): OverlayController {
  let win: BrowserWindow | null = null;

  function createWindow(): BrowserWindow {
    const { width } = screen.getPrimaryDisplay().workAreaSize;

    const overlay = new BrowserWindow({
      width: OVERLAY_WIDTH,
      height: OVERLAY_HEIGHT,
      x: width - OVERLAY_WIDTH - OVERLAY_MARGIN,
      y: OVERLAY_MARGIN,
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      focusable: false,
      hasShadow: false,
      show: false,
      webPreferences: {
        preload: join(__dirname, "../preload/overlay.js"),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true
      }
    });

    overlay.setAlwaysOnTop(true, "screen-saver");
    overlay.setIgnoreMouseEvents(true, { forward: true });

    const rendererUrl = process.env.ELECTRON_RENDERER_URL;
    if (rendererUrl) {
      overlay.loadURL(`${rendererUrl}/overlay.html`);
    } else {
      overlay.loadFile(join(__dirname, "../renderer/overlay.html"));
    }

    overlay.on("closed", () => {
      win = null;
    });

    return overlay;
  }

  return {
    show() {
      if (process.platform !== "win32") return;
      win ??= createWindow();
      win.showInactive();
    },

    hide() {
      win?.hide();
    },

    pushStats(stats) {
      win?.webContents.send("overlay:stats", stats);
    },

    destroy() {
      win?.destroy();
      win = null;
    }
  };
}
