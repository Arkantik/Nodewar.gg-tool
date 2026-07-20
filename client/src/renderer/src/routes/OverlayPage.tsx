import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuMonitor } from "react-icons/lu";
import { DEFAULT_OVERLAY_SETTINGS, type OverlayAnchor, type OverlaySettings } from "../../../shared/ipc-contract";
import PageHeader from "../components/ui/PageHeader";
import ToggleSwitch from "../components/ui/ToggleSwitch";

interface PositionButtonProps {
	anchor: OverlayAnchor;
	label: string;
	active: boolean;
	onSelect: (anchor: OverlayAnchor) => void;
}

function PositionButton({ anchor, label, active, onSelect }: PositionButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(anchor)}
			title={label}
			className={`h-12 rounded-md border text-xs font-medium transition-all duration-150 ease-out cursor-pointer ${
				active ? "border-cta-500 bg-cta-500/10 text-cta-400" : "border-white/10 text-gray-400 hover:bg-white/5 hover:text-white"
			}`}>
			{label}
		</button>
	);
}

function OverlayPage() {
	const { t } = useTranslation();
	const [settings, setSettings] = useState<OverlaySettings>(DEFAULT_OVERLAY_SETTINGS);

	useEffect(() => {
		window.api.overlay.getSettings().then(setSettings);
	}, []);

	async function update(partial: Partial<OverlaySettings>) {
		setSettings((prev) => ({ ...prev, ...partial }));
		await window.api.overlay.setSettings(partial);
	}

	const positions: { anchor: OverlayAnchor; label: string }[] = [
		{ anchor: "top-left", label: t("overlay.position.topLeft") },
		{ anchor: "top-center", label: t("overlay.position.topCenter") },
		{ anchor: "top-right", label: t("overlay.position.topRight") },
		{ anchor: "center-left", label: t("overlay.position.centerLeft") },
		{ anchor: "center-right", label: t("overlay.position.centerRight") },
		{ anchor: "bottom-left", label: t("overlay.position.bottomLeft") },
		{ anchor: "bottom-right", label: t("overlay.position.bottomRight") },
	];

	function positionAt(anchor: OverlayAnchor) {
		const entry = positions.find((p) => p.anchor === anchor);
		if (!entry) return null;
		return <PositionButton anchor={entry.anchor} label={entry.label} active={settings.anchor === entry.anchor} onSelect={(a) => update({ anchor: a })} />;
	}

	return (
		<div className="flex flex-col min-h-full w-full p-8">
			<div className="w-full space-y-6">
				<PageHeader icon={LuMonitor} title={t("overlay.title")} subtitle={t("overlay.subtitle")} />

				<div className="glass-card rounded-md p-4 border border-white/10">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.enabled")}</p>
							<p className="text-xs text-gray-400">{t("overlay.enabledDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.enabled} onChange={(checked) => update({ enabled: checked })} className="ml-6" />
					</div>
				</div>

				<div className={`glass-card rounded-md p-4 border border-white/10 transition-opacity duration-150 ${settings.enabled ? "" : "opacity-50 pointer-events-none"}`}>
					<h3 className="text-sm font-semibold text-white mb-3">{t("overlay.position.title")}</h3>
					<div className="grid grid-cols-3 gap-2 max-w-xs">
						{positionAt("top-left")}
						{positionAt("top-center")}
						{positionAt("top-right")}
						{positionAt("center-left")}
						<div />
						{positionAt("center-right")}
						{positionAt("bottom-left")}
						<div />
						{positionAt("bottom-right")}
					</div>
				</div>

				<div className={`glass-card rounded-md p-4 border border-white/10 space-y-3 transition-opacity duration-150 ${settings.enabled ? "" : "opacity-50 pointer-events-none"}`}>
					<h3 className="text-sm font-semibold text-white">{t("overlay.content.title")}</h3>

					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.content.showGuilds")}</p>
							<p className="text-xs text-gray-400">{t("overlay.content.showGuildsDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.showGuilds} onChange={(checked) => update({ showGuilds: checked })} className="ml-6" />
					</div>

					<div className="ml-2 pl-3 border-l border-white/10 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.content.showGuildKD")}</p>
							<p className="text-xs text-gray-400">{t("overlay.content.showGuildKDDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.showGuildKD} onChange={(checked) => update({ showGuildKD: checked })} disabled={!settings.showGuilds} className="ml-6" />
					</div>

					<div className="ml-4 pl-3 border-l border-white/10 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.content.showGuildKDDetails")}</p>
							<p className="text-xs text-gray-400">{t("overlay.content.showGuildKDDetailsDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.showGuildKDDetails} onChange={(checked) => update({ showGuildKDDetails: checked })} disabled={!settings.showGuilds || !settings.showGuildKD} className="ml-6" />
					</div>

					<hr className="border-white/5" />

					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.content.showPlayers")}</p>
							<p className="text-xs text-gray-400">{t("overlay.content.showPlayersDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.showPlayers} onChange={(checked) => update({ showPlayers: checked })} className="ml-6" />
					</div>

					<div className="ml-2 pl-3 border-l border-white/10 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.content.showPlayerKD")}</p>
							<p className="text-xs text-gray-400">{t("overlay.content.showPlayerKDDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.showPlayerKD} onChange={(checked) => update({ showPlayerKD: checked })} disabled={!settings.showPlayers} className="ml-6" />
					</div>

					<div className="ml-4 pl-3 border-l border-white/10 flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-white">{t("overlay.content.showPlayerKDDetails")}</p>
							<p className="text-xs text-gray-400">{t("overlay.content.showPlayerKDDetailsDescription")}</p>
						</div>
						<ToggleSwitch checked={settings.showPlayerKDDetails} onChange={(checked) => update({ showPlayerKDDetails: checked })} disabled={!settings.showPlayers || !settings.showPlayerKD} className="ml-6" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default OverlayPage;
