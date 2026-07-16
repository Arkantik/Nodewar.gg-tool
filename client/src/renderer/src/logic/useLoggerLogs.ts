import { useEffect, useMemo, useState } from "react";
import { extractDeathCoordinates, formatCoordinates } from "./coordinates";
import { getNetworkDeathLogs } from "./deathLogs";
import { findKillOffset, findMostFrequentIdentifier, rankNameOffsets } from "./offsetHeuristics";
import { saveLogsToFile } from "./saveLogsToFile";
import { useSaveLogsToHistory } from "./useSaveLogsToHistory";
import { useNameIndices } from "./useNameIndices";
import { mostFrequent } from "./util";
import { get_date, hexToString, type Config, type LogType } from "../components/create-config/config";
import { useConfigStore } from "../components/create-config/config-store";

export interface LoggerStats {
  kills: number;
  deaths: number;
  kdr: number;
}

export interface ConfigOverrides {
  possibleNameOffsets?: { offset: number; count: number }[][];
  nameIndicies?: number[];
  playerOneIndex?: number;
  playerTwoIndex?: number;
  guildIndex?: number;
  killIndex?: number;
}

export function useLoggerLogs(
  logs: LogType[],
  onStatsUpdate?: (stats: LoggerStats) => void,
  onIndicesChange?: (indices: { playerTwo: number; guild: number }) => void,
  onKillOffsetChange?: (offset: number | undefined) => void,
) {
  const [possibleNameOffsets, setPossibleNameOffsets] = useState<
    { offset: number; count: number }[][]
  >([]);
  const [nameIndicies, setNameIndicies] = useState<number[]>([0, 0, 0, 0, 0]);
  const {
    playerOneIndex,
    playerTwoIndex,
    guildIndex,
    setPlayerOneIndex,
    setPlayerTwoIndex,
    setGuildIndex,
    updateNames,
  } = useNameIndices(onIndicesChange);
  const [possibleKillOffsets, setPossibleKillOffsets] = useState<number[]>([]);
  const [killIndex, setKillIndex] = useState(0);
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
      setPossibleNameOffsets([
        [{ offset: cfg.player_one, count: 1 }],
        [{ offset: cfg.player_two, count: 1 }],
        [{ offset: cfg.guild, count: 1 }],
      ]);
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
      const killOffsets = findKillOffset(logs);
      setPossibleKillOffsets(killOffsets);
      calculateConfig();
    }
  }

  async function calculateConfig() {
    const newPossibleNameOffsets = rankNameOffsets(logs, possibleNameOffsets);
    const identifier = findMostFrequentIdentifier(logs);

    const resolvedIndices = { playerOne: playerOneIndex, playerTwo: playerTwoIndex, guild: guildIndex };

    setPossibleNameOffsets(newPossibleNameOffsets);
    await updateConfigWrapper(identifier, {
      possibleNameOffsets: newPossibleNameOffsets,
      playerOneIndex: resolvedIndices.playerOne,
      playerTwoIndex: resolvedIndices.playerTwo,
      guildIndex: resolvedIndices.guild,
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

    const newConfig = {
      ...config,
      patch: get_date(),
      identifier: identifier || config.identifier,
      player_one: offsets[p1]?.[indices[p1]]?.offset || 0,
      player_two: offsets[p2]?.[indices[p2]]?.offset || 0,
      guild: offsets[g]?.[indices[g]]?.offset || 0,
      kill: possibleKillOffsets[kIdx],
    };

    const updated = await updateConfig(newConfig);
    setConfig(updated);
  }

  function getName(i: number, log: LogType) {
    const list = possibleNameOffsets[i];
    if (!list) return "";
    const selected = nameIndicies[i];
    return hexToString(
      log.hex.slice(list[selected]?.offset, list[selected]?.offset + 64),
    )
      .replaceAll("\0", "")
      .replaceAll(" ", "");
  }

  function getNameOptions(log: LogType) {
    return possibleNameOffsets.map((list, index) => {
      const selected = nameIndicies[index];
      return hexToString(
        log.hex.slice(list[selected]?.offset, list[selected]?.offset + 64),
      )
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
        const remainingIndicies = [0, 1, 2, 3, 4].filter(
          (i) =>
            i !== playerOneIndex && i !== playerTwoIndex && i !== guildIndex,
        );
        const remainingNames = remainingIndicies.map((i) => getName(i, log));
        characters = ` (${remainingNames.join(",")})`;
      }

      const isKill = log.hex[possibleKillOffsets[killIndex]] === "1";

      const playerOneOffset = possibleNameOffsets[playerOneIndex]?.[nameIndicies[playerOneIndex]]?.offset;
      const coords = extractDeathCoordinates(log.hex, playerOneOffset);
      const coordsSuffix = coords ? ` ${formatCoordinates(coords)}` : "";

      if (isKill) {
        output += `[${log.time}] ${playerOneName} has killed ${playerTwoName} from ${guildName}${characters}${coordsSuffix}\n`;
      } else {
        output += `[${log.time}] ${playerOneName} died to ${playerTwoName} from ${guildName}${characters}${coordsSuffix}\n`;
      }
    }
    return output;
  }

  async function saveLogs() {
    const text = getLogsString();
    await saveLogsToFile(text);
  }

  async function saveCurrentSessionToHistory() {
    const { kills, deaths, kdr } = stats ?? { kills: 0, deaths: 0, kdr: 0 };

    const deathLogs = getNetworkDeathLogs(logs, possibleKillOffsets[killIndex]);

    await saveLogsToHistory({
      text: getLogsString(),
      kills,
      deaths,
      kdr,
      topGuild: mostFrequent(logs.map((log) => log.names[guildIndex]?.name)),
      topEnemy: mostFrequent(deathLogs.map((log) => log.names[playerTwoIndex]?.name)),
    });
  }

  return {
    config,
    autoScroll,
    setAutoScrollAndPersist,
    possibleKillOffsets,
    setPossibleKillOffsets,
    possibleNameOffsets,
    setPossibleNameOffsets,
    nameIndicies,
    setNameIndicies,
    killIndex,
    setKillIndex,
    playerOneIndex,
    setPlayerOneIndex,
    playerTwoIndex,
    setPlayerTwoIndex,
    guildIndex,
    setGuildIndex,
    updateNames,
    updateConfigWrapper,
    getNameOptions,
    saveLogs,
    saveCurrentSessionToHistory,
  };
}
