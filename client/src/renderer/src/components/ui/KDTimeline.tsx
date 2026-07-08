import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CHART_X_PADDING, calculateMaxKDR, createXScale, drawTimeline, type DataPoint } from "../../logic/drawTimeline";
import type { Log } from "../create-config/config";

const MIN_ELAPSED_MS_FOR_RATE = 30_000;
const DAY_MS = 24 * 60 * 60 * 1000;

interface KDTimelineProps {
	kdr: number;
	kills: number;
	deaths: number;
	allLogs?: Log[];
	onScrub?: (index: number | null) => void;
}

function KDTimeline({ kdr, kills, deaths, allLogs, onScrub }: KDTimelineProps) {
	const { t } = useTranslation();
	const [liveDataPoints, setLiveDataPoints] = useState<DataPoint[]>([]);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);
	const [scrubIndex, setScrubIndex] = useState<number | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const hasHistoricalLogs = !!allLogs && allLogs.length > 0;

	// Log times are HH:MM:SS with no date, so a session crossing midnight would
	// otherwise produce non-monotonic timestamps (all anchored to "today"). This
	// tracks elapsed time from the first entry instead, adding a day each time the
	// parsed time-of-day goes backwards relative to the previous line.
	const historicalDataPoints = useMemo<DataPoint[]>(() => {
		if (!allLogs || allLogs.length === 0) return [];

		const points: DataPoint[] = [];
		let killCount = 0;
		let deathCount = 0;
		let dayOffsetMs = 0;
		let prevSecondsOfDay: number | null = null;
		let firstSecondsOfDay = 0;
		let baseTimestamp = 0;

		allLogs.forEach((log, index) => {
			log.kill ? killCount++ : deathCount++;

			const calculatedKdr = deathCount > 0 ? parseFloat((killCount / deathCount).toFixed(2)) : killCount;

			const [hours, minutes, seconds] = log.time.split(":").map(Number);
			const secondsOfDay = hours * 3600 + minutes * 60 + seconds;

			if (index === 0) {
				firstSecondsOfDay = secondsOfDay;
				const now = new Date();
				now.setHours(hours, minutes, seconds, 0);
				baseTimestamp = now.getTime();
			} else if (prevSecondsOfDay !== null && secondsOfDay < prevSecondsOfDay) {
				dayOffsetMs += DAY_MS;
			}
			prevSecondsOfDay = secondsOfDay;

			const elapsedMs = (secondsOfDay - firstSecondsOfDay) * 1000 + dayOffsetMs;

			points.push({
				timestamp: baseTimestamp + elapsedMs,
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

	function nearestIndex(clientX: number): number | null {
		if (!canvasRef.current || dataPoints.length === 0) return null;
		const rect = canvasRef.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const { getX } = createXScale(dataPoints, canvasRef.current.width, CHART_X_PADDING);

		let best = 0;
		let bestDist = Infinity;
		dataPoints.forEach((point, index) => {
			const dist = Math.abs(getX(point.timestamp) - x);
			if (dist < bestDist) {
				bestDist = dist;
				best = index;
			}
		});
		return best;
	}

	function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		setHoverIndex(nearestIndex(e.clientX));
	}

	function handlePointerLeave() {
		setHoverIndex(null);
	}

	function handleClick(e: React.MouseEvent<HTMLDivElement>) {
		const index = nearestIndex(e.clientX);
		setScrubIndex(index);
		onScrub?.(index);
	}

	const chartWidth = canvasRef.current?.width ?? 0;
	const xScale = dataPoints.length > 0 && chartWidth > 0 ? createXScale(dataPoints, chartWidth, CHART_X_PADDING) : null;
	const hoverPoint = hoverIndex !== null ? dataPoints[hoverIndex] : null;
	const scrubPoint = scrubIndex !== null ? dataPoints[scrubIndex] : null;
	const hoverX = hoverPoint && xScale ? xScale.getX(hoverPoint.timestamp) : 0;
	const scrubX = scrubPoint && xScale ? xScale.getX(scrubPoint.timestamp) : 0;

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

				<div
					ref={containerRef}
					className="overflow-x-auto scrollbar-thin relative"
					onPointerMove={handlePointerMove}
					onPointerLeave={handlePointerLeave}
					onClick={handleClick}>
					<canvas ref={canvasRef} height={100} className="h-25" />

					{scrubPoint && <div className="absolute top-0 bottom-0 w-px bg-cta-400 pointer-events-none" style={{ left: scrubX }} />}

					{hoverPoint && (
						<>
							<div className="absolute top-0 bottom-0 w-px bg-white/30 pointer-events-none" style={{ left: hoverX }} />
							<div
								className="absolute -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-white/10 bg-background px-2 py-1 text-[10px] text-gray-300 pointer-events-none z-20"
								style={{ left: hoverX }}>
								{new Date(hoverPoint.timestamp).toLocaleTimeString()} · {hoverPoint.kills}K {hoverPoint.deaths}D · {hoverPoint.kdr} K/D
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default KDTimeline;
