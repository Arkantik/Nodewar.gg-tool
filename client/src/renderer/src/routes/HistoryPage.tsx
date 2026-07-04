import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChartPie, LuDownload, LuHistory, LuSkull, LuSword, LuTrash2 } from "react-icons/lu";
import { get_formatted_date } from "../components/create-config/config";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";
import { open_save_location } from "../logic/file";
import { useHistoryStore, type HistoryEntry } from "../logic/history-store";

function HistoryPage() {
	const { t } = useTranslation();
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const ensureLoaded = useHistoryStore((s) => s.ensureLoaded);
	const removeEntry = useHistoryStore((s) => s.removeEntry);

	useEffect(() => {
		(async () => {
			setEntries(await ensureLoaded());
			setLoading(false);
		})();
	}, [ensureLoaded]);

	async function handleDownload(entry: HistoryEntry) {
		const path = await open_save_location(get_formatted_date(entry.date.slice(0, 10)) + ".log");
		if (!path) return;
		await window.api.fs.writeFile(path, entry.logText);
	}

	async function handleDelete(entry: HistoryEntry) {
		if (!confirm(t("history.confirmDelete"))) return;
		await removeEntry(entry.id);
		setEntries((prev) => prev.filter((e) => e.id !== entry.id));
	}

	return (
		<div className="flex flex-col h-full w-full p-8 gap-4">
			<PageHeader icon={LuHistory} title={t("history.title")} subtitle={t("history.subtitle")} />

			<div className="flex-1 glass-card rounded-md border border-white/10 overflow-hidden flex flex-col">
				{!loading && entries.length === 0 ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-400">{t("history.empty")}</p>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto divide-y divide-white/5">
						{entries.map((entry) => (
							<div key={entry.id} className="flex items-center gap-4 px-4 py-3">
								<div className="w-36 shrink-0">
									<div className="text-sm font-medium text-white">{new Date(entry.date).toLocaleDateString()}</div>
									<div className="text-xs text-gray-500">{new Date(entry.date).toLocaleTimeString()}</div>
								</div>

								<div className="flex items-center gap-4 shrink-0">
									<div className="flex items-center gap-1.5 text-blue-400 text-sm">
										<Icon icon={LuSword} size="sm" />
										{entry.kills}
									</div>
									<div className="flex items-center gap-1.5 text-red-400 text-sm">
										<Icon icon={LuSkull} size="sm" />
										{entry.deaths}
									</div>
									<div className={`flex items-center gap-1.5 text-sm ${entry.kdr >= 1 ? "text-green-400" : "text-red-400"}`}>
										<Icon icon={LuChartPie} size="sm" />
										{entry.kdr}
									</div>
								</div>

								<div className="flex-1 min-w-0 text-xs text-gray-400 truncate">
									{entry.topGuild && <span>{t("history.topGuild", { guild: entry.topGuild })}</span>}
									{entry.topGuild && entry.topEnemy && <span className="mx-1.5">·</span>}
									{entry.topEnemy && <span>{t("history.topEnemy", { enemy: entry.topEnemy })}</span>}
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<Button size="sm" color="secondary" onClick={() => handleDownload(entry)} title={t("history.download")}>
										<Icon icon={LuDownload} size="sm" />
									</Button>
									<button
										onClick={() => handleDelete(entry)}
										className="cursor-pointer p-2 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-all duration-150 ease-out hover:border-red-400/20 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
										title={t("history.delete")}>
										<Icon icon={LuTrash2} size="sm" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default HistoryPage;
