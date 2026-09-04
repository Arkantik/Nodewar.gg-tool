export type Config = {
	patch: string;
	identifier: string;
	player_one: number;
	player_two: number;
	guild: number;
	kill: number;
	auto_scroll: boolean;
	include_characters: boolean;
	include_coordinates: boolean;
	all_interfaces: boolean;
	ip_filter: boolean;
};

export type LogType = {
	identifier: string;
	time: string;
	names: { name: string; offset: number }[];
	hex: string;
};

export type Log = {
	time: string;
	names: string[];
	kill: boolean;
	coords: string;
};

export type NamedLog = {
	names: { name: string }[];
	isKill?: boolean;
};

const CONFIG_STORAGE_KEY = "config";

export function get_date() {
	const today = new Date();
	const isoDate = today.toISOString().substr(0, 10);
	return isoDate;
}

export function get_formatted_date(date_string: string) {
	const date = new Date(date_string);
	const formatter = new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
	return formatter.format(date).replace(/\//g, ".");
}

export function stringify_config(config: Config) {
	return `[GENERAL]
patch=${config.patch ? get_formatted_date(config.patch) : get_formatted_date(get_date())}
[IP]
server_1 = 20.76.13
server_2 = 20.76.14
[PACKAGE]
identifier = ${config.identifier}
guild = ${config.guild}
player_one = ${config.player_one}
player_two = ${config.player_two}
kill = ${config.kill}
log_length = 600
name_length = 64`;
}

export async function update_config(config: Config) {
	await window.api.config.set(CONFIG_STORAGE_KEY, config);
	return config;
}

export async function get_config(): Promise<Config> {
	const config = await window.api.config.get<Config>(CONFIG_STORAGE_KEY).catch((e: unknown) => {
		console.error(e);
		return null;
	});

	if (config) {
		if (config.include_characters === undefined) {
			config.include_characters = true;
		}
		if (config.include_coordinates === undefined) {
			config.include_coordinates = true;
		}
		return config;
	}

	return {
		identifier: "",
		player_one: 0,
		player_two: 0,
		guild: 0,
		kill: 0,
		patch: "",
		auto_scroll: true,
		include_characters: true,
		include_coordinates: true,
		all_interfaces: true,
		ip_filter: false,
	};
}

export function copy_to_clipboard(config: Config) {
	window.api.clipboard.writeText(stringify_config(config));
}

export function hexToString(hex: string) {
	let string = "";
	for (let i = 0; i < hex.length; i += 2) {
		string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	}
	return string;
}
