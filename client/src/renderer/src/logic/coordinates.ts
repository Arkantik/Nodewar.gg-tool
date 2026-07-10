// The victim's death coordinates sit a fixed distance past their own name
// field, as 3 little-endian float32 values (X, Y/height, Z).
const COORD_OFFSET_X = 262;
const COORD_OFFSET_Y = 270;
const COORD_OFFSET_Z = 278;

const MAX_PLAUSIBLE_COORD = 1_000_000;

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

export interface DeathCoordinates {
	x: number;
	y: number;
	z: number;
}

export function extractDeathCoordinates(hex: string, playerOneOffset: number | undefined): DeathCoordinates | null {
	if (playerOneOffset === undefined) return null;

	const x = readFloat32LE(hex, playerOneOffset + COORD_OFFSET_X);
	const y = readFloat32LE(hex, playerOneOffset + COORD_OFFSET_Y);
	const z = readFloat32LE(hex, playerOneOffset + COORD_OFFSET_Z);
	if (x === null || y === null || z === null) return null;

	const values = [x, y, z];
	if (!values.every((v) => Number.isFinite(v) && Math.abs(v) < MAX_PLAUSIBLE_COORD)) return null;

	return { x, y, z };
}

export function formatCoordinates(coords: DeathCoordinates): string {
	return `{${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}, ${coords.z.toFixed(2)}}`;
}
