import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { acceleratorFromKeyEvent, formatAccelerator } from "../../logic/hotkey";
import { ToastManager } from "../toast/toast-store";
import Button from "../ui/Button";

function HotkeyRecorder() {
	const { t } = useTranslation();
	const [hotkey, setHotkey] = useState<string | null>(null);
	const [listening, setListening] = useState(false);
	const [lastKeyDebug, setLastKeyDebug] = useState<string | null>(null);
	const [captureError, setCaptureError] = useState<string | null>(null);
	const activeRef = useRef(false);

	useEffect(() => {
		window.api.hotkey.get().then(setHotkey);
	}, []);

	function startListening() {
		activeRef.current = true;
		setLastKeyDebug(null);
		setCaptureError(null);
		setListening(true);
		void window.api.hotkey.pause();
	}

	function stopListening(captured: boolean) {
		if (!activeRef.current) return;
		activeRef.current = false;
		setListening(false);
		if (!captured) void window.api.hotkey.resume();
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === "Escape") {
			stopListening(false);
			return;
		}

		const modifiers = [e.ctrlKey && "Ctrl", e.metaKey && "Meta", e.altKey && "Alt", e.shiftKey && "Shift"].filter(Boolean).join("+");
		setLastKeyDebug(`${modifiers ? modifiers + "+" : ""}${e.code}`);

		const accelerator = acceleratorFromKeyEvent(e.nativeEvent);
		if (!accelerator) return;

		e.preventDefault();
		stopListening(true);
		window.api.hotkey.set(accelerator).then(({ success }) => {
			if (success) {
				setHotkey(accelerator);
				ToastManager.success(t("settings.hotkey.updateSuccess", { accelerator: formatAccelerator(accelerator) }));
			} else {
				setCaptureError(formatAccelerator(accelerator));
				ToastManager.error(t("settings.hotkey.updateError"));
			}
		});
	}

	return (
		<div className="py-4 flex items-center justify-between gap-4">
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-white">{t("settings.hotkey.title")}</p>
				<p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{t("settings.hotkey.description")}</p>
				{captureError && !listening && (
					<p className="text-xs text-red-400 mt-2">
						{t("settings.hotkey.updateError")} ({captureError})
					</p>
				)}
			</div>

			{listening ? (
				<div className="text-right shrink-0">
					<button autoFocus onKeyDown={handleKeyDown} onBlur={() => stopListening(false)} className="text-sm text-cta-400 font-medium whitespace-nowrap outline-none cursor-default">
						{t("settings.hotkey.listening")}
					</button>
					{lastKeyDebug && <div className="text-xs text-gray-500 font-mono mt-1">{lastKeyDebug}</div>}
				</div>
			) : (
				<div className="flex items-center gap-3 shrink-0">
					<span className="font-mono text-sm text-white bg-white/5 border border-white/10 rounded-md px-3 py-1.5">{hotkey ? formatAccelerator(hotkey) : t("settings.hotkey.notRegistered")}</span>
					<Button size="sm" color="secondary" onClick={startListening}>
						{t("settings.hotkey.change")}
					</Button>
				</div>
			)}
		</div>
	);
}

export default HotkeyRecorder;
