import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuRefreshCw, LuShieldAlert, LuShieldCheck, LuShieldX } from "react-icons/lu";
import { useClickOutside } from "../hooks/useClickOutside";
import { check_status, type LoggerStatus } from "../logic/logger-status";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import LoadingIndicator from "./ui/LoadingIndicator";
import StatusCard from "./ui/StatusCard";

type Severity = "neutral" | "green" | "orange" | "red";

function SystemStatusIndicator() {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const [loadingStatus, setLoadingStatus] = useState(false);
	const [status, setStatus] = useState<LoggerStatus | null>(null);

	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [newVersion, setNewVersion] = useState("");
	const [updating, setUpdating] = useState(false);
	const [updateFailed, setUpdateFailed] = useState(false);

	useClickOutside(containerRef, () => setIsOpen(false));

	const runStatusCheck = useCallback(async () => {
		try {
			setLoadingStatus(true);
			const statusResult = await check_status();
			setStatus(statusResult);
		} catch (e) {
			console.error(e);
		}
		setLoadingStatus(false);
	}, []);

	useEffect(() => {
		runStatusCheck();
	}, [runStatusCheck]);

	function handleRecheck() {
		if (loadingStatus) return;
		runStatusCheck();
		setUpdateFailed(false);
		window.api.updater.check();
	}

	useEffect(() => {
		const unsubscribe = window.api.updater.onEvent((evt) => {
			if (evt.status === "available") {
				setUpdateAvailable(true);
				setNewVersion(evt.version);
			} else if (evt.status === "downloading") {
				setUpdating(true);
			} else if (evt.status === "error") {
				console.error("Update failed:", evt.message);
				setUpdateFailed(true);
				setUpdating(false);
			}
		});

		window.api.updater.check();

		return unsubscribe;
	}, []);

	async function handleUpdate() {
		if (updating) return;
		setUpdating(true);
		await window.api.updater.download();
	}

	const captureIssue = !loadingStatus && status !== null && !status.capture_ready;
	const loading = loadingStatus;

	let severity: Severity = "neutral";
	if (!loading) {
		if ((captureIssue && updateAvailable) || (captureIssue && updateFailed)) {
			severity = "red";
		} else if (captureIssue || updateAvailable || updateFailed) {
			severity = "orange";
		} else {
			severity = "green";
		}
	}

	const severityStyles: Record<Severity, { bg: string; text: string; icon: typeof LuShieldCheck }> = {
		neutral: { bg: "bg-white/5", text: "text-gray-400", icon: LuShieldCheck },
		green: { bg: "bg-green-500/10", text: "text-green-400", icon: LuShieldCheck },
		orange: { bg: "bg-orange-500/10", text: "text-orange-400", icon: LuShieldAlert },
		red: { bg: "bg-red-500/10", text: "text-red-400", icon: LuShieldX },
	};

	const { bg, text, icon } = severityStyles[severity];

	return (
		<div className="relative" ref={containerRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`cursor-pointer flex items-center justify-center p-2.5 rounded-md transition-all duration-150 ease-out active:scale-90 ${bg} hover:brightness-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50`}
				title={t("systemStatus.title")}>
				{loading ? <LoadingIndicator size="sm" /> : <Icon icon={icon} className={text} size="sm" />}
			</button>

			{isOpen && (
				<div className="pop-in absolute right-0 top-full mt-2 w-96 chrome-panel rounded-md border border-white/10 shadow-xl overflow-hidden z-50 p-4">
					<div className="flex items-center gap-3 mb-4">
						<div className={`p-2.5 rounded-md ${bg}`}>
							<Icon icon={icon} className={text} size="md" />
						</div>
						<div className="flex-1">
							<h2 className="text-sm font-semibold text-white">{t("systemStatus.title")}</h2>
							<p className="text-xs text-gray-400">{t("systemStatus.subtitle")}</p>
						</div>
						<button
							onClick={handleRecheck}
							disabled={loadingStatus}
							title={t("systemStatus.recheck")}
							className="cursor-pointer disabled:cursor-not-allowed flex items-center justify-center p-2 rounded-md transition-all duration-150 ease-out hover:bg-white/10 active:scale-90 text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50">
							<Icon icon={LuRefreshCw} size="sm" className={loadingStatus ? "animate-spin" : ""} />
						</button>
					</div>

					<div className="flex flex-col gap-4">
						<StatusCard
							label={t(status?.capture_platform === "linux" ? "systemStatus.capture.linux.label" : "systemStatus.capture.windows.label")}
							isValid={status?.capture_ready || false}
							statusText={t(status?.capture_platform === "linux" ? "systemStatus.capture.linux.installed" : "systemStatus.capture.windows.installed")}
							statusIcon={status?.capture_ready ? LuShieldCheck : LuShieldAlert}
							statusColor="bg-green-500/20"
							loading={loadingStatus}
							link={
								!status?.capture_ready && status?.capture_platform !== "linux"
									? {
											url: "https://npcap.com/dist/npcap-1.87.exe",
											text: t("systemStatus.capture.windows.downloadNpcap"),
										}
									: undefined
							}
							helpText={!status?.capture_ready && status?.capture_platform === "linux" ? t("systemStatus.capture.linux.helpText") : undefined}
						/>

						<div className="h-px bg-white/10" />

						<div className="flex items-center justify-between gap-3">
							<span className="text-sm font-medium text-gray-300">{t("systemStatus.update.label")}</span>
							{updating ? (
								<div className="flex items-center gap-2">
									<LoadingIndicator size="sm" />
									<span className="text-xs font-semibold text-gray-300">{t("systemStatus.update.updating")}</span>
								</div>
							) : updateAvailable ? (
								<Button onClick={handleUpdate} size="sm" className="bg-cta-500 hover:bg-cta-600 text-gray-900" title={t("systemStatus.update.updateToVersion", { version: newVersion })}>
									{t("systemStatus.update.updateAvailable")}
								</Button>
							) : updateFailed ? (
								<span className="text-xs font-semibold text-red-400">{t("systemStatus.update.failed")}</span>
							) : (
								<div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-md">
									<Icon icon={LuShieldCheck} size="sm" className="text-green-500" />
									<span className="text-xs font-semibold text-green-500">{t("systemStatus.update.upToDate")}</span>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default SystemStatusIndicator;
