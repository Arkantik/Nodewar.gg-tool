import { useCallback, useEffect, useRef } from "react";
import type { LoggerMode } from "../../../shared/ipc-contract";

export type LoggerSessionStatus = "running" | "terminated" | "error";
export type LoggerSessionCallback = (data: string, status: LoggerSessionStatus) => void;

export function useLoggerSession() {
	const sessionIdRef = useRef<string | null>(null);
	const unsubscribeRef = useRef<(() => void) | null>(null);
	const disposedRef = useRef(false);

	const stop = useCallback(async () => {
		unsubscribeRef.current?.();
		unsubscribeRef.current = null;

		const sessionId = sessionIdRef.current;
		sessionIdRef.current = null;
		if (sessionId) await window.api.logger.stop(sessionId);
	}, []);

	const start = useCallback(
		async (mode: LoggerMode, extraArgs: string[], callback: LoggerSessionCallback) => {
			await stop();
			if (disposedRef.current) return null;

			const { sessionId } = await window.api.logger.start(mode, extraArgs);

			if (disposedRef.current) {
				void window.api.logger.stop(sessionId);
				return null;
			}

			sessionIdRef.current = sessionId;
			unsubscribeRef.current = window.api.logger.onEvent((evt) => {
				if (evt.sessionId !== sessionId) return;
				if (evt.kind === "stdout") callback(evt.data, "running");
				else if (evt.kind === "stderr") callback(evt.data, "error");
				else callback(evt.data, "terminated");
			});

			return sessionId;
		},
		[stop],
	);

	useEffect(() => {
		disposedRef.current = false;
		return () => {
			disposedRef.current = true;
			void stop();
		};
	}, [stop]);

	return { start, stop };
}
