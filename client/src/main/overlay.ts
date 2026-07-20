import { BrowserWindow, screen } from "electron";
import { join } from "node:path";
import { DEFAULT_OVERLAY_SETTINGS, type OverlayAnchor, type OverlayPayload, type OverlaySettings, type OverlaySize } from "../shared/ipc-contract";
import { getValue } from "./store";

export interface OverlayController {
  show: () => void;
  hide: () => void;
  pushPayload: (payload: OverlayPayload) => void;
  getSettings: () => OverlaySettings;
  updateSettings: (next: OverlaySettings) => void;
  reportContentSize: (size: OverlaySize) => void;
  destroy: () => void;
}

const OVERLAY_WIDTH = 260;
const OVERLAY_MARGIN = 50;
const BASE_HEIGHT = 84;
const SECTION_HEIGHT = 88;

const OVERLAY_SETTINGS_KEY = "overlaySettings";

function computeOverlaySize(settings: OverlaySettings): { width: number; height: number } {
  const height = BASE_HEIGHT + (settings.showGuilds ? SECTION_HEIGHT : 0) + (settings.showPlayers ? SECTION_HEIGHT : 0);
  return { width: OVERLAY_WIDTH, height };
}

function computeOverlayPosition(anchor: OverlayAnchor, workArea: { width: number; height: number }, size: { width: number; height: number }, margin = OVERLAY_MARGIN): { x: number; y: number } {
  const midX = Math.round((workArea.width - size.width) / 2);
  const midY = Math.round((workArea.height - size.height) / 2);

  switch (anchor) {
    case "top-left":
      return { x: margin, y: margin };
    case "top-center":
      return { x: midX, y: margin };
    case "top-right":
      return { x: workArea.width - size.width - margin, y: margin };
    case "center-left":
      return { x: margin, y: midY };
    case "center-right":
      return { x: workArea.width - size.width - margin, y: midY };
    case "bottom-left":
      return { x: margin, y: workArea.height - size.height - margin };
    case "bottom-right":
      return { x: workArea.width - size.width - margin, y: workArea.height - size.height - margin };
  }
}

export function setupOverlay(): OverlayController {
  let win: BrowserWindow | null = null;
  let settings: OverlaySettings = getValue<OverlaySettings>(OVERLAY_SETTINGS_KEY) ?? DEFAULT_OVERLAY_SETTINGS;
  // The real rendered size, reported by the overlay renderer via ResizeObserver. Used once
  // available so the window exactly fits its content - the static estimate below only serves
  // as a first-paint placeholder before that first report arrives.
  let contentSize: OverlaySize | null = null;
  let wantsVisible = false;

  function applyBounds(target: BrowserWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const size = contentSize ?? computeOverlaySize(settings);
    const position = computeOverlayPosition(settings.anchor, { width, height }, size);
    target.setBounds({ ...size, ...position });
  }

  function createWindow(): BrowserWindow {
    const size = computeOverlaySize(settings);

    const overlay = new BrowserWindow({
      width: size.width,
      height: size.height,
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
    applyBounds(overlay);

    overlay.webContents.on("did-finish-load", () => {
      overlay.webContents.send("overlay:settings", settings);
    });

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
      wantsVisible = true;
      if (process.platform !== "win32") return;
      if (!settings.enabled) return;
      win ??= createWindow();
      win.showInactive();
    },

    hide() {
      wantsVisible = false;
      win?.hide();
    },

    pushPayload(payload) {
      win?.webContents.send("overlay:payload", payload);
    },

    getSettings() {
      return settings;
    },

    updateSettings(next) {
      settings = next;
      contentSize = null;

      if (!settings.enabled) {
        win?.hide();
        return;
      }

      if (win) {
        applyBounds(win);
        win.webContents.send("overlay:settings", settings);
      }

      if (wantsVisible && process.platform === "win32") {
        win ??= createWindow();
        win.showInactive();
      }
    },

    reportContentSize(size) {
      contentSize = size;
      if (win) applyBounds(win);
    },

    destroy() {
      win?.destroy();
      win = null;
    }
  };
}
