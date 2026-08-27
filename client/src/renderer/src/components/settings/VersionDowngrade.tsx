import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuDownload, LuTriangleAlert } from "react-icons/lu";
import type { ReleaseSummary } from "../../../../shared/ipc-contract";
import { ToastManager } from "../toast/toast-store";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import LoadingIndicator from "../ui/LoadingIndicator";

interface VersionDowngradeProps {
	currentVersion: string;
}

function VersionDowngrade({ currentVersion }: VersionDowngradeProps) {
	const { t } = useTranslation();
	const [expanded, setExpanded] = useState(false);
	const [loading, setLoading] = useState(true);
	const [supported, setSupported] = useState(true);
	const [releases, setReleases] = useState<ReleaseSummary[]>([]);
	const [applyingTag, setApplyingTag] = useState<string | null>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		(async () => {
			try {
				const result = await window.api.versions.list();
				setSupported(result.supported);
				setReleases(result.releases);
			} catch (e) {
				console.error(e);
				ToastManager.error(t("settings.downgrade.loadError"));
			}
			setLoading(false);
		})();
	}, [t]);

	useEffect(() => {
		return window.api.versions.onEvent((evt) => {
			if (evt.status === "downloading") {
				setProgress(evt.percent);
			} else if (evt.status === "error") {
				ToastManager.error(t("settings.downgrade.applyError", { message: evt.message }));
				setApplyingTag(null);
				setProgress(0);
			}
		});
	}, [t]);

	async function handleApply(release: ReleaseSummary) {
		if (applyingTag) return;
		if (!confirm(t("settings.downgrade.confirm", { version: release.version }))) return;

		setApplyingTag(release.tag);
		setProgress(0);
		await window.api.versions.downgradeTo(release.tag);
	}

	return (
		<div>
			<button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} className="cursor-pointer w-full py-4 flex items-center justify-between gap-4 text-left group">
				<p className="text-sm font-medium text-white group-hover:text-gray-200 transition-colors duration-150">{t("settings.downgrade.title")}</p>
				<Icon icon={LuChevronDown} size="sm" className={`text-gray-400 shrink-0 transition-transform duration-200 ease-out ${expanded ? "rotate-180" : ""}`} />
			</button>

			{expanded && (
				<div className="pb-4 space-y-4">
					<div className="flex items-start gap-2">
						<Icon icon={LuTriangleAlert} size="sm" className="text-red-400 shrink-0 mt-0.5" />
						<p className="text-xs text-red-300/90 leading-relaxed">{t("settings.downgrade.description")}</p>
					</div>

					{currentVersion && <p className="text-xs text-gray-500">{t("settings.downgrade.currentVersion", { version: currentVersion })}</p>}

					{loading ? (
						<div className="flex justify-center py-4">
							<LoadingIndicator size="sm" />
						</div>
					) : !supported || releases.length === 0 ? (
						<p className="text-xs text-gray-500 py-2">{t("settings.downgrade.empty")}</p>
					) : (
						<div className="max-h-72 overflow-y-auto scrollbar-thin">
							{releases.map((release) => (
								<div key={release.tag} className="flex items-center justify-between gap-3 py-3">
									<div>
										<span className="text-sm font-mono text-white">v{release.version}</span>
										<span className="text-xs text-gray-500 ml-2">{new Date(release.publishedAt).toLocaleDateString()}</span>
									</div>
									{applyingTag === release.tag ? (
										<div className="flex items-center gap-2 w-28 shrink-0">
											<div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
												<div className="h-full bg-cta-500 transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
											</div>
											<span className="text-xs text-gray-400 tabular-nums w-8 text-right">{Math.round(progress)}%</span>
										</div>
									) : (
										<Button size="sm" color="secondary" disabled={applyingTag !== null} onClick={() => handleApply(release)}>
											<Icon icon={LuDownload} size="sm" className="mr-1.5" />
											{t("settings.downgrade.apply")}
										</Button>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default VersionDowngrade;
