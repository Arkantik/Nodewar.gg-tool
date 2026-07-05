import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { LuSave, LuUpload, LuX } from "react-icons/lu";
import { List, type RowComponentProps } from "react-window";
import { open_save_location } from "../../logic/file";
import { useHistoryStore } from "../../logic/history-store";
import { useNameIndices } from "../../logic/useNameIndices";
import { mostFrequent } from "../../logic/util";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import LoadingIndicator from "../ui/LoadingIndicator";
import { get_date, get_formatted_date, type Log } from "./config";
import { useConfigStore } from "./config-store";
import Select from "./Select";

interface LogEditorProps {
  logs: Log[];
  loading?: boolean;
  onDeleteLog?: (index: number) => void;
  onIndicesChange?: (indices: { playerTwo: number; guild: number }) => void;
}

interface RowProps {
  logs: Log[];
  playerOneIndex: number;
  playerTwoIndex: number;
  guildIndex: number;
  updateNames: (
    target: "player_one" | "player_two" | "guild",
    value: number,
  ) => void;
  onDeleteLog: (index: number) => void;
  translations: {
    killed: string;
    diedTo: string;
    from: string;
    deleteEntry: string;
  };
}

function LogEditor({
  logs,
  loading = false,
  onDeleteLog,
  onIndicesChange,
}: LogEditorProps) {
  const { t } = useTranslation();
  const { playerOneIndex, playerTwoIndex, guildIndex, updateNames } =
    useNameIndices(onIndicesChange);
  const config = useConfigStore((s) => s.config);
  const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
  const addHistoryEntry = useHistoryStore((s) => s.addEntry);

  useEffect(() => {
    ensureConfigLoaded();
  }, [ensureConfigLoaded]);

  function getLogsString() {
    const currentUtcHour = new Date().getUTCHours();
    const useNewFormat = currentUtcHour < 18;

    return logs
      .map((log) => {
        const remainingIndicies = [0, 1, 2, 3, 4].filter(
          (i) =>
            i !== playerOneIndex && i !== playerTwoIndex && i !== guildIndex,
        );
        const remainingNames = remainingIndicies.map((i) => log.names[i]);
        // Only append the parenthetical when the app is configured to include character
        // names AND this log actually has them (e.g. it wasn't recorded with the option
        // off) - otherwise this used to silently emit a stray " (,)" on every line.
        const characters =
          config?.include_characters && remainingNames.every(Boolean)
            ? ` (${remainingNames.join(",")})`
            : "";

        if (useNewFormat) {
          return `[${log.time}] ${log.names[playerOneIndex]} ${log.kill ? "killed" : "was slain by"} ${log.names[playerTwoIndex]} ${log.kill ? "from the" : "of the"} ${log.names[guildIndex]}${characters}`;
        } else {
          return `[${log.time}] ${log.names[playerOneIndex]} ${log.kill ? "has killed" : "died to"} ${log.names[playerTwoIndex]} from ${log.names[guildIndex]}${characters}`;
        }
      })
      .join("\n");
  }

  async function saveLogs() {
    const path = await open_save_location(
      get_formatted_date(get_date()) + ".log",
    );
    if (!path) return;
    const text = getLogsString();
    await window.api.fs.writeFile(path, text);

    const kills = logs.filter((log) => log.kill).length;
    const deaths = logs.length - kills;
    const kdr = deaths > 0 ? parseFloat((kills / deaths).toFixed(2)) : kills;

    await addHistoryEntry({
      date: new Date().toISOString(),
      kills,
      deaths,
      kdr,
      topGuild: mostFrequent(logs.map((log) => log.names[guildIndex])),
      topEnemy: mostFrequent(logs.map((log) => log.names[playerTwoIndex])),
      logText: text,
    });
  }

  function handleUploadToNodewar() {
    window.api.shell.openExternal("https://nodewar.gg/account");
  }

  const disabled = logs.length === 0 || loading;

  return (
    <div className="flex flex-col h-full w-full relative">
      {logs.length > 0 && (
        <div className="text-center text-gray-400 text-xs mb-2">
          {t("logger.formatHint")}{" "}
          <span className="font-semibold text-gray-300">
            YourGuild-FamilyName
          </span>{" "}
          {t("common.kills")}/{t("logger.diedTo")}{" "}
          <span className="font-semibold text-gray-300">Enemy-FamilyName</span>{" "}
          {t("logger.from")}{" "}
          <span className="font-semibold text-gray-300">Guild</span>
        </div>
      )}

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
              rowComponent={RowComponent}
              rowCount={logs.length}
              rowHeight={40}
              rowProps={{
                logs,
                playerOneIndex,
                playerTwoIndex,
                guildIndex,
                updateNames,
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
          color="gradient"
        >
          <Icon icon={LuUpload} size="sm" className="mr-2" />
          {t("logger.uploadToNodewarGG")}
        </Button>
      </div>
    </div>
  );
}

function RowComponent({
  index,
  style,
  logs,
  playerOneIndex,
  playerTwoIndex,
  guildIndex,
  updateNames,
  onDeleteLog,
  translations,
}: RowComponentProps<RowProps>) {
  const log = logs[index];
  return (
    <div
      style={style}
      className="flex gap-2 items-center px-2 border-b border-white/5 hover:bg-white/5 group"
    >
      <span className="text-xs text-gray-500 w-16">{log.time}</span>
      <Select
        options={log.names}
        selectedValue={playerOneIndex}
        onChange={(value) => updateNames("player_one", value)}
        className="w-full max-w-32 text-xs"
      />
      <div className="flex justify-center items-center w-20">
        {log.kill ? (
          <span className="text-xs font-medium text-green-400">
            {translations.killed}
          </span>
        ) : (
          <span className="text-xs font-medium text-red-400">
            {translations.diedTo}
          </span>
        )}
      </div>
      <Select
        options={log.names}
        selectedValue={playerTwoIndex}
        onChange={(value) => updateNames("player_two", value)}
        className="w-full max-w-32 text-xs"
      />
      <span className="text-xs text-gray-500 shrink-0">
        {translations.from}
      </span>
      <Select
        options={log.names}
        selectedValue={guildIndex}
        onChange={(value) => updateNames("guild", value)}
        className="w-full max-w-32 text-xs"
      />
      <button
        onClick={() => onDeleteLog(index)}
        className="cursor-pointer ml-auto p-1 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-all duration-150 ease-out active:scale-90 opacity-0 group-hover:opacity-100 hover:border-red-400/20"
        title={translations.deleteEntry}
      >
        <Icon icon={LuX} size="sm" />
      </button>
    </div>
  );
}

export default LogEditor;
export type { RowProps };
