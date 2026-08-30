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

		let proc: ChildProcessWithoutNullStreams;
		try {
			proc = spawn(resolveLoggerExePath(), argv, { windowsHide: true });
		} catch (err) {
			// spawn() throws synchronously (not via the "error" event) when the OS refuses
			// the launch outright: a missing/blocked executable, or on Windows an antivirus
			// block, which surfaces as "spawn UNKNOWN". Report it through the normal event
			// stream instead of rejecting the IPC call. Defer so the caller can subscribe first.
			const message = err instanceof Error ? err.message : String(err);
			setImmediate(() => {
				this.onEvent({ sessionId: id, kind: "stderr", data: message });
				this.onEvent({ sessionId: id, kind: "exit", data: "" });
			});
			return { sessionId: id };
		}

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
