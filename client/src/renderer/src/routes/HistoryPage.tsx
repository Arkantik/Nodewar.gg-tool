import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChartPie, LuDownload, LuFolderOpen, LuHistory, LuPlus, LuSkull, LuSword, LuTrash2, LuX } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { get_formatted_date } from "../components/create-config/config";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";
import { formatSessionDate } from "../logic/date";
import { open_save_location } from "../logic/file";
import { useHistoryStore, type HistoryEntry } from "../logic/history-store";

function HistoryPage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const [entries, setEntries] = useState<HistoryEntry[]>([]);
	const [loading, setLoading] = useState(true);
	const [tagFilter, setTagFilter] = useState<string | null>(null);
	const [addingTagFor, setAddingTagFor] = useState<string | null>(null);
	const ensureLoaded = useHistoryStore((s) => s.ensureLoaded);
	const removeEntry = useHistoryStore((s) => s.removeEntry);
	const updateEntry = useHistoryStore((s) => s.updateEntry);

	useEffect(() => {
		(async () => {
			setEntries(await ensureLoaded());
			setLoading(false);
		})();
	}, [ensureLoaded]);

	const allTags = useMemo(() => Array.from(new Set(entries.flatMap((e) => e.tags ?? []))).sort(), [entries]);
	const visibleEntries = tagFilter ? entries.filter((e) => e.tags?.includes(tagFilter)) : entries;

	async function handleDownload(entry: HistoryEntry) {
		const path = await open_save_location(get_formatted_date(entry.date.slice(0, 10)) + ".log");
		if (!path) return;
		await window.api.fs.writeFile(path, entry.logText);
	}

	function handleOpen(entry: HistoryEntry) {
		navigate("/open", { state: { logText: entry.logText, fileName: get_formatted_date(entry.date.slice(0, 10)) + ".log" } });
	}

	async function handleDelete(entry: HistoryEntry) {
		if (!confirm(t("history.confirmDelete"))) return;
		await removeEntry(entry.id);
		setEntries((prev) => prev.filter((e) => e.id !== entry.id));
	}

	async function handleNotesBlur(entry: HistoryEntry, value: string) {
		if (value === (entry.notes ?? "")) return;
		await updateEntry(entry.id, { notes: value });
		setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, notes: value } : e)));
	}

	async function handleAddTag(entry: HistoryEntry, rawValue: string) {
		setAddingTagFor(null);
		const tag = rawValue.trim();
		if (!tag || entry.tags?.includes(tag)) return;

		const tags = [...(entry.tags ?? []), tag];
		await updateEntry(entry.id, { tags });
		setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, tags } : e)));
	}

	async function handleRemoveTag(entry: HistoryEntry, tag: string) {
		const tags = (entry.tags ?? []).filter((t) => t !== tag);
		await updateEntry(entry.id, { tags });
		setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, tags } : e)));
		if (tagFilter === tag) setTagFilter(null);
	}

	return (
		<div className="flex flex-col h-full w-full p-8 gap-4">
			<PageHeader icon={LuHistory} title={t("history.title")} subtitle={t("history.subtitle")} />

			{allTags.length > 0 && (
				<div className="flex items-center gap-2 flex-wrap">
					<button
						onClick={() => setTagFilter(null)}
						className={`cursor-pointer px-2.5 py-1 rounded-full text-xs border transition-colors duration-150 ${tagFilter === null ? "bg-cta-500/20 border-cta-500/50 text-cta-400" : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"}`}>
						{t("history.tags.allFilter")}
					</button>
					{allTags.map((tag) => (
						<button
							key={tag}
							onClick={() => setTagFilter(tag)}
							className={`cursor-pointer px-2.5 py-1 rounded-full text-xs border transition-colors duration-150 ${tagFilter === tag ? "bg-cta-500/20 border-cta-500/50 text-cta-400" : "border-white/10 text-gray-400 hover:text-white hover:border-white/20"}`}>
							{tag}
						</button>
					))}
				</div>
			)}

			<div className="flex-1 glass-card rounded-md border border-white/10 overflow-hidden flex flex-col">
				{!loading && visibleEntries.length === 0 ? (
					<div className="flex-1 flex items-center justify-center">
						<p className="text-gray-400">{t("history.empty")}</p>
					</div>
				) : (
					<div className="flex-1 overflow-y-auto divide-y divide-white/5">
						{visibleEntries.map((entry) => (
							<div key={entry.id} className="flex flex-col gap-2 px-4 py-3">
								<div className="flex items-center gap-4">
									<div className="w-48 shrink-0">
										<span className="text-sm font-medium text-white whitespace-nowrap">{formatSessionDate(entry.date, i18n.language)}</span>
										<div className="flex items-center gap-2">
											<span className="text-xs text-gray-500">{new Date(entry.date).toLocaleTimeString()}</span>
											{entry.recovered && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">{t("history.recoveredBadge")}</span>}
										</div>
									</div>

									<div className="flex items-center gap-4 shrink-0">
										<div className="flex items-center gap-1.5 w-10 text-blue-400 text-sm">
											<Icon icon={LuSword} size="sm" />
											<span className="tabular-nums">{entry.kills}</span>
										</div>
										<div className="flex items-center gap-1.5 w-10 text-red-400 text-sm">
											<Icon icon={LuSkull} size="sm" />
											<span className="tabular-nums">{entry.deaths}</span>
										</div>
										<div className={`flex items-center gap-1.5 w-12 text-sm ${entry.kdr >= 1 ? "text-green-400" : "text-red-400"}`}>
											<Icon icon={LuChartPie} size="sm" />
											<span className="tabular-nums">{entry.kdr}</span>
										</div>
									</div>

									<div className="flex-1 min-w-0 text-xs text-gray-400 truncate">
										{entry.topGuild && <span>{t("history.topGuild", { guild: entry.topGuild })}</span>}
										{entry.topGuild && entry.topEnemy && <span className="mx-1.5">·</span>}
										{entry.topEnemy && <span>{t("history.topEnemy", { enemy: entry.topEnemy })}</span>}
									</div>

									<div className="flex items-center gap-2 shrink-0">
										<button
											onClick={() => handleOpen(entry)}
											className="cursor-pointer p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all duration-150 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
											title={t("history.open")}>
											<Icon icon={LuFolderOpen} size="sm" />
										</button>
										<button
											onClick={() => handleDownload(entry)}
											className="cursor-pointer p-2 rounded-md hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all duration-150 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
											title={t("history.download")}>
											<Icon icon={LuDownload} size="sm" />
										</button>
										<button
											onClick={() => handleDelete(entry)}
											className="cursor-pointer p-2 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 transition-all duration-150 ease-out hover:border-red-400/20 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
											title={t("history.delete")}>
											<Icon icon={LuTrash2} size="sm" />
										</button>
									</div>
								</div>

								<div className="flex items-center gap-4 pl-0.5">
									<div className="flex items-center gap-1.5 flex-wrap">
										{(entry.tags ?? []).map((tag) => (
											<span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-gray-300">
												{tag}
												<button onClick={() => handleRemoveTag(entry, tag)} className="cursor-pointer text-gray-500 hover:text-red-400">
													<Icon icon={LuX} className="w-3 h-3" />
												</button>
											</span>
										))}

										{addingTagFor === entry.id ? (
											<input
												autoFocus
												defaultValue=""
												onBlur={(e) => handleAddTag(entry, e.target.value)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
												}}
												placeholder={t("history.tags.placeholder")}
												className="w-24 px-2 py-0.5 rounded-full text-[11px] bg-white/5 border border-cta-500/40 text-white outline-none"
											/>
										) : (
											<button
												onClick={() => setAddingTagFor(entry.id)}
												className="cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border border-dashed border-white/15 text-gray-500 hover:text-gray-300 hover:border-white/30"
												title={t("history.tags.add")}>
												<Icon icon={LuPlus} className="w-3 h-3" />
											</button>
										)}
									</div>

									<input
										defaultValue={entry.notes ?? ""}
										onBlur={(e) => handleNotesBlur(entry, e.target.value)}
										placeholder={t("history.notes.placeholder")}
										className="flex-1 min-w-0 bg-transparent text-xs text-gray-400 placeholder-gray-600 outline-none border-b border-transparent focus:border-white/15 py-0.5"
									/>
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
