const MIN_PLAUSIBLE_COORD = 1;
const MAX_PLAUSIBLE_COORD = 2_000_000;

function readFloat32LE(hex: string, hexOffset: number): number | null {
	if (hexOffset < 0 || hex.length < hexOffset + 8) return null;

	const bytes = new Uint8Array(4);
	for (let j = 0; j < 4; j++) {
		const byteHex = hex.substr(hexOffset + j * 2, 2);
		if (byteHex.length < 2) return null;
		bytes[j] = parseInt(byteHex, 16);
	}

	return new DataView(bytes.buffer).getFloat32(0, true);
}

function isPlausibleCoord(v: number | null): v is number {
	return v !== null && Number.isFinite(v) && Math.abs(v) > MIN_PLAUSIBLE_COORD && Math.abs(v) < MAX_PLAUSIBLE_COORD;
}

export interface DeathCoordinates {
	x: number;
	y: number;
	z: number;
}

export function extractDeathCoordinates(hex: string, victimOffset: number | undefined): DeathCoordinates | null {
	if (victimOffset === undefined) return null;

	for (let offset = Math.max(0, victimOffset); offset + 24 <= hex.length; offset += 2) {
		const x = readFloat32LE(hex, offset);
		const y = readFloat32LE(hex, offset + 8);
		const z = readFloat32LE(hex, offset + 16);
		if (isPlausibleCoord(x) && isPlausibleCoord(y) && isPlausibleCoord(z)) return { x, y, z };
	}
	return null;
}

export function formatCoordinates(coords: DeathCoordinates): string {
	return `{${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}, ${coords.z.toFixed(2)}}`;
}
