import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { calculateMaxKDR, drawTimeline } from "../../logic/drawTimeline";
import type { Log } from "../create-config/config";

const MIN_ELAPSED_MS_FOR_RATE = 30_000;

interface KDTimelineProps {
	kdr: number;
	kills: number;
	deaths: number;
	allLogs?: Log[];
}

interface DataPoint {
	timestamp: number;
	kdr: number;
	kills: number;
	deaths: number;
}

function KDTimeline({ kdr, kills, deaths, allLogs }: KDTimelineProps) {
	const { t } = useTranslation();
	const [liveDataPoints, setLiveDataPoints] = useState<DataPoint[]>([]);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const hasHistoricalLogs = !!allLogs && allLogs.length > 0;

	const historicalDataPoints = useMemo<DataPoint[]>(() => {
		if (!allLogs || allLogs.length === 0) return [];

		const points: DataPoint[] = [];
		let killCount = 0;
		let deathCount = 0;

		allLogs.forEach((log) => {
			log.kill ? killCount++ : deathCount++;

			const calculatedKdr = deathCount > 0 ? parseFloat((killCount / deathCount).toFixed(2)) : killCount;

			const [hours, minutes, seconds] = log.time.split(":").map(Number);
			const now = new Date();
			now.setHours(hours, minutes, seconds, 0);

			points.push({
				timestamp: now.getTime(),
				kdr: calculatedKdr,
				kills: killCount,
				deaths: deathCount,
			});
		});

		return points;
	}, [allLogs]);

	useEffect(() => {
		if (hasHistoricalLogs) return;

		if (kills === 0 && deaths === 0) {
			setLiveDataPoints([]);
			return;
		}

		setLiveDataPoints((prev) => {
			const lastPoint = prev[prev.length - 1];
			if (lastPoint && lastPoint.kills === kills && lastPoint.deaths === deaths) return prev;

			const newPoint: DataPoint = {
				timestamp: Date.now(),
				kdr,
				kills,
				deaths,
			};

			return [...prev, newPoint];
		});
	}, [kdr, kills, deaths, hasHistoricalLogs]);

	const dataPoints = hasHistoricalLogs ? historicalDataPoints : liveDataPoints;

	useEffect(() => {
		if (!canvasRef.current || !containerRef.current) return;

		drawTimeline({
			canvas: canvasRef.current,
			container: containerRef.current,
			dataPoints,
		});

		containerRef.current.scrollLeft = containerRef.current.scrollWidth;
	}, [dataPoints]);

	const rate = useMemo(() => {
		if (dataPoints.length < 2) return null;

		const elapsedMs = dataPoints[dataPoints.length - 1].timestamp - dataPoints[0].timestamp;
		if (elapsedMs < MIN_ELAPSED_MS_FOR_RATE) return null;

		const minutes = elapsedMs / 60_000;
		return { kills: kills / minutes, deaths: deaths / minutes };
	}, [dataPoints, kills, deaths]);

	const maxKDR = calculateMaxKDR(dataPoints);

	const yAxisLabels = [0, 1, 2, 3, 4].map((i) => {
		const value = ((maxKDR * (4 - i)) / 4).toFixed(1);
		const isOne = value === "1.0";
		return { value, isOne };
	});

	return (
		<div className="glass-card rounded-md p-2 border border-white/10">
			<div className="ml-4 flex gap-1 items-center mb-1 justify-between">
				<div className="flex gap-1 items-center min-w-0">
					<span className="flex items-center justify-center rounded-full w-3.5 aspect-square p-0.5 shrink-0">
						<span className="rounded-full w-2 aspect-square bg-red-600 animate-pulse"></span>
					</span>
					<h3 className="text-[11px] text-gray-400 truncate">Live K/D Tracking</h3>
				</div>

				{rate && (
					<span className="text-[11px] text-gray-400 mr-2 shrink-0 hidden sm:inline">
						{t("kdTimeline.rate", { kills: rate.kills.toFixed(1), deaths: rate.deaths.toFixed(1) })}
					</span>
				)}
			</div>
			<div className="relative">
				<div className="absolute left-0 top-0 h-25 w-7.5 bg-linear-to-r from-background-secondary via-background-secondary to-transparent pointer-events-none z-10 flex flex-col justify-between">
					{yAxisLabels.map((label, index) => (
						<div key={index} className={`text-[10px] font-semibold text-right pr-1 font-sans ${label.isOne ? "text-white/70" : "text-white/60"}`}>
							{label.value}
						</div>
					))}
				</div>

				<div ref={containerRef} className="overflow-x-auto scrollbar-thin">
					<canvas ref={canvasRef} height={100} className="h-25" />
				</div>
			</div>
		</div>
	);
}

export default KDTimeline;
