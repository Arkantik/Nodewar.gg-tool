interface DataPoint {
	timestamp: number;
	kdr: number;
	kills: number;
	deaths: number;
}

interface DrawTimelineOptions {
	canvas: HTMLCanvasElement;
	container: HTMLElement;
	dataPoints: DataPoint[];
}

export function drawTimeline({ canvas, container, dataPoints }: DrawTimelineOptions): void {
	if (!canvas || !container) return;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	if (dataPoints.length === 0) {
		const containerWidth = container.clientWidth;
		canvas.width = Math.max(containerWidth, 300);

		const width = canvas.width;
		const height = canvas.height;
		const xPadding = 35;
		const topPadding = 10;
		const bottomPadding = 20;
		const graphHeight = height - topPadding - bottomPadding;
		const maxKDR = 2;

		ctx.clearRect(0, 0, width, height);
		drawGridLines(ctx, xPadding, topPadding, width, graphHeight);

		const oneKDRY = topPadding + graphHeight * (1 - 1 / maxKDR);
		drawReferenceLineAt1KD(ctx, xPadding, oneKDRY, width);

		return;
	}

	const minTimestamp = Math.min(...dataPoints.map((p) => p.timestamp));
	const maxTimestamp = Math.max(...dataPoints.map((p) => p.timestamp));
	const timeRange = maxTimestamp - minTimestamp || 1;

	const pixelsPerSecond = 1;
	const timeRangeSeconds = timeRange / 1000;
	const calculatedWidth = Math.max(300, timeRangeSeconds * pixelsPerSecond);
	const containerWidth = container.clientWidth;
	const dynamicWidth = Math.max(containerWidth, calculatedWidth);

	canvas.width = dynamicWidth;

	const width = canvas.width;
	const height = canvas.height;
	const xPadding = 35;
	const topPadding = 10;
	const bottomPadding = 20;
	const graphHeight = height - topPadding - bottomPadding;

	const maxKDR = calculateMaxKDR(dataPoints);

	ctx.clearRect(0, 0, width, height);

	const getX = (timestamp: number) => {
		if (dataPoints.length === 1) return xPadding;
		return xPadding + ((timestamp - minTimestamp) / timeRange) * (width - xPadding);
	};

	drawGridLines(ctx, xPadding, topPadding, width, graphHeight);

	const oneKDRY = topPadding + graphHeight * (1 - 1 / maxKDR);
	drawReferenceLineAt1KD(ctx, xPadding, oneKDRY, width);

	drawLineSegments(ctx, dataPoints, getX, topPadding, graphHeight, maxKDR);
	drawFilledAreas(ctx, dataPoints, getX, topPadding, graphHeight, maxKDR, oneKDRY);
	drawCurrentPositionIndicator(ctx, dataPoints, getX, topPadding, graphHeight, maxKDR);

	drawTimeLabels(ctx, dataPoints, getX, maxTimestamp, height, topPadding, bottomPadding, graphHeight);
}

function drawGridLines(ctx: CanvasRenderingContext2D, xPadding: number, topPadding: number, width: number, graphHeight: number): void {
	ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
	ctx.lineWidth = 1;

	for (let i = 0; i <= 4; i++) {
		const y = topPadding + graphHeight * (i / 4);
		ctx.beginPath();
		ctx.moveTo(xPadding, y);
		ctx.lineTo(width, y);
		ctx.stroke();
	}
}

function drawReferenceLineAt1KD(ctx: CanvasRenderingContext2D, xPadding: number, oneKDRY: number, width: number): void {
	ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(xPadding, oneKDRY);
	ctx.lineTo(width, oneKDRY);
	ctx.stroke();
}

function drawLineSegments(ctx: CanvasRenderingContext2D, dataPoints: DataPoint[], getX: (timestamp: number) => number, topPadding: number, graphHeight: number, maxKDR: number): void {
	ctx.lineWidth = 2.5;

	for (let i = 0; i < dataPoints.length - 1; i++) {
		const point = dataPoints[i];
		const nextPoint = dataPoints[i + 1];

		const x1 = getX(point.timestamp);
		const y1 = topPadding + graphHeight * (1 - point.kdr / maxKDR);
		const x2 = getX(nextPoint.timestamp);
		const y2 = topPadding + graphHeight * (1 - nextPoint.kdr / maxKDR);

		const avgKdr = (point.kdr + nextPoint.kdr) / 2;
		ctx.strokeStyle = avgKdr >= 1 ? "#4ade80" : "#f87171";

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}
}

function drawFilledAreas(ctx: CanvasRenderingContext2D, dataPoints: DataPoint[], getX: (timestamp: number) => number, topPadding: number, graphHeight: number, maxKDR: number, oneKDRY: number): void {
	if (dataPoints.length === 0) return;

	for (let i = 0; i < dataPoints.length - 1; i++) {
		const point = dataPoints[i];
		const nextPoint = dataPoints[i + 1];

		const x1 = getX(point.timestamp);
		const y1 = topPadding + graphHeight * (1 - point.kdr / maxKDR);
		const x2 = getX(nextPoint.timestamp);
		const y2 = topPadding + graphHeight * (1 - nextPoint.kdr / maxKDR);

		const avgKdr = (point.kdr + nextPoint.kdr) / 2;

		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.lineTo(x2, oneKDRY);
		ctx.lineTo(x1, oneKDRY);
		ctx.closePath();

		ctx.fillStyle = avgKdr >= 1 ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)";
		ctx.fill();
	}

	if (dataPoints.length === 1) {
		const point = dataPoints[0];
		const x = getX(point.timestamp);
		const y = topPadding + graphHeight * (1 - point.kdr / maxKDR);

		ctx.beginPath();
		ctx.arc(x, y, 3, 0, 2 * Math.PI);
		ctx.fillStyle = point.kdr >= 1 ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)";
		ctx.fill();
	}
}

function drawCurrentPositionIndicator(ctx: CanvasRenderingContext2D, dataPoints: DataPoint[], getX: (timestamp: number) => number, topPadding: number, graphHeight: number, maxKDR: number): void {
	const lastPoint = dataPoints[dataPoints.length - 1];
	const lastX = getX(lastPoint.timestamp);
	const lastY = topPadding + graphHeight * (1 - lastPoint.kdr / maxKDR);

	ctx.beginPath();
	ctx.arc(lastX, lastY, 4, 0, 2 * Math.PI);
	ctx.fillStyle = lastPoint.kdr >= 1 ? "#4ade80" : "#f87171";
	ctx.fill();
	ctx.strokeStyle = lastPoint.kdr >= 1 ? "#22c55e" : "#ef4444";
	ctx.lineWidth = 2;
	ctx.stroke();
}

function drawTimeLabels(ctx: CanvasRenderingContext2D, dataPoints: DataPoint[], getX: (timestamp: number) => number, maxTimestamp: number, height: number, topPadding: number, bottomPadding: number, graphHeight: number): void {
	ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
	ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
	ctx.textAlign = "center";

	const fourMinutesMs = 4 * 60 * 1000;
	const firstTimestamp = dataPoints[0].timestamp;

	const firstDate = new Date(firstTimestamp);
	const minutesSinceHour = firstDate.getMinutes();
	const roundedMinutes = Math.floor(minutesSinceHour / 4) * 4;
	firstDate.setMinutes(roundedMinutes, 0, 0);
	let currentLabelTime = firstDate.getTime();

	if (currentLabelTime < firstTimestamp) currentLabelTime += fourMinutesMs;

	while (currentLabelTime <= maxTimestamp) {
		const x = getX(currentLabelTime);
		const date = new Date(currentLabelTime);
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		const timeLabel = `${hours}:${minutes}`;

		ctx.fillText(timeLabel, x, height - bottomPadding + 15);

		ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(x, topPadding + graphHeight);
		ctx.lineTo(x, topPadding + graphHeight + 4);
		ctx.stroke();

		currentLabelTime += fourMinutesMs;
	}
}

export function calculateMaxKDR(dataPoints: DataPoint[]): number {
	if (dataPoints.length === 0) return 2;

	const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
	const recentPoints = dataPoints.filter((p) => p.timestamp >= twoMinutesAgo);

	const pointsToConsider = recentPoints.length >= 10 ? recentPoints : dataPoints.slice(-50);

	if (pointsToConsider.length === 0) return 2;

	const dataMaxKDR = Math.max(...pointsToConsider.map((p) => p.kdr));

	const paddedMax = dataMaxKDR * 1.2;

	return Math.max(2, Math.ceil(paddedMax * 2) / 2);
}
