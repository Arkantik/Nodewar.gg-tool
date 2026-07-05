import { get_date, get_formatted_date } from "../components/create-config/config";
import { open_save_location } from "./file";

export async function saveLogsToFile(text: string): Promise<string | undefined> {
	const path = await open_save_location(get_formatted_date(get_date()) + ".log");
	if (!path) return undefined;

	await window.api.fs.writeFile(path, text);
	return path;
}
