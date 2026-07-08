import { globalShortcut } from "electron";
import type { AppAction } from "../shared/ipc-contract";
import { getValue, setValue } from "./store";

const HOTKEY_STORAGE_KEY = "recordingHotkey";
const DEFAULT_ACCELERATOR = "CommandOrControl+Shift+F9";

export interface HotkeyApi {
  getAccelerator: () => string | null;
  setAccelerator: (accelerator: string) => boolean;
  pause: () => void;
  resume: () => void;
  destroy: () => void;
}

export function setupGlobalHotkey(send: (action: AppAction) => void): HotkeyApi {
  let current: string | null = null;

  function register(accelerator: string): boolean {
    return globalShortcut.register(accelerator, () => send("toggle-recording"));
  }

  const stored = getValue<string>(HOTKEY_STORAGE_KEY) ?? DEFAULT_ACCELERATOR;
  if (register(stored)) {
    current = stored;
  } else if (stored !== DEFAULT_ACCELERATOR && register(DEFAULT_ACCELERATOR)) {
    current = DEFAULT_ACCELERATOR;
  }

  return {
    getAccelerator: () => current,

    setAccelerator(accelerator) {
      if (accelerator === current) return true;

      if (current) globalShortcut.unregister(current);

      if (register(accelerator)) {
        current = accelerator;
        setValue(HOTKEY_STORAGE_KEY, accelerator);
        return true;
      }

      if (current) register(current);
      return false;
    },

    pause() {
      if (current) globalShortcut.unregister(current);
    },

    resume() {
      if (current) register(current);
    },

    destroy() {
      if (current) globalShortcut.unregister(current);
    }
  };
}
