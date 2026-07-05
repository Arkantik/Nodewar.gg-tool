export type LoggerStatus = {
	capture_ready: boolean;
	capture_platform: "windows" | "linux";
	config_valid: boolean;
	config_up_to_date: boolean;
	something_else: string;
	patch: string;
};

export async function check_status(): Promise<LoggerStatus> {
	const status: LoggerStatus = {
		capture_ready: true,
		capture_platform: "windows",
		config_valid: true,
		config_up_to_date: true,
		something_else: "",
		patch: "",
	};

	const { sessionId } = await window.api.logger.start("status");

	return new Promise((resolve) => {
		const unsubscribe = window.api.logger.onEvent((evt) => {
			if (evt.sessionId !== sessionId) return;

			if (evt.kind === "stdout") {
				if (evt.data === "Npcap is not installed") {
					status.capture_platform = "windows";
					status.capture_ready = false;
				} else if (evt.data === "Npcap is installed") {
					status.capture_platform = "windows";
				} else if (evt.data === "Packet capture permission is missing") {
					status.capture_platform = "linux";
					status.capture_ready = false;
				} else if (evt.data === "Packet capture permission is granted") {
					status.capture_platform = "linux";
				} else if (evt.data === "Could not locate config file or config is invalid") {
					status.config_valid = false;
				} else if (evt.data.startsWith("The config is older than 7 days.")) {
					status.config_up_to_date = false;
				} else if (evt.data.includes("The config is from the patch: ")) {
					status.patch = evt.data.replace("The config is from the patch: ", "");
				}
			} else if (evt.kind === "stderr") {
				console.error(evt.data);
				status.something_else = evt.data;
			} else {
				unsubscribe();
				resolve(status);
			}
		});
	});
}
