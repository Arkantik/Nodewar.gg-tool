import { LuX } from "react-icons/lu";
import type { RowComponentProps } from "react-window";
import Icon from "../ui/Icon";
import type { LogType } from "./config";
import Select from "./Select";

export interface LoggerRowProps {
  logs: LogType[];
  possibleKillOffsets: number[];
  killIndex: number;
  playerOneIndex: number;
  playerTwoIndex: number;
  guildIndex: number;
  updateNames: (
    target: "player_one" | "player_two" | "guild",
    value: number,
  ) => void;
  getNameOptions: (log: LogType) => string[];
  onDeleteLog: (index: number) => void;
  translations: {
    killed: string;
    diedTo: string;
    from: string;
    deleteEntry: string;
  };
}

export function LoggerRowComponent({
  index,
  style,
  logs,
  possibleKillOffsets,
  killIndex,
  playerOneIndex,
  playerTwoIndex,
  guildIndex,
  updateNames,
  getNameOptions,
  onDeleteLog,
  translations,
}: RowComponentProps<LoggerRowProps>) {
  const log = logs[index];
  const isKill = log.hex[possibleKillOffsets[killIndex]] === "1";
  const nameOptions = getNameOptions(log);

  return (
    <div
      style={style}
      className="flex gap-2 items-center px-2 border-b border-white/5 hover:bg-white/5 group"
    >
      <span className="text-xs text-gray-500 w-16">{log.time}</span>
      <Select
        options={nameOptions}
        selectedValue={playerOneIndex}
        onChange={(value) => updateNames("player_one", value)}
        className="w-full max-w-32 text-xs"
      />
      <div className="flex justify-center items-center w-20">
        {isKill ? (
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
        options={nameOptions}
        selectedValue={playerTwoIndex}
        onChange={(value) => updateNames("player_two", value)}
        className="w-full max-w-32 text-xs"
      />
      <span className="text-xs text-gray-500 shrink-0">
        {translations.from}
      </span>
      <Select
        options={nameOptions}
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
