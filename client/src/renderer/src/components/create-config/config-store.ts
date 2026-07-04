import { create } from "zustand";
import { get_config, update_config, type Config } from "./config";

interface ConfigStore {
	config: Config | null;
	ensureLoaded: () => Promise<Config>;
	updateConfig: (config: Config) => Promise<Config>;
}

let inFlight: Promise<Config> | null = null;

export const useConfigStore = create<ConfigStore>((set, get) => ({
	config: null,
	ensureLoaded: async () => {
		const existing = get().config;
		if (existing) return existing;

		inFlight ??= get_config();
		const loaded = await inFlight;
		inFlight = null;
		set({ config: loaded });
		return loaded;
	},
	updateConfig: async (config) => {
		const updated = await update_config(config);
		set({ config: updated });
		return updated;
	},
}));
