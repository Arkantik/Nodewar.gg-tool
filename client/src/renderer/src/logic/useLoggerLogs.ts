import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get_date, type LogType } from "../components/create-config/config";
import { useConfigStore } from "../components/create-config/config-store";
import { findKillOffset, findMostFrequentIdentifier, rankNameOffsets, type NameOffsetCandidate } from "./configDetection";
import { readNameAt } from "./configNames";
import { extractDeathCoordinates, formatCoordinates } from "./coordinates";
import { getNetworkDeathLogs, getNetworkIsKill } from "./deathLogs";
import { saveLogsToFile } from "./saveLogsToFile";
import { useNameIndices } from "./useNameIndices";
import { useSaveLogsToHistory } from "./useSaveLogsToHistory";
import { mostFrequent } from "./util";

const PINNED_OFFSET_MAX_RANK = 5;

export interface LoggerStats {
	kills: number;
	deaths: number;
	kdr: number;
}

export interface ConfigSelection {
	possible_kill_offsets: number[];
	possible_name_offsets: NameOffsetCandidate[][];
	name_indicies: number[];
	player_one_index: number;
	player_two_index: number;
	guild_index: number;
	kill_index: number;
	include_characters: boolean;
}

export function useLoggerLogs(logs: LogType[], onStatsUpdate?: (stats: LoggerStats) => void, onIndicesChange?: (indices: { playerTwo: number; guild: number }) => void, onKillOffsetChange?: (offset: number | undefined) => void) {
	const [possibleNameOffsets, setPossibleNameOffsets] = useState<NameOffsetCandidate[][]>([]);
	const [nameIndicies, setNameIndicies] = useState<number[]>([0, 0, 0, 0, 0]);
	const [possibleKillOffsets, setPossibleKillOffsets] = useState<number[]>([]);
	const [killIndex, setKillIndex] = useState(0);
	const [autoScroll, setAutoScroll] = useState(true);
	const { playerOneIndex, playerTwoIndex, guildIndex, setPlayerOneIndex, setPlayerTwoIndex, setGuildIndex, updateNames } = useNameIndices(onIndicesChange);

	const config = useConfigStore((s) => s.config);
	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
	const updateConfig = useConfigStore((s) => s.updateConfig);
	const saveLogsToHistory = useSaveLogsToHistory();

	const killPinned = useRef(false);

	const seeded = useRef(false);
	useEffect(() => {
		(async () => {
			const cfg = await ensureConfigLoaded();
			if (seeded.current) return;
			seeded.current = true;

			setPossibleKillOffsets([cfg.kill]);
			setPossibleNameOffsets([[{ offset: cfg.player_one, count: 1 }], [{ offset: cfg.player_two, count: 1 }], [{ offset: cfg.guild, count: 1 }]]);
			setAutoScroll(cfg.auto_scroll);
		})();
	}, [ensureConfigLoaded]);

	useEffect(() => {
		if (logs.length === 0) return;
		if (autoScroll) setTimeout(scrollToBottom);
		if (logs.length < 50 || logs.length % 100 === 0) void recalculate();
	}, [logs]);

	const killOffset = possibleKillOffsets[killIndex];

	const stats = useMemo(() => {
		if (logs.length === 0 || killOffset === undefined) return null;

		let kills = 0;
		let deaths = 0;
		for (const log of logs) {
			const isKill = getNetworkIsKill(log.hex, killOffset);
			if (isKill === undefined) continue;
			if (isKill) kills++;
			else deaths++;
		}

		return { kills, deaths, kdr: deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills };
	}, [logs, killOffset]);

	useEffect(() => {
		if (stats) onStatsUpdate?.(stats);
		onKillOffsetChange?.(killOffset);
	}, [stats, onStatsUpdate, killOffset, onKillOffsetChange]);

	function currentSelection(): ConfigSelection {
		return {
			possible_kill_offsets: possibleKillOffsets,
			possible_name_offsets: possibleNameOffsets,
			name_indicies: nameIndicies,
			player_one_index: playerOneIndex,
			player_two_index: playerTwoIndex,
			guild_index: guildIndex,
			kill_index: killIndex,
			include_characters: config?.include_characters ?? true,
		};
	}

	async function recalculate() {
		const detected = findKillOffset(logs);
		const killOffsets = detected.length > 0 ? detected : possibleKillOffsets;
		const nameOffsets = rankNameOffsets(logs, possibleNameOffsets);

		let nextKillIndex = killIndex;
		if (killPinned.current) {
			const pinnedOffset = possibleKillOffsets[killIndex];
			const at = pinnedOffset === undefined ? -1 : killOffsets.indexOf(pinnedOffset);
			const stillTrusted = at !== -1 && at < PINNED_OFFSET_MAX_RANK;
			nextKillIndex = stillTrusted ? at : 0;
			killPinned.current = stillTrusted;
		}

		setPossibleKillOffsets(killOffsets);
		setPossibleNameOffsets(nameOffsets);
		setKillIndex(nextKillIndex);

		await persistConfig(
			{
				...currentSelection(),
				possible_kill_offsets: killOffsets,
				possible_name_offsets: nameOffsets,
				kill_index: nextKillIndex,
			},
			findMostFrequentIdentifier(logs),
		);
	}

	async function persistConfig(selection: ConfigSelection, identifier?: string) {
		const stored = useConfigStore.getState().config;
		if (!stored) return;

		const offsetAt = (slot: number) => selection.possible_name_offsets[slot]?.[selection.name_indicies[slot]]?.offset || 0;

		await updateConfig({
			...stored,
			patch: get_date(),
			identifier: identifier || stored.identifier,
			player_one: offsetAt(selection.player_one_index),
			player_two: offsetAt(selection.player_two_index),
			guild: offsetAt(selection.guild_index),
			kill: selection.possible_kill_offsets[selection.kill_index] ?? stored.kill,
			include_characters: selection.include_characters,
		});
	}

	async function applyConfigSelectionImpl(selection: ConfigSelection) {
		if (selection.kill_index !== killIndex) killPinned.current = true;

		setPossibleKillOffsets(selection.possible_kill_offsets);
		setPossibleNameOffsets(selection.possible_name_offsets);
		setNameIndicies(selection.name_indicies);
		setPlayerOneIndex(selection.player_one_index);
		setPlayerTwoIndex(selection.player_two_index);
		setGuildIndex(selection.guild_index);
		setKillIndex(selection.kill_index);

		await persistConfig(selection);
	}

	const applyRef = useRef(applyConfigSelectionImpl);
	applyRef.current = applyConfigSelectionImpl;
	const applyConfigSelection = useCallback((selection: ConfigSelection) => applyRef.current(selection), []);

	function setAutoScrollAndPersist(checked: boolean) {
		setAutoScroll(checked);
		if (config) void updateConfig({ ...config, auto_scroll: checked });
	}

	function getName(slot: number, log: LogType) {
		const offset = possibleNameOffsets[slot]?.[nameIndicies[slot]]?.offset;
		return offset === undefined ? "" : readNameAt(log.hex, offset);
	}

	function getNameOptions(log: LogType) {
		return possibleNameOffsets.map((_, slot) => getName(slot, log));
	}

	function scrollToBottom() {
		const container = document.querySelector(".react-window-list");
		if (container) container.scrollTop = container.scrollHeight;
	}

	function getLogsString() {
		return logs
			.map((log) => {
				const playerOneName = getName(playerOneIndex, log);
				const playerTwoName = getName(playerTwoIndex, log);
				const guildName = getName(guildIndex, log);

				let characters = "";
				if (config?.include_characters) {
					const remaining = [0, 1, 2, 3, 4].filter((i) => i !== playerOneIndex && i !== playerTwoIndex && i !== guildIndex);
					const remainingNames = remaining.map((i) => getName(i, log));
					if (remainingNames.every(Boolean)) characters = ` (${remainingNames.join(",")})`;
				}

				const isKill = getNetworkIsKill(log.hex, killOffset);
				const victimSlot = isKill ? playerTwoIndex : playerOneIndex;
				const coords = extractDeathCoordinates(log.hex, possibleNameOffsets[victimSlot]?.[nameIndicies[victimSlot]]?.offset);
				const coordsSuffix = coords ? ` ${formatCoordinates(coords)}` : "";

				const verb = isKill ? "has killed" : "died to";
				return `[${log.time}] ${playerOneName} ${verb} ${playerTwoName} from ${guildName}${characters}${coordsSuffix}`;
			})
			.join("\n");
	}

	async function saveLogs() {
		await saveLogsToFile(getLogsString());
	}

	async function saveCurrentSessionToHistory() {
		const { kills, deaths, kdr } = stats ?? { kills: 0, deaths: 0, kdr: 0 };
		const deathLogs = getNetworkDeathLogs(logs, killOffset);

		await saveLogsToHistory({
			text: getLogsString(),
			kills,
			deaths,
			kdr,
			topGuild: config ? mostFrequent(logs.map((log) => readNameAt(log.hex, config.guild))) : "",
			topEnemy: config ? mostFrequent(deathLogs.map((log) => readNameAt(log.hex, config.player_two))) : "",
		});
	}

	return {
		config,
		autoScroll,
		setAutoScrollAndPersist,
		possibleKillOffsets,
		possibleNameOffsets,
		nameIndicies,
		killIndex,
		playerOneIndex,
		playerTwoIndex,
		guildIndex,
		updateNames,
		applyConfigSelection,
		getNameOptions,
		saveLogs,
		saveCurrentSessionToHistory,
	};
}
