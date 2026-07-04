export type LoggerStatus = {
	npcap_installed: boolean;
	config_valid: boolean;
	config_up_to_date: boolean;
	something_else: string;
	patch: string;
};

const KNOWN_STATUS_LINES = new Set(["Npcap is not installed", "Could not locate config file or config is invalid", "The config is older than 7 days. It might not work anymore. Try to update the config by using:\r\nlogger.exe -u"]);

export async function check_status(): Promise<LoggerStatus> {
	const status: LoggerStatus = {
		npcap_installed: true,
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
				if (KNOWN_STATUS_LINES.has(evt.data)) {
					if (evt.data === "Npcap is not installed") status.npcap_installed = false;
					else if (evt.data === "Could not locate config file or config is invalid") status.config_valid = false;
					else status.config_up_to_date = false;
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
