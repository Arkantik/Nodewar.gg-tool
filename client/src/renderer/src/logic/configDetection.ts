import type { LogType } from "../components/create-config/config";
import { find_all_indicies } from "./util";

export interface NameOffsetCandidate {
	offset: number;
	count: number;
}

export function findKillOffset(logs: LogType[]): number[] {
	const candidates = new Set<number>();
	for (const log of logs) {
		for (const index of find_all_indicies(log.hex, "01")) {
			if (index % 2 !== 0) continue;
			if (log.names.every((n) => index > n.offset + 64 || index < n.offset)) candidates.add(index);
		}
	}

	return Array.from(candidates)
		.map((index) => {
			let kills = 0;
			let deaths = 0;
			for (const log of logs) {
				const byte = log.hex.slice(index, index + 2);
				if (byte === "01") kills++;
				else if (byte === "00") deaths++;
			}
			return { index, kills, deaths };
		})
		.filter((s) => s.kills > 0 && s.deaths > 0)
		.sort((a, b) => {
			const coverage = b.kills + b.deaths - (a.kills + a.deaths);
			if (coverage !== 0) return coverage;
			return a.index - b.index;
		})
		.map((s) => s.index + 1);
}

export function rankNameOffsets(logs: LogType[], previous: NameOffsetCandidate[][]): NameOffsetCandidate[][] {
	const next = previous.map((list) => list.map((candidate) => ({ ...candidate, count: 0 })));

	for (const log of logs) {
		for (let i = 0; i < log.names.length; i++) {
			const { offset } = log.names[i];
			if (!next[i]) {
				next[i] = [{ offset, count: 1 }];
				continue;
			}

			const at = next[i].findIndex((candidate) => candidate.offset === offset);
			if (at !== -1) next[i][at].count++;
			else next[i].push({ offset, count: 1 });
		}
	}

	return next.map((list) => list.sort((a, b) => b.count - a.count));
}

export function findMostFrequentIdentifier(logs: LogType[]): string | undefined {
	const identifiers = new Map<string, number>();
	for (const log of logs) {
		identifiers.set(log.identifier, (identifiers.get(log.identifier) || 0) + 1);
	}

	return Array.from(identifiers.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
}
