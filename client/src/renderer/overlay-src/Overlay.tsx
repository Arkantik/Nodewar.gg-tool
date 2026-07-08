import { useEffect, useState } from "react";
import { LuChartPie, LuSkull, LuSword } from "react-icons/lu";
import type { OverlayStats } from "../../shared/ipc-contract";

function Overlay() {
	const [stats, setStats] = useState<OverlayStats>({ kills: 0, deaths: 0, kdr: 0 });

	useEffect(() => window.overlayApi.onStats(setStats), []);

	return (
		<div className="w-screen h-screen flex items-center justify-center p-2">
			<div className="flex items-center gap-4 px-4 py-2.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-white font-sans">
				<div className="flex items-center gap-1.5">
					<LuSword className="w-4 h-4 text-blue-400" />
					<span className="text-sm font-semibold tabular-nums">{stats.kills}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<LuSkull className="w-4 h-4 text-red-400" />
					<span className="text-sm font-semibold tabular-nums">{stats.deaths}</span>
				</div>
				<div className="flex items-center gap-1.5">
					<LuChartPie className={`w-4 h-4 ${stats.kdr >= 1 ? "text-green-400" : "text-red-400"}`} />
					<span className="text-sm font-semibold tabular-nums">{stats.kdr}</span>
				</div>
			</div>
		</div>
	);
}

export default Overlay;
