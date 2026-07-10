import { create } from "zustand";

export interface HistoryEntry {
  id: string;
  date: string;
  kills: number;
  deaths: number;
  kdr: number;
  topGuild: string | null;
  topEnemy: string | null;
  logText: string;
  recovered?: boolean;
  tags?: string[];
  notes?: string;
}

const HISTORY_STORAGE_KEY = "sessionHistory";
const MAX_ENTRIES = 7;

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface HistoryStore {
  entries: HistoryEntry[];
  loaded: boolean;
  ensureLoaded: () => Promise<HistoryEntry[]>;
  addEntry: (entry: Omit<HistoryEntry, "id">) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  updateEntry: (id: string, patch: Partial<Pick<HistoryEntry, "tags" | "notes">>) => Promise<void>;
}

let inFlight: Promise<HistoryEntry[]> | null = null;

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  entries: [],
  loaded: false,
  ensureLoaded: async () => {
    if (get().loaded) return get().entries;

    inFlight ??= window.api.config.get<HistoryEntry[]>(HISTORY_STORAGE_KEY).then((v) => v ?? []);
    const loaded = await inFlight;
    inFlight = null;
    set({ entries: loaded, loaded: true });
    return loaded;
  },
  addEntry: async (entry) => {
    const current = await get().ensureLoaded();
    const updated = [{ ...entry, id: generateId() }, ...current].slice(0, MAX_ENTRIES);
    await window.api.config.set(HISTORY_STORAGE_KEY, updated);
    set({ entries: updated });
  },
  removeEntry: async (id) => {
    await get().ensureLoaded();
    const updated = get().entries.filter((e) => e.id !== id);
    await window.api.config.set(HISTORY_STORAGE_KEY, updated);
    set({ entries: updated });
  },
  updateEntry: async (id, patch) => {
    await get().ensureLoaded();
    const updated = get().entries.map((e) => (e.id === id ? { ...e, ...patch } : e));
    await window.api.config.set(HISTORY_STORAGE_KEY, updated);
    set({ entries: updated });
  },
}));
