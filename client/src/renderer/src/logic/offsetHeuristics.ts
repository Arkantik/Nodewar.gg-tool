import type { LogType } from "../components/create-config/config";
import { find_all_indicies } from "./util";

const MAX_KILL_OFFSET_CANDIDATES = 5;

export function findKillOffset(logs: LogType[]): number[] {
	const allIndicies: number[] = [];
	for (const log of logs) {
		let indicies = find_all_indicies(log.hex, "01");
		indicies = indicies.filter((index) => log.names.every((n) => index > n.offset + 64 || index < n.offset));
		allIndicies.push(...indicies);
	}

	const possibleKillOffsetsMap = new Map<number, number>();
	for (const log of logs) {
		for (const index of allIndicies) {
			if (log.hex.slice(index, index + 2) === "00") {
				possibleKillOffsetsMap.set(index, (possibleKillOffsetsMap.get(index) || 0) + 1);
			}
		}
	}

	return Array.from(possibleKillOffsetsMap.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, MAX_KILL_OFFSET_CANDIDATES)
		.map((a) => a[0] + 1);
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
		next[i] = next[i].sort((a, b) => b.count - a.count);
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
