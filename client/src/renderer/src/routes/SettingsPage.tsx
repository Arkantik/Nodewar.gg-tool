import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuSettings } from "react-icons/lu";
import { useConfigStore } from "../components/create-config/config-store";
import HotkeyRecorder from "../components/settings/HotkeyRecorder";
import VersionDowngrade from "../components/settings/VersionDowngrade";
import { ToastManager } from "../components/toast/toast-store";
import PageHeader from "../components/ui/PageHeader";
import ToggleSwitch from "../components/ui/ToggleSwitch";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div>
			<h3 className="text-sm font-semibold text-white pb-3 border-b border-white/10">{title}</h3>
			{children}
		</div>
	);
}

function SettingRow({ title, description, control }: { title: string; description?: string; control: ReactNode }) {
	return (
		<div className="py-4 flex items-center justify-between gap-4">
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium text-white">{title}</p>
				{description && <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>}
			</div>
			{control}
		</div>
	);
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="py-2.5 flex items-center justify-between gap-4">
			<span className="text-sm text-gray-400">{label}</span>
			<span className={`text-sm font-medium truncate ${accent ? "text-green-400" : "text-white"}`}>{value}</span>
		</div>
	);
}

function SettingsPage() {
	const { t } = useTranslation();
	const config = useConfigStore((s) => s.config);
	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
	const updateConfig = useConfigStore((s) => s.updateConfig);
	const [allInterfaces, setAllInterfaces] = useState(true);
	const [appVersion, setAppVersion] = useState("");

	useEffect(() => {
		(async () => {
			const cfg = await ensureConfigLoaded();
			setAllInterfaces(cfg.all_interfaces === true || cfg.all_interfaces === undefined);
		})();
	}, [ensureConfigLoaded]);

	useEffect(() => {
		window.api.app.getVersion().then(setAppVersion);
	}, []);

	async function updateAllInterfaces(value: boolean) {
		setAllInterfaces(value);
		if (config) {
			await updateConfig({ ...config, all_interfaces: value });
			ToastManager.success(t("settings.saved"));
		}
	}

	return (
		<div className="flex flex-col h-full w-full p-8">
			<div className="w-full max-w-2xl space-y-8">
				<PageHeader icon={LuSettings} title={t("settings.title")} subtitle={t("settings.subtitle")} />

				<Section title={t("settings.sections.capture")}>
					<SettingRow title={t("settings.allInterfaces.title")} description={t("settings.allInterfaces.description")} control={<ToggleSwitch checked={allInterfaces} onChange={updateAllInterfaces} className="ml-6 shrink-0" />} />
				</Section>

				<Section title={t("settings.sections.shortcuts")}>
					<HotkeyRecorder />
				</Section>

				{config && (
					<Section title={t("settings.sections.about")}>
						<InfoRow label={t("settings.about.version")} value={appVersion ? `v${appVersion}` : t("settings.about.na")} />
						<InfoRow label={t("settings.about.patchDate")} value={config.patch || t("settings.about.na")} />
						<InfoRow label={t("settings.about.identifier")} value={config.identifier || t("settings.about.na")} />
						<InfoRow label={t("settings.about.autoScroll")} value={config.auto_scroll ? t("settings.about.enabled") : t("settings.about.disabled")} accent={config.auto_scroll} />
					</Section>
				)}

				<Section title={t("settings.sections.advanced")}>
					<VersionDowngrade currentVersion={appVersion} />
				</Section>
			</div>
		</div>
	);
}

export default SettingsPage;
