import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { get_date, hexToString, type Config, type LogType } from "../components/create-config/config";
import { useConfigStore } from "../components/create-config/config-store";
import ConfirmModal from "../components/modal/ConfirmModal";
import { ModalManager } from "../components/modal/modal-store";
import { ToastManager } from "../components/toast/toast-store";
import i18n from "../i18n";
import { extractDeathCoordinates, formatCoordinates } from "./coordinates";
import { getNetworkDeathLogs } from "./deathLogs";
import { findMostFrequentIdentifier, invalidConfigOffsets, mergeKillOffsets, rankNameOffsets, readNameAt } from "./offsetHeuristics";
import { saveLogsToFile } from "./saveLogsToFile";
import { useNameIndices } from "./useNameIndices";
import { useSaveLogsToHistory } from "./useSaveLogsToHistory";
import { mostFrequent } from "./util";

export interface LoggerStats {
	kills: number;
	deaths: number;
	kdr: number;
}

export interface ConfigOverrides {
	possibleKillOffsets?: number[];
	possibleNameOffsets?: { offset: number; count: number }[][];
	nameIndicies?: number[];
	playerOneIndex?: number;
	playerTwoIndex?: number;
	guildIndex?: number;
	killIndex?: number;
	includeCharacters?: boolean;
}

export interface ConfigSelection {
	possible_kill_offsets: number[];
	possible_name_offsets: { offset: number; count: number }[][];
	name_indicies: number[];
	player_one_index: number;
	player_two_index: number;
	guild_index: number;
	kill_index: number;
	include_characters: boolean;
}

function sameOffsets(a: number[], b: number[]) {
	return a.length === b.length && a.every((value, i) => value === b[i]);
}

export function useLoggerLogs(logs: LogType[], onStatsUpdate?: (stats: LoggerStats) => void, onIndicesChange?: (indices: { playerTwo: number; guild: number }) => void, onKillOffsetChange?: (offset: number | undefined) => void) {
	const [possibleNameOffsets, setPossibleNameOffsets] = useState<{ offset: number; count: number }[][]>([]);
	const [nameIndicies, setNameIndicies] = useState<number[]>([0, 0, 0, 0, 0]);
	const { playerOneIndex, playerTwoIndex, guildIndex, setPlayerOneIndex, setPlayerTwoIndex, setGuildIndex, updateNames } = useNameIndices(onIndicesChange);
	const [possibleKillOffsets, setPossibleKillOffsets] = useState<number[]>([]);
	const [killIndex, setKillIndex] = useState(0);
	const [pinnedNameSlots, setPinnedNameSlots] = useState<number[]>([]);
	const [config, setConfig] = useState<Config | null>(null);
	const [autoScroll, setAutoScroll] = useState(true);
	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
	const updateConfig = useConfigStore((s) => s.updateConfig);
	const saveLogsToHistory = useSaveLogsToHistory();

	useEffect(() => {
		(async () => {
			const cfg = await ensureConfigLoaded();
			setConfig(cfg);
			setPossibleKillOffsets([cfg.kill]);
			setPossibleNameOffsets([[{ offset: cfg.player_one, count: 1 }], [{ offset: cfg.player_two, count: 1 }], [{ offset: cfg.guild, count: 1 }]]);
			setAutoScroll(cfg.auto_scroll);
		})();
	}, [ensureConfigLoaded]);

	useEffect(() => {
		if (logs.length > 0) logsChanged();
	}, [logs]);

	const stats = useMemo(() => {
		if (logs.length === 0 || possibleKillOffsets.length === 0) return null;

		let kills = 0;
		let deaths = 0;

		logs.forEach((log) => {
			const killOffset = possibleKillOffsets[killIndex];
			if (killOffset !== undefined && log.hex.length > killOffset) {
				const isKill = log.hex[killOffset] === "1";
				isKill ? kills++ : deaths++;
			}
		});

		const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;
		return { kills, deaths, kdr };
	}, [logs, possibleKillOffsets, killIndex]);

	useEffect(() => {
		if (stats) onStatsUpdate?.(stats);
		onKillOffsetChange?.(possibleKillOffsets[killIndex]);
	}, [stats, onStatsUpdate, possibleKillOffsets, killIndex, onKillOffsetChange]);

	function setAutoScrollAndPersist(checked: boolean) {
		setAutoScroll(checked);
		if (config) updateConfig({ ...config, auto_scroll: checked });
	}

	function logsChanged() {
		if (autoScroll) setTimeout(scroll);

		if (logs.length < 50 || logs.length % 100 === 0) {
			const merged = mergeKillOffsets(logs, config?.kill);
			const nextKillIndex = holdKillIndex(merged);

			if (merged.length > 0 && (!sameOffsets(merged, possibleKillOffsets) || nextKillIndex !== killIndex)) {
				setPossibleKillOffsets(merged);
				setKillIndex(nextKillIndex);
			}

			calculateConfig(merged.length > 0 ? merged : possibleKillOffsets, nextKillIndex);
		}
	}

	function holdKillIndex(candidates: number[]) {
		const current = possibleKillOffsets[killIndex];
		if (current === undefined) return 0;

		const at = candidates.indexOf(current);
		return at === -1 ? 0 : at;
	}

	async function calculateConfig(killOffsets: number[], kIndex: number) {
		const selectedOffsets = possibleNameOffsets.map((list, i) => list[nameIndicies[i]]?.offset);
		const newPossibleNameOffsets = rankNameOffsets(logs, possibleNameOffsets);
		const slotCount = Math.max(nameIndicies.length, newPossibleNameOffsets.length);
		const newNameIndicies = Array.from({ length: slotCount }, (_, i) => {
			if (!pinnedNameSlots.includes(i)) return 0;
			const selected = selectedOffsets[i];
			const kept = selected === undefined ? -1 : (newPossibleNameOffsets[i] ?? []).findIndex((c) => c.offset === selected);
			return kept === -1 ? 0 : kept;
		});
		const identifier = findMostFrequentIdentifier(logs);

		setPossibleNameOffsets(newPossibleNameOffsets);
		setNameIndicies(newNameIndicies);
		await updateConfigWrapper(identifier, {
			possibleKillOffsets: killOffsets,
			possibleNameOffsets: newPossibleNameOffsets,
			nameIndicies: newNameIndicies,
			killIndex: kIndex,
			playerOneIndex,
			playerTwoIndex,
			guildIndex,
		});
	}

	async function applyConfigSelectionImpl(selection: ConfigSelection) {
		const newlyPinned = selection.name_indicies.map((value, slot) => (value !== nameIndicies[slot] ? slot : -1)).filter((slot) => slot !== -1 && !pinnedNameSlots.includes(slot));
		if (newlyPinned.length > 0) setPinnedNameSlots((prev) => [...prev, ...newlyPinned]);

		setPossibleKillOffsets(selection.possible_kill_offsets);
		setPossibleNameOffsets(selection.possible_name_offsets);
		setNameIndicies(selection.name_indicies);
		setPlayerOneIndex(selection.player_one_index);
		setPlayerTwoIndex(selection.player_two_index);
		setGuildIndex(selection.guild_index);
		setKillIndex(selection.kill_index);

		await updateConfigWrapper(undefined, {
			possibleKillOffsets: selection.possible_kill_offsets,
			possibleNameOffsets: selection.possible_name_offsets,
			nameIndicies: selection.name_indicies,
			playerOneIndex: selection.player_one_index,
			playerTwoIndex: selection.player_two_index,
			guildIndex: selection.guild_index,
			killIndex: selection.kill_index,
			includeCharacters: selection.include_characters,
		});
	}

	async function updateConfigWrapper(identifier?: string, overrides: ConfigOverrides = {}) {
		if (!config) return;

		const offsets = overrides.possibleNameOffsets ?? possibleNameOffsets;
		const indices = overrides.nameIndicies ?? nameIndicies;
		const p1 = overrides.playerOneIndex ?? playerOneIndex;
		const p2 = overrides.playerTwoIndex ?? playerTwoIndex;
		const g = overrides.guildIndex ?? guildIndex;
		const kIdx = overrides.killIndex ?? killIndex;
		const killOffsets = overrides.possibleKillOffsets ?? possibleKillOffsets;

		const newConfig = {
			...config,
			patch: get_date(),
			identifier: identifier || config.identifier,
			player_one: offsets[p1]?.[indices[p1]]?.offset || 0,
			player_two: offsets[p2]?.[indices[p2]]?.offset || 0,
			guild: offsets[g]?.[indices[g]]?.offset || 0,
			kill: killOffsets[kIdx] ?? config.kill,
			include_characters: overrides.includeCharacters ?? config.include_characters,
		};

		const updated = await updateConfig(newConfig);
		setConfig(updated);
	}

	const applyRef = useRef(applyConfigSelectionImpl);
	applyRef.current = applyConfigSelectionImpl;
	const applyConfigSelection = useCallback((selection: ConfigSelection) => applyRef.current(selection), []);

	function getName(i: number, log: LogType) {
		const list = possibleNameOffsets[i];
		if (!list) return "";
		const selected = nameIndicies[i];
		return hexToString(log.hex.slice(list[selected]?.offset, list[selected]?.offset + 64))
			.replaceAll("\0", "")
			.replaceAll(" ", "");
	}

	function getNameOptions(log: LogType) {
		return possibleNameOffsets.map((list, index) => {
			const selected = nameIndicies[index];
			return hexToString(log.hex.slice(list[selected]?.offset, list[selected]?.offset + 64))
				.replaceAll("\0", "")
				.replaceAll(" ", "");
		});
	}

	function scroll() {
		const container = document.querySelector(".react-window-list");
		if (container) container.scrollTop = container.scrollHeight;
	}

	function getLogsString() {
		let output = "";
		for (const log of logs) {
			let characters = "";
			const playerOneName = getName(playerOneIndex, log);
			const playerTwoName = getName(playerTwoIndex, log);
			const guildName = getName(guildIndex, log);

			if (config?.include_characters) {
				const remainingIndicies = [0, 1, 2, 3, 4].filter((i) => i !== playerOneIndex && i !== playerTwoIndex && i !== guildIndex);
				const remainingNames = remainingIndicies.map((i) => getName(i, log));
				characters = ` (${remainingNames.join(",")})`;
			}

			const isKill = log.hex[possibleKillOffsets[killIndex]] === "1";

			const playerOneOffset = possibleNameOffsets[playerOneIndex]?.[nameIndicies[playerOneIndex]]?.offset;
			const playerTwoOffset = possibleNameOffsets[playerTwoIndex]?.[nameIndicies[playerTwoIndex]]?.offset;
			const victimOffset = isKill ? playerTwoOffset : playerOneOffset;
			const coords = extractDeathCoordinates(log.hex, victimOffset);
			const coordsSuffix = coords ? ` ${formatCoordinates(coords)}` : "";

			if (isKill) {
				output += `[${log.time}] ${playerOneName} has killed ${playerTwoName} from ${guildName}${characters}${coordsSuffix}\n`;
			} else {
				output += `[${log.time}] ${playerOneName} died to ${playerTwoName} from ${guildName}${characters}${coordsSuffix}\n`;
			}
		}
		return output;
	}

	function offsetWarning() {
		const bad = config ? invalidConfigOffsets(logs, config) : [];
		if (bad.length === 0) return null;
		const fields = bad.map((f) => i18n.t(`logger.saveWarning.fields.${f}`)).join(", ");
		return i18n.t("logger.saveWarning.message", { fields });
	}

	async function saveLogs() {
		const message = offsetWarning();
		const doSave = async () => {
			const text = getLogsString();
			await saveLogsToFile(text);
		};
		if (!message) {
			await doSave();
			return;
		}
		ModalManager.open(ConfirmModal, {
			title: i18n.t("logger.saveWarning.title"),
			message,
			confirmLabel: i18n.t("logger.saveWarning.saveAnyway"),
			cancelLabel: i18n.t("logger.saveWarning.cancel"),
			onConfirm: doSave,
		});
	}

	async function saveCurrentSessionToHistory() {
		const message = offsetWarning();
		if (message) ToastManager.warning(message);

		const { kills, deaths, kdr } = stats ?? { kills: 0, deaths: 0, kdr: 0 };

		const deathLogs = getNetworkDeathLogs(logs, possibleKillOffsets[killIndex]);

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
