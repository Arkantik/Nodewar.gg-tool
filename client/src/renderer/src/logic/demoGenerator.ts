import type { LogType } from "../components/create-config/config";

const PLAYERS = [
	// === Guild1 ===
	{ guild: "Guild1", family: "Fam-Blade", character: "Char-Azrael" },
	{ guild: "Guild1", family: "Fam-Iron", character: "Char-Seraphina" },
	{ guild: "Guild1", family: "Fam-Storm", character: "Char-Kaelthas" },
	{ guild: "Guild1", family: "Fam-Fire", character: "Char-Morgana" },
	{ guild: "Guild1", family: "Fam-Shadow", character: "Char-Vesper" },
	{ guild: "Guild1", family: "Fam-Void", character: "Char-Nyxara" },
	{ guild: "Guild1", family: "Fam-Dragon", character: "Char-Balor" },
	{ guild: "Guild1", family: "Fam-Thorn", character: "Char-Elowen" },

	// === Guild2 ===
	{ guild: "Guild2", family: "Fam-Frost", character: "Char-Ragnar" },
	{ guild: "Guild2", family: "Fam-Knight", character: "Char-Lyanna" },
	{ guild: "Guild2", family: "Fam-Light", character: "Char-Thorin" },
	{ guild: "Guild2", family: "Fam-Thunder", character: "Char-Celeste" },
	{ guild: "Guild2", family: "Fam-Sky", character: "Char-Aether" },
	{ guild: "Guild2", family: "Fam-Abyss", character: "Char-Morath" },
	{ guild: "Guild2", family: "Fam-Crimson", character: "Char-Sylvana" },
	{ guild: "Guild2", family: "Fam-Stone", character: "Char-Grom" },

	// === AllianceZ ===
	{ guild: "AllianceZ", family: "Fam-Walker", character: "Char-Draven" },
	{ guild: "AllianceZ", family: "Fam-Shaker", character: "Char-Freya" },
	{ guild: "AllianceZ", family: "Fam-Crimson", character: "Char-Zephyr" },
	{ guild: "AllianceZ", family: "Fam-Silver", character: "Char-Nyx" },
	{ guild: "AllianceZ", family: "Fam-Eclipse", character: "Char-Selene" },
	{ guild: "AllianceZ", family: "Fam-Rune", character: "Char-Thalor" },
	{ guild: "AllianceZ", family: "Fam-Ghost", character: "Char-Phantara" },
	{ guild: "AllianceZ", family: "Fam-Titan", character: "Char-Boreas" },

	// === AllianceY ===
	{ guild: "AllianceY", family: "Fam-Golden", character: "Char-Orion" },
	{ guild: "AllianceY", family: "Fam-Sapphire", character: "Char-Luna" },
	{ guild: "AllianceY", family: "Fam-Ruby", character: "Char-Dante" },
	{ guild: "AllianceY", family: "Fam-Onyx", character: "Char-Ember" },
	{ guild: "AllianceY", family: "Fam-Star", character: "Char-Astrid" },
	{ guild: "AllianceY", family: "Fam-Blood", character: "Char-Vespera" },
	{ guild: "AllianceY", family: "Fam-Wind", character: "Char-Zephyros" },
	{ guild: "AllianceY", family: "Fam-Obsidian", character: "Char-Korath" },

	// === AllianceX ===
	{ guild: "AllianceX", family: "Fam-Pearl", character: "Char-Fenrir" },
	{ guild: "AllianceX", family: "Fam-Diamond", character: "Char-Aurora" },
	{ guild: "AllianceX", family: "Fam-Emerald", character: "Char-Blade" },
	{ guild: "AllianceX", family: "Fam-Fox", character: "Char-Raven" },
	{ guild: "AllianceX", family: "Fam-Phoenix", character: "Char-Ignis" },
	{ guild: "AllianceX", family: "Fam-Viper", character: "Char-Sable" },
	{ guild: "AllianceX", family: "Fam-Lunar", character: "Char-Nyxara" },
	{ guild: "AllianceX", family: "Fam-Stormborn", character: "Char-Raiden" },

	// === Guild3 ===
	{ guild: "Guild3", family: "Fam-Ocean", character: "Char-Triton" },
	{ guild: "Guild3", family: "Fam-Flame", character: "Char-Pyrrhus" },
	{ guild: "Guild3", family: "Fam-Night", character: "Char-Umbra" },
	{ guild: "Guild3", family: "Fam-Sun", character: "Char-Solara" },
	{ guild: "Guild3", family: "Fam-Wolf", character: "Char-Lycan" },
	{ guild: "Guild3", family: "Fam-Raven", character: "Char-Nevermore" },
	{ guild: "Guild3", family: "Fam-Crystal", character: "Char-Quartz" },
	{ guild: "Guild3", family: "Fam-Venom", character: "Char-Serpentis" },

	// === Guild4 ===
	{ guild: "Guild4", family: "Fam-Mountain", character: "Char-Rockfist" },
	{ guild: "Guild4", family: "Fam-Spell", character: "Char-Arcanis" },
	{ guild: "Guild4", family: "Fam-Bone", character: "Char-Grimwald" },
	{ guild: "Guild4", family: "Fam-Leaf", character: "Char-Sylvara" },
	{ guild: "Guild4", family: "Fam-Ice", character: "Char-Frostbite" },
	{ guild: "Guild4", family: "Fam-Thunderstrike", character: "Char-Bolt" },
	{ guild: "Guild4", family: "Fam-Soul", character: "Char-Eidolon" },
	{ guild: "Guild4", family: "Fam-War", character: "Char-Ares" },

	// === AllianceW ===
	{ guild: "AllianceW", family: "Fam-Mystic", character: "Char-Eldrin" },
	{ guild: "AllianceW", family: "Fam-Dark", character: "Char-Shadowveil" },
	{ guild: "AllianceW", family: "Fam-Glory", character: "Char-Valor" },
	{ guild: "AllianceW", family: "Fam-Beast", character: "Char-Wildheart" },
	{ guild: "AllianceW", family: "Fam-Eternal", character: "Char-Timor" },
	{ guild: "AllianceW", family: "Fam-Ash", character: "Char-Phoenixreign" },
	{ guild: "AllianceW", family: "Fam-Steel", character: "Char-Ironclad" },
	{ guild: "AllianceW", family: "Fam-Moon", character: "Char-Lunareth" },

	// === AllianceV ===
	{ guild: "AllianceV", family: "Fam-Arcane", character: "Char-Mythos" },
	{ guild: "AllianceV", family: "Fam-Briar", character: "Char-Thornheart" },
	{ guild: "AllianceV", family: "Fam-Specter", character: "Char-Wraith" },
	{ guild: "AllianceV", family: "Fam-Legend", character: "Char-Heroic" },
	{ guild: "AllianceV", family: "Fam-Vortex", character: "Char-Maelstrom" },
	{ guild: "AllianceV", family: "Fam-Dawn", character: "Char-Auriel" },
	{ guild: "AllianceV", family: "Fam-Nightfall", character: "Char-Dusk" },
	{ guild: "AllianceV", family: "Fam-Elder", character: "Char-Ancient" },

	// === Guild5 ===
	{ guild: "Guild5", family: "Fam-Rage", character: "Char-Berserk" },
	{ guild: "Guild5", family: "Fam-Holy", character: "Char-Paladin" },
	{ guild: "Guild5", family: "Fam-Whisper", character: "Char-Silence" },
	{ guild: "Guild5", family: "Fam-Forge", character: "Char-Anvil" },
	{ guild: "Guild5", family: "Fam-Plague", character: "Char-Morbus" },
	{ guild: "Guild5", family: "Fam-Celestial", character: "Char-Starfall" },
	{ guild: "Guild5", family: "Fam-Undead", character: "Char-Lich" },
	{ guild: "Guild5", family: "Fam-Tempest", character: "Char-Hurricane" },
];

function getRandomItem<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomPlayer() {
	return getRandomItem(PLAYERS);
}

function stringToHex(str: string, maxLength: number = 32): string {
	let hex = "";

	for (let i = 0; i < str.length && i < maxLength; i++) {
		const charCode = str.charCodeAt(i);
		hex += charCode.toString(16).padStart(2, "0");
	}

	const targetLength = maxLength * 2;
	while (hex.length < targetLength) {
		hex += "00";
	}

	return hex;
}

export class DemoLogGenerator {
	private isRunning: boolean = false;
	private intervalId: number | null = null;
	private eventCount: number = 0;
	private playerName: string;

	constructor() {
		this.playerName = "YourFamilyName";
	}

	start(callback: (log: LogType) => void, intervalMs: number = 2000): void {
		if (this.isRunning) return;

		this.isRunning = true;
		this.eventCount = 0;

		this.intervalId = window.setInterval(() => {
			const log = this.generateLog();
			callback(log);
			this.eventCount++;
		}, intervalMs);
	}

	stop(): void {
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}
		this.isRunning = false;
	}

	getIsRunning(): boolean {
		return this.isRunning;
	}

	private generateLog(): LogType {
		const now = new Date();
		const time = now.toTimeString().split(" ")[0]; // HH:MM:SS format

		const isKill = Math.random() < 0.5;

		const enemy = getRandomPlayer();
		const otherPlayer = getRandomPlayer();

		const playerOne = this.playerName;
		const playerTwo = enemy.family;

		const identifier = "630100af12";

		const guildHex = stringToHex(enemy.guild, 32);
		const playerOneHex = stringToHex(playerOne, 32);
		const playerTwoHex = stringToHex(playerTwo, 32);
		const char1Hex = stringToHex(enemy.character, 32);
		const char2Hex = stringToHex(otherPlayer.character, 32);

		const guildOffset = 12;
		const killOffset = 283;
		const playerOneOffset = 402;
		const playerTwoOffset = 526;

		let hex = "";

		for (let i = 0; i < 1200; i++) {
			hex += "0";
		}

		const hexArray = hex.split("");

		for (let i = 0; i < identifier.length; i++) {
			hexArray[i] = identifier[i];
		}

		for (let i = 0; i < guildHex.length && guildOffset + i < 1200; i++) {
			hexArray[guildOffset + i] = guildHex[i];
		}

		hexArray[killOffset] = isKill ? "0" : "0";
		hexArray[killOffset + 1] = isKill ? "1" : "0";

		for (let i = 0; i < playerOneHex.length && playerOneOffset + i < 1200; i++) {
			hexArray[playerOneOffset + i] = playerOneHex[i];
		}

		for (let i = 0; i < playerTwoHex.length && playerTwoOffset + i < 1200; i++) {
			hexArray[playerTwoOffset + i] = playerTwoHex[i];
		}

		const char1Offset = 650;
		const char2Offset = 720;

		for (let i = 0; i < char1Hex.length && char1Offset + i < 1200; i++) {
			hexArray[char1Offset + i] = char1Hex[i];
		}

		for (let i = 0; i < char2Hex.length && char2Offset + i < 1200; i++) {
			hexArray[char2Offset + i] = char2Hex[i];
		}

		hex = hexArray.join("");

		return {
			identifier,
			time,
			names: [
				{ name: playerOne, offset: playerOneOffset },
				{ name: playerTwo, offset: playerTwoOffset },
				{ name: enemy.guild, offset: guildOffset },
				{ name: enemy.character, offset: char1Offset },
				{ name: otherPlayer.character, offset: char2Offset },
			],
			hex: hex,
		};
	}
}
