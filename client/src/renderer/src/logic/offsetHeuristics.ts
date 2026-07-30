import { hexToString, type Config, type LogType } from "../components/create-config/config";
import { find_all_indicies } from "./util";

export function readNameAt(hex: string, offset: number): string {
	return hexToString(hex.slice(offset, offset + 64))
		.replaceAll("\0", "")
		.replaceAll(" ", "");
}

function phantomOffsets(logs: LogType[], slot: number, offsets: number[]): Set<number> {
	const present = new Set(offsets);
	const phantom = new Set<number>();
	for (const off of offsets) {
		const later = off + 4;
		if (!present.has(later)) continue;
		const at = logs.filter((log) => log.names[slot]?.offset === off);
		const allSuperstring =
			at.length > 0 &&
			at.every((log) => {
				const here = readNameAt(log.hex, off);
				const real = readNameAt(log.hex, later);
				return real.length > 0 && here.length === real.length + 1 && here.slice(1) === real;
			});
		if (allSuperstring) phantom.add(off);
	}
	return phantom;
}

const MAX_KILL_OFFSET_CANDIDATES = 5;

const KILL_FLAG_COVERAGE = 0.9;

export function isKillFlagOffset(logs: LogType[], offset: number): boolean {
	if (logs.length === 0 || offset <= 0) return false;
	let hits = 0;
	for (const log of logs) {
		const pair = log.hex.slice(offset - 1, offset + 1);
		if (pair === "01" || pair === "00") hits++;
	}
	return hits / logs.length >= KILL_FLAG_COVERAGE;
}

const NAME_RE = /^[A-Za-z][A-Za-z0-9_]{2,15}$/;

export function isValidNameOffset(logs: LogType[], offset: number, threshold = 0.8): boolean {
	if (logs.length === 0 || offset <= 0) return false;
	let hits = 0;
	for (const log of logs) {
		if (NAME_RE.test(readNameAt(log.hex, offset))) hits++;
	}
	return hits / logs.length >= threshold;
}

export type ConfigOffsetField = "kill" | "guild" | "player_one" | "player_two";

export function invalidConfigOffsets(logs: LogType[], config: Config): ConfigOffsetField[] {
	if (logs.length === 0) return [];
	const bad: ConfigOffsetField[] = [];
	if (!isKillFlagOffset(logs, config.kill)) bad.push("kill");
	if (!isValidNameOffset(logs, config.guild)) bad.push("guild");
	if (!isValidNameOffset(logs, config.player_one)) bad.push("player_one");
	if (!isValidNameOffset(logs, config.player_two)) bad.push("player_two");
	return bad;
}

export function findKillOffset(logs: LogType[]): number[] {
	// Candidate positions: anywhere a "01" appears outside a name's byte range.
	const candidates = new Set<number>();
	for (const log of logs) {
		const indicies = find_all_indicies(log.hex, "01").filter((index) => log.names.every((n) => index > n.offset + 64 || index < n.offset));
		for (const index of indicies) candidates.add(index);
	}

	const toggleStats = new Map<number, { kills: number; deaths: number }>();
	for (const index of candidates) {
		toggleStats.set(index, { kills: 0, deaths: 0 });
	}
	for (const log of logs) {
		for (const index of candidates) {
			const pair = log.hex.slice(index, index + 2);
			const stat = toggleStats.get(index)!;
			if (pair === "01") stat.kills++;
			else if (pair === "00") stat.deaths++;
		}
	}

	return Array.from(toggleStats.entries())
		.filter(([, s]) => s.kills > 0 && s.deaths > 0 && (s.kills + s.deaths) / logs.length >= KILL_FLAG_COVERAGE)
		.sort((a, b) => {
			const coverage = b[1].kills + b[1].deaths - (a[1].kills + a[1].deaths);
			if (coverage !== 0) return coverage;
			return Math.abs(a[1].kills - a[1].deaths) - Math.abs(b[1].kills - b[1].deaths);
		})
		.slice(0, MAX_KILL_OFFSET_CANDIDATES)
		.map(([index]) => index + 1);
}

export function mergeKillOffsets(logs: LogType[], seed: number | undefined): number[] {
	const detected = findKillOffset(logs);
	if (seed === undefined || seed <= 0) return detected;

	const rest = detected.filter((offset) => offset !== seed);
	return isKillFlagOffset(logs, seed) || rest.length === 0 ? [seed, ...rest] : [...rest, seed];
}

export interface NameOffsetCandidate {
	offset: number;
	count: number;
}

export function rankNameOffsets(logs: LogType[], possibleNameOffsets: NameOffsetCandidate[][]): NameOffsetCandidate[][] {
	const next = possibleNameOffsets.map((list) => list.map((n) => ({ ...n, count: 0 })));

	for (const log of logs) {
		for (let i = 0; i < log.names.length; i++) {
			const name = log.names[i];
			if (next[i]) {
				const index = next[i].findIndex((n) => n.offset === name.offset);
				index !== -1 ? next[i][index].count++ : next[i].push({ offset: name.offset, count: 1 });
			} else {
				next[i] = [{ offset: name.offset, count: 1 }];
			}
		}
	}

	for (let i = 0; i < next.length; i++) {
		const phantom = phantomOffsets(
			logs,
			i,
			next[i].map((c) => c.offset),
		);
		next[i] = next[i].sort((a, b) => {
			const pa = phantom.has(a.offset) ? 1 : 0;
			const pb = phantom.has(b.offset) ? 1 : 0;
			if (pa !== pb) return pa - pb;
			return b.count - a.count;
		});
	}

	return next;
}

export function findMostFrequentIdentifier(logs: LogType[]): string | undefined {
	const identifiers = new Map<string, number>();
	for (const log of logs) {
		identifiers.set(log.identifier, (identifiers.get(log.identifier) || 0) + 1);
	}

	return Array.from(identifiers.entries())
		.sort((a, b) => b[1] - a[1])
		.map((a) => a[0])[0];
}
