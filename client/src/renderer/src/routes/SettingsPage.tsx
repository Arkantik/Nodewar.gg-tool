import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCircleCheckBig, LuInfo, LuNetwork, LuScanLine, LuUser } from "react-icons/lu";
import { useConfigStore } from "../components/create-config/config-store";
import HotkeyRecorder from "../components/settings/HotkeyRecorder";
import Icon from "../components/ui/Icon";
import PageHeader from "../components/ui/PageHeader";
import ToggleSwitch from "../components/ui/ToggleSwitch";

function SettingsPage() {
	const { t } = useTranslation();
	const config = useConfigStore((s) => s.config);
	const ensureConfigLoaded = useConfigStore((s) => s.ensureLoaded);
	const updateConfig = useConfigStore((s) => s.updateConfig);
	const [allInterfaces, setAllInterfaces] = useState(true);
	const [myFamilyName, setMyFamilyName] = useState("");
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		(async () => {
			const cfg = await ensureConfigLoaded();
			setAllInterfaces(cfg.all_interfaces === true || cfg.all_interfaces === undefined);
			setMyFamilyName(cfg.my_family_name ?? "");
		})();
	}, [ensureConfigLoaded]);

	async function updateAllInterfaces(value: boolean) {
		setAllInterfaces(value);
		if (config) {
			await updateConfig({ ...config, all_interfaces: value });
			showSavedIndicator();
		}
	}

	async function commitmyFamilyName() {
		if (config && config.my_family_name !== myFamilyName) {
			await updateConfig({ ...config, my_family_name: myFamilyName });
			showSavedIndicator();
		}
	}

	function showSavedIndicator() {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	return (
		<div className="flex flex-col h-full w-full p-8">
			<div className="w-full space-y-6">
				<PageHeader icon={LuInfo} title={t("settings.title")} subtitle={t("settings.subtitle")} />

				{saved && (
					<div className="glass-card rounded-md p-4 border border-green-500/50 bg-green-500/10">
						<div className="flex items-center justify-center gap-2">
							<Icon icon={LuCircleCheckBig} size="sm" className="text-green-400" />
							<p className="text-sm text-green-400 font-medium">{t("settings.saved")}</p>
						</div>
					</div>
				)}

				<div className="glass-card rounded-md p-4 border border-white/10 hover:border-white/20 transition-colors duration-150 ease-out">
					<div className="flex items-start gap-3 flex-1 mb-3">
						<div className="p-2 bg-white/5 border border-white/10 rounded-md">
							<Icon icon={LuUser} size="sm" className="text-gray-400" />
						</div>
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-white mb-1">{t("settings.myFamilyName.title")} (beta)</h3>
							<p className="text-xs text-gray-400 leading-relaxed">{t("settings.myFamilyName.description")}</p>
						</div>
					</div>
					<input
						type="text"
						value={myFamilyName}
						onChange={(e) => setMyFamilyName(e.target.value)}
						onBlur={commitmyFamilyName}
						onKeyDown={(e) => {
							if (e.key === "Enter") e.currentTarget.blur();
						}}
						placeholder={t("settings.myFamilyName.placeholder")}
						className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cta-500/50"
					/>
				</div>

				<HotkeyRecorder />

				<div className="glass-card rounded-md p-4 border border-white/10 hover:border-white/20 transition-colors duration-150 ease-out">
					<div className="flex items-center justify-between">
						<div className="flex items-start gap-3 flex-1">
							<div className="p-2 bg-white/5 border border-white/10 rounded-md">
								<Icon icon={LuNetwork} size="sm" className="text-gray-400" />
							</div>
							<div className="flex-1">
								<h3 className="text-sm font-semibold text-white mb-1">{t("settings.allInterfaces.title")}</h3>
								<p className="text-xs text-gray-400 leading-relaxed">{t("settings.allInterfaces.description")}</p>
							</div>
						</div>
						<ToggleSwitch checked={allInterfaces} onChange={updateAllInterfaces} className="ml-6" />
					</div>
				</div>

				{config && (
					<div className="glass-card rounded-md p-4 border border-white/10 mb-8">
						<h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
							<Icon icon={LuInfo} size="sm" className="text-gray-400" />
							{t("settings.configInfo.title")}
						</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center py-2 border-b border-white/5">
								<span className="text-sm text-gray-400">{t("settings.configInfo.patchDate")}</span>
								<span className="text-sm text-white font-mono font-medium">{config.patch || t("settings.configInfo.na")}</span>
							</div>
							<div className="flex justify-between items-center py-2 border-b border-white/5">
								<span className="text-sm text-gray-400">{t("settings.configInfo.identifier")}</span>
								<span className="text-sm text-white font-mono font-medium">{config.identifier || t("settings.configInfo.na")}</span>
							</div>
							<div className="flex justify-between items-center py-2">
								<span className="text-sm text-gray-400">{t("settings.configInfo.autoScroll")}</span>
								<span className={`text-sm font-medium ${config.auto_scroll ? "text-green-400" : "text-gray-400"}`}>{config.auto_scroll ? t("settings.configInfo.enabled") : t("settings.configInfo.disabled")}</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default SettingsPage;
