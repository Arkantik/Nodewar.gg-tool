import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
import type { LoggerEvent, LoggerMode } from "../../shared/ipc-contract";
import { resolveLoggerExePath } from "./resolve-exe-path";

const ARG_MAPPING: Record<LoggerMode, string | null> = {
	sniff: null,
	open_file: "-f",
	status: "-s",
	update: "-u",
	record: "-r",
	analyze: "-a",
};

const KILL_GRACE_PERIOD_MS = 1500;

interface Session {
	id: string;
	proc: ChildProcessWithoutNullStreams;
}

export class LoggerProcessManager {
	private session: Session | null = null;

	constructor(private onEvent: (evt: LoggerEvent) => void) {}

	async start(mode: LoggerMode, extraArgs: string[] = []): Promise<{ sessionId: string }> {
		await this.stop();

		const flag = ARG_MAPPING[mode];
		const argv = flag ? [flag, ...extraArgs] : extraArgs;
		const id = randomUUID();
		const proc = spawn(resolveLoggerExePath(), argv, { windowsHide: true });
		this.session = { id, proc };

		const emit = (kind: LoggerEvent["kind"], data: string) => {
			if (this.session?.id !== id) return;
			this.onEvent({ sessionId: id, kind, data });
		};

		createInterface({ input: proc.stdout }).on("line", (line) => emit("stdout", line));
		createInterface({ input: proc.stderr }).on("line", (line) => emit("stderr", line));

		proc.on("error", (err) => {
			emit("stderr", err.message);
			emit("exit", "");
			if (this.session?.id === id) this.session = null;
		});
		proc.on("exit", (code) => {
			emit("exit", String(code ?? ""));
			if (this.session?.id === id) this.session = null;
		});

		return { sessionId: id };
	}

	async stop(sessionId?: string): Promise<void> {
		if (!this.session) return;
		if (sessionId && this.session.id !== sessionId) return;

		const { proc } = this.session;
		this.session = null;
		if (proc.exitCode !== null) return;

		await new Promise<void>((resolve) => {
			const timer = setTimeout(() => {
				if (proc.exitCode === null) proc.kill("SIGKILL");
			}, KILL_GRACE_PERIOD_MS);

			proc.once("exit", () => {
				clearTimeout(timer);
				resolve();
			});
			proc.kill();
		});
	}
}
