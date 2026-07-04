import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoMdClipboard } from "react-icons/io";
import Checkbox from "../ui/Checkbox";
import Icon from "../ui/Icon";
import { copy_to_clipboard, type Config } from "./config";
import Select from "./Select";

export interface ConfigModalOptions {
	possible_kill_offsets: number[];
	possible_name_offsets: { offset: number; count: number }[][];
	name_indicies: number[];
	player_one_index: number;
	player_two_index: number;
	guild_index: number;
	kill_index: number;
	include_characters: boolean;
}

export interface ConfigModalProps {
	config: Config;
	options: ConfigModalOptions;
	onChange: (new_options: ConfigModalOptions) => void;
}

function ConfigModal({ config, options, onChange }: ConfigModalProps) {
	const { t } = useTranslation();
	const [includeCharacters, setIncludeCharacters] = useState(config.include_characters);

	function updateNameIndex(nameIndex: number, value: number) {
		const newOptions = { ...options };
		newOptions.name_indicies[nameIndex] = value;
		onChange(newOptions);
	}

	function updateKillIndex(value: number) {
		onChange({ ...options, kill_index: value });
	}

	function handleIncludeCharactersChange(checked: boolean) {
		setIncludeCharacters(checked);
		onChange({ ...options, include_characters: checked });
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
				<Checkbox checked={includeCharacters} onChange={(e) => handleIncludeCharactersChange(e.target.checked)} className="mr-1" />
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
				<Select options={options.possible_kill_offsets} selectedValue={options.kill_index} onChange={updateKillIndex} />
				{`
player_one\t= \t`}
				<Select options={options.possible_name_offsets[options.player_one_index].map((entry) => entry.offset)} selectedValue={options.name_indicies[options.player_one_index]} onChange={(value) => updateNameIndex(0, value)} />
				{`
player_two\t= \t`}
				<Select options={options.possible_name_offsets[options.player_two_index].map((entry) => entry.offset)} selectedValue={options.name_indicies[options.player_two_index]} onChange={(value) => updateNameIndex(1, value)} />
				{`
guild\t\t= \t`}
				<Select options={options.possible_name_offsets[options.guild_index].map((entry) => entry.offset)} selectedValue={options.name_indicies[options.guild_index]} onChange={(value) => updateNameIndex(2, value)} />
			</pre>
		</div>
	);
}

export default ConfigModal;
