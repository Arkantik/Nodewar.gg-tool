import { useTranslation } from "react-i18next";
import { IoMdClipboard } from "react-icons/io";
import type { ConfigSelection } from "../../logic/useLoggerLogs";
import Checkbox from "../ui/Checkbox";
import Icon from "../ui/Icon";
import { copy_to_clipboard, type Config } from "./config";
import Select from "./Select";

export type ConfigModalOptions = ConfigSelection;

export interface ConfigModalProps {
	config: Config;
	options: ConfigModalOptions;
	onChange: (new_options: ConfigModalOptions) => void;
}

function ConfigModal({ config, options, onChange }: ConfigModalProps) {
	const { t } = useTranslation();

	function selectNameIndex(slot: number, value: number) {
		onChange({
			...options,
			name_indicies: options.name_indicies.map((current, i) => (i === slot ? value : current)),
		});
	}

	function nameRow(slot: number) {
		return <Select options={(options.possible_name_offsets[slot] ?? []).map((entry) => entry.offset)} selectedValue={options.name_indicies[slot] ?? 0} onChange={(value) => selectNameIndex(slot, value)} />;
	}

	return (
		<div>
			<div className="flex justify-between">
				<h3 className="font-bold">{t("config.title")}</h3>
				<button onClick={() => copy_to_clipboard(config)} className="cursor-pointer" title={t("config.copyToClipboard")}>
					<Icon icon={IoMdClipboard} />
				</button>
			</div>
			<div className="flex items-center">
				<Checkbox checked={options.include_characters} onChange={(e) => onChange({ ...options, include_characters: e.target.checked })} className="mr-1" />
				<span className="text-sm">{t("config.characters")}</span>
			</div>
			<pre className="text-xs mt-1">
				{`[GENERAL]
patch\t\t= \t${config.patch}
[IP]
server_1\t= \t20.76.13
server_2\t= \t20.76.14
[PACKAGE]
identifier\t= \t${config.identifier}
kill\t\t= \t`}
				<Select options={options.possible_kill_offsets} selectedValue={options.kill_index} onChange={(value) => onChange({ ...options, kill_index: value })} />
				{`
player_one\t= \t`}
				{nameRow(options.player_one_index)}
				{`
player_two\t= \t`}
				{nameRow(options.player_two_index)}
				{`
guild\t\t= \t`}
				{nameRow(options.guild_index)}
			</pre>
		</div>
	);
}

export default ConfigModal;
