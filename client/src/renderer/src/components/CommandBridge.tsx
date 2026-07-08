import { useEffect } from "react";
import { useRecordingStore } from "../logic/recording-store";
import type { AppAction } from "../../../shared/ipc-contract";

// Mounted once at the app root. Bridges tray-menu clicks and the global
// hotkey (both dispatched from main via window.api.commands.onTrigger) into
// the recording store, without requiring any particular page to be mounted.
function CommandBridge() {
	useEffect(() => {
		return window.api.commands.onTrigger((action: AppAction) => {
			const store = useRecordingStore.getState();

			if (action === "toggle-recording") {
				if (store.sessionActive) {
					void store.stopAndSave();
				} else if (store.hasStarted) {
					void store.resume();
				} else {
					void store.start();
				}
				return;
			}

			if (action === "stop-and-save") {
				void store.stopAndSave();
			}
		});
	}, []);

	return null;
}

export default CommandBridge;
