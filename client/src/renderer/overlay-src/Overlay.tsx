import { useEffect, useRef, useState } from "react";
import { LuChartPie, LuSkull, LuSword } from "react-icons/lu";
import { DEFAULT_OVERLAY_SETTINGS, type OverlayPayload, type OverlaySettings } from "../../shared/ipc-contract";

const EMPTY_PAYLOAD: OverlayPayload = { stats: { kills: 0, deaths: 0, kdr: 0 }, elapsedSeconds: 0, topGuilds: [], topPlayers: [] };

function formatElapsed(totalSeconds: number) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatKdr(kills: number, deaths: number) {
	return deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);
}

function Overlay() {
	const [payload, setPayload] = useState<OverlayPayload>(EMPTY_PAYLOAD);
	const [settings, setSettings] = useState<OverlaySettings>(DEFAULT_OVERLAY_SETTINGS);
	const pillRef = useRef<HTMLDivElement>(null);

	useEffect(() => window.overlayApi.onPayload(setPayload), []);
	useEffect(() => window.overlayApi.onSettings(setSettings), []);
	useEffect(() => {
		window.overlayApi
			.getSettings()
			.then(setSettings)
			.catch(() => {});
	}, []);

	useEffect(() => {
		const el = pillRef.current;
		if (!el) return;
		const observer = new ResizeObserver(() => window.overlayApi.reportSize({ width: el.offsetWidth, height: el.offsetHeight }));
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const { stats } = payload;

	const [vertical, horizontal] = settings.anchor.split("-") as ["top" | "center" | "bottom", "left" | "center" | "right"];
	const itemsClass = vertical === "top" ? "items-start" : vertical === "bottom" ? "items-end" : "items-center";
	const justifyClass = horizontal === "left" ? "justify-start" : horizontal === "right" ? "justify-end" : "justify-center";

	return (
		<div className={`w-screen h-screen flex ${itemsClass} ${justifyClass}`}>
			<div ref={pillRef} className="flex flex-col gap-2 px-4 py-2.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 text-white font-sans">
				<div className="flex items-center gap-2">
					<img src="./logo.svg" alt="" className="w-6 h-6 shrink-0" />
					<span className="text-sm font-semibold tabular-nums">{formatElapsed(payload.elapsedSeconds)}</span>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-1.5">
						<LuSword className="w-4 h-4 text-blue-400 shrink-0" />
						<span className="text-sm font-semibold tabular-nums min-w-[4ch] text-left">{stats.kills}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<LuSkull className="w-4 h-4 text-red-400 shrink-0" />
						<span className="text-sm font-semibold tabular-nums min-w-[4ch] text-left">{stats.deaths}</span>
					</div>
					<div className="flex items-center gap-1.5">
						<LuChartPie className={`w-4 h-4 shrink-0 ${stats.kdr >= 1 ? "text-green-400" : "text-red-400"}`} />
						<span className="text-sm font-semibold tabular-nums min-w-[5ch] text-left">{formatKdr(stats.kills, stats.deaths)}</span>
					</div>
				</div>

				{settings.showGuilds && payload.topGuilds.length > 0 && (
					<div className="flex flex-col gap-0.5 pt-1 border-t border-white/10">
						{payload.topGuilds.map((guild) => (
							<div key={guild.name} className="flex items-center justify-between gap-3 text-xs">
								<span className="font-medium truncate max-w-36">{guild.name}</span>
								{settings.showGuildKD && <span className="tabular-nums text-gray-300 shrink-0 min-w-[5ch] text-right">{formatKdr(guild.kills, guild.deaths)}</span>}
							</div>
						))}
					</div>
				)}

				{settings.showPlayers && payload.topPlayers.length > 0 && (
					<div className="flex flex-col gap-0.5 pt-1 border-t border-white/10">
						{payload.topPlayers.map((player) => (
							<div key={player.name} className="flex items-center justify-between gap-3 text-xs">
								<span className="font-medium truncate max-w-36">
									{player.name}
									{player.guild && <span className="text-gray-400"> ({player.guild})</span>}
								</span>
								{settings.showPlayerKD && <span className="tabular-nums text-gray-300 shrink-0 min-w-[5ch] text-right">{formatKdr(player.kills, player.deaths)}</span>}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default Overlay;
