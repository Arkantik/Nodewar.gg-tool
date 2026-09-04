import { app, type BrowserWindow } from "electron";
import { spawn } from "node:child_process";
import { createWriteStream } from "node:fs";
import { chmod, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { DowngradeEvent, ReleaseListResult, ReleaseSummary } from "../shared/ipc-contract";

const REPO = "Arkantik/Nodewar.gg-tool";
const MAX_RELEASES = 5;

interface GitHubAsset {
	name: string;
}

interface GitHubRelease {
	tag_name: string;
	draft: boolean;
	prerelease: boolean;
	published_at: string;
	body: string | null;
	html_url: string;
	assets: GitHubAsset[];
}

function assetNameFor(version: string): string | null {
	if (process.platform === "win32") return `bdo-combat-installer-v${version}.exe`;
	if (process.platform === "linux") return `bdo-combat-installer-v${version}.AppImage`;
	return null;
}

export function isDowngradeSupported(): boolean {
	return process.platform === "win32" || process.platform === "linux";
}

export async function listReleases(): Promise<ReleaseListResult> {
	const supported = isDowngradeSupported();
	if (!supported) return { supported, releases: [] };

	const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=30`, {
		headers: { Accept: "application/vnd.github+json" },
	});
	if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

	const allReleases = (await res.json()) as GitHubRelease[];
	const currentVersion = app.getVersion();
	const releases: ReleaseSummary[] = [];

	for (const release of allReleases) {
		if (release.draft || release.prerelease) continue;

		const version = release.tag_name.replace(/^v/, "");
		if (version === currentVersion) continue;

		const assetName = assetNameFor(version);
		if (!assetName || !release.assets.some((a) => a.name === assetName)) continue;

		releases.push({
			version,
			tag: release.tag_name,
			publishedAt: release.published_at,
			notes: release.body ?? "",
			htmlUrl: release.html_url,
		});

		if (releases.length >= MAX_RELEASES) break;
	}

	return { supported, releases };
}

export function createVersionManager(getWindow: () => BrowserWindow | null) {
	const send = (evt: DowngradeEvent) => getWindow()?.webContents.send("versions:event", evt);
	let downgrading = false;

	return {
		list: listReleases,
		downgradeTo: async (tag: string) => {
			if (downgrading) return;
			downgrading = true;
			try {
				if (!isDowngradeSupported()) {
					throw new Error("Downgrading is not supported on this platform");
				}

				const version = tag.replace(/^v/, "");
				const assetName = assetNameFor(version);
				if (!assetName) throw new Error("Downgrading is not supported on this platform");

				const res = await fetch(`https://github.com/${REPO}/releases/download/${tag}/${assetName}`);
				if (!res.ok || !res.body) throw new Error(`Failed to download installer (status ${res.status})`);

				const total = Number(res.headers.get("content-length") ?? 0);
				const dir = await mkdtemp(join(tmpdir(), "bdo-downgrade-"));
				const filePath = join(dir, assetName);

				let received = 0;
				const nodeStream = Readable.fromWeb(res.body as import("node:stream/web").ReadableStream<Uint8Array>);
				nodeStream.on("data", (chunk: Buffer) => {
					received += chunk.length;
					if (total > 0) send({ status: "downloading", percent: (received / total) * 100 });
				});

				await pipeline(nodeStream, createWriteStream(filePath));

				if (process.platform === "linux") {
					await chmod(filePath, 0o755);
				}

				spawn(filePath, [], { detached: true, stdio: "ignore" }).unref();
				app.quit();
			} catch (err) {
				send({ status: "error", message: (err as Error).message });
			} finally {
				downgrading = false;
			}
		},
	};
}
