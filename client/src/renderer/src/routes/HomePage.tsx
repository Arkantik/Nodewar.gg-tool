import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChartPie, LuPlay, LuSkull, LuSword } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import { formatSessionDate } from "../logic/date";
import { useHistoryStore, type HistoryEntry } from "../logic/history-store";

function HomePage() {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const ensureLoaded = useHistoryStore((s) => s.ensureLoaded);
	const [lastEntry, setLastEntry] = useState<HistoryEntry | null>(null);

	useEffect(() => {
		(async () => {
			const entries = await ensureLoaded();
			setLastEntry(entries[0] ?? null);
		})();
	}, [ensureLoaded]);

	return (
		<div className="flex flex-col h-full relative">
			<div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 gap-10">
				<div className="w-full max-w-2xl flex flex-col items-center text-center gap-3">
					<img src="./logo.svg" alt="" className="w-14 h-14" />
					<h1 className="text-2xl font-bold text-white">{t("home.welcome.title")}</h1>
					<p className="text-sm text-gray-400 max-w-md">{t("home.welcome.subtitle")}</p>

					<button
						onClick={() => navigate("/record")}
						className="cursor-pointer mt-2 flex items-center gap-2 px-6 h-12 rounded-md bg-cta-500 hover:bg-cta-600 text-gray-900 font-semibold text-sm transition-all duration-150 ease-out active:scale-[0.97] shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50">
						<Icon icon={LuPlay} size="sm" />
						{t("home.actions.record.title")}
					</button>
				</div>

				{lastEntry && (
					<button
						onClick={() => navigate("/history")}
						className="cursor-pointer w-full max-w-2xl glass-card glass-card-hover rounded-md border border-white/10 p-4 flex items-center gap-6 text-left transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50">
						<div className="min-w-0">
							<p className="section-label mb-1">{t("home.lastSession.title")}</p>
							<p className="text-xs text-gray-400">
								{formatSessionDate(lastEntry.date, i18n.language)} · {new Date(lastEntry.date).toLocaleTimeString()}
							</p>
						</div>
						<div className="flex items-center gap-4 ml-auto shrink-0">
							<div className="flex items-center gap-1.5 text-blue-400 text-sm">
								<Icon icon={LuSword} size="sm" />
								<span className="tabular-nums">{lastEntry.kills}</span>
							</div>
							<div className="flex items-center gap-1.5 text-red-400 text-sm">
								<Icon icon={LuSkull} size="sm" />
								<span className="tabular-nums">{lastEntry.deaths}</span>
							</div>
							<div className={`flex items-center gap-1.5 text-sm ${lastEntry.kdr >= 1 ? "text-green-400" : "text-red-400"}`}>
								<Icon icon={LuChartPie} size="sm" />
								<span className="tabular-nums">{lastEntry.kdr}</span>
							</div>
						</div>
					</button>
				)}
			</div>
		</div>
	);
}

export default HomePage;
