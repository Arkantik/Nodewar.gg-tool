import { forwardRef, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { LuSettings, LuSave, LuUpload } from "react-icons/lu";
import { List } from "react-window";
import { useLoggerLogs } from "../../logic/useLoggerLogs";
import { ModalManager } from "../modal/modal-store";
import Button from "../ui/Button";
import Checkbox from "../ui/Checkbox";
import Icon from "../ui/Icon";
import LoadingIndicator from "../ui/LoadingIndicator";
import type { LogType } from "./config";
import ConfigModal, { type ConfigModalOptions } from "./ConfigModal";
import { LoggerRowComponent } from "./LoggerRow";

export interface LoggerProps {
  logs: LogType[];
  loading?: boolean;
  onStatsUpdate?: (stats: {
    kills: number;
    deaths: number;
    kdr: number;
  }) => void;
  onDeleteLog?: (index: number) => void;
  onIndicesChange?: (indices: { playerTwo: number; guild: number }) => void;
  onKillOffsetChange?: (offset: number | undefined) => void;
}

export interface LoggerHandle {
  saveSessionToHistory: () => Promise<void>;
}

const Logger = forwardRef<LoggerHandle, LoggerProps>(function Logger(
  {
    logs,
    loading = false,
    onStatsUpdate,
    onDeleteLog,
    onIndicesChange,
    onKillOffsetChange,
  },
  ref,
) {
  const { t } = useTranslation();
  const {
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
  } = useLoggerLogs(logs, onStatsUpdate, onIndicesChange, onKillOffsetChange);

  useImperativeHandle(ref, () => ({
    saveSessionToHistory: saveCurrentSessionToHistory,
  }));

  function handleUploadToNodewar() {
    window.api.shell.openExternal("https://nodewar.gg/account");
  }

  const disabled = logs.length === 0 || loading;

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex items-center justify-between mb-1.5 gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Checkbox
            checked={autoScroll}
            onChange={(e) => setAutoScrollAndPersist(e.target.checked)}
          />
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {t("logger.autoScroll")}
          </span>
        </div>

        <div className="hidden lg:block flex-1 min-w-0 text-center text-gray-400 text-xs truncate">
          {t("logger.formatHint")}{" "}
          <span className="font-semibold text-gray-300">
            YourGuild-FamilyName
          </span>{" "}
          {t("logger.killed")}/{t("logger.diedTo")}{" "}
          <span className="font-semibold text-gray-300">Enemy-FamilyName</span>{" "}
          {t("logger.from")}{" "}
          <span className="font-semibold text-gray-300">Guild</span>
        </div>

        <button
          onClick={() =>
            config &&
            ModalManager.open(ConfigModal, {
              config,
              options: {
                possible_kill_offsets: possibleKillOffsets,
                possible_name_offsets: possibleNameOffsets,
                name_indicies: nameIndicies,
                player_one_index: playerOneIndex,
                player_two_index: playerTwoIndex,
                guild_index: guildIndex,
                kill_index: killIndex,
                include_characters: config.include_characters,
              },
              onChange: async (options: ConfigModalOptions) => {
                setPossibleKillOffsets(options.possible_kill_offsets);
                setPossibleNameOffsets(options.possible_name_offsets);
                setNameIndicies(options.name_indicies);
                setPlayerOneIndex(options.player_one_index);
                setPlayerTwoIndex(options.player_two_index);
                setGuildIndex(options.guild_index);
                setKillIndex(options.kill_index);
                if (config) {
                  config.include_characters = options.include_characters;
                  await updateConfigWrapper();
                }
              },
            })
          }
          className="cursor-pointer p-2.5 group rounded-md transition-all duration-150 ease-out hover:bg-white/10 active:scale-90 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
          title={t("logger.advancedConfig")}
        >
          <Icon icon={LuSettings} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden rounded-md border border-white/10 bg-black/20 mb-3">
        {logs.length > 0 && (
          <div className="flex gap-2 items-center px-2 h-8 border-b border-white/10 shrink-0">
            <span className="section-label w-16">{t("logger.table.time")}</span>
            <span className="section-label w-full max-w-32">
              {t("logger.table.playerOne")}
            </span>
            <span className="section-label w-20 text-center">
              {t("logger.table.result")}
            </span>
            <span className="section-label w-full max-w-32">
              {t("logger.table.playerTwo")}
            </span>
            <span className="text-xs invisible">{t("logger.from")}</span>
            <span className="section-label w-full max-w-32">
              {t("logger.table.guild")}
            </span>
            <span className="w-6 shrink-0" />
          </div>
        )}
        {loading && logs.length === 0 ? (
          <div className="flex-1 flex justify-center items-center">
            <LoadingIndicator />
          </div>
        ) : logs.length === 0 && !loading ? (
          <div className="flex-1 flex justify-center items-center">
            <p className="text-gray-400">{t("logger.waitingForLogs")}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <List
              className="react-window-list"
              rowComponent={LoggerRowComponent}
              rowCount={logs.length}
              rowHeight={40}
              rowProps={{
                logs,
                possibleKillOffsets,
                killIndex,
                playerOneIndex,
                playerTwoIndex,
                guildIndex,
                updateNames,
                getNameOptions,
                onDeleteLog: (index: number) => onDeleteLog?.(index),
                translations: {
                  killed: t("logger.killed"),
                  diedTo: t("logger.diedTo"),
                  from: t("logger.from"),
                  deleteEntry: t("logger.deleteEntry"),
                },
              }}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          className="w-full"
          onClick={saveLogs}
          disabled={disabled}
          size="md"
          color="primary"
        >
          <Icon icon={LuSave} size="sm" className="mr-2" />
          {t("logger.saveLogs")}
        </Button>
        <Button
          className="w-full"
          onClick={handleUploadToNodewar}
          disabled={disabled}
          size="md"
          color="outline"
        >
          <Icon icon={LuUpload} size="sm" className="mr-2" />
          {t("logger.uploadToNodewarGG")}
        </Button>
      </div>
    </div>
  );
});

export default Logger;
