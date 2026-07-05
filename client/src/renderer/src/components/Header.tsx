import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuDownload } from "react-icons/lu";
import Icon from "./ui/Icon";
import LanguageSelector from "./LanguageSelector";

function Header() {
	const { t } = useTranslation();
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [newVersion, setNewVersion] = useState("");
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		const unsubscribe = window.api.updater.onEvent((evt) => {
			if (evt.status === "available") {
				setUpdateAvailable(true);
				setNewVersion(evt.version);
			} else if (evt.status === "downloading") {
				setUpdating(true);
			} else if (evt.status === "error") {
				console.error("Update failed:", evt.message);
				alert(t("header.updateFailed") + "\n\n" + evt.message);
				setUpdating(false);
			}
		});

		window.api.updater.check();

		return unsubscribe;
	}, [t]);

	async function handleUpdate() {
		if (updating) return;
		setUpdating(true);
		await window.api.updater.download();
	}

	return (
		<header className="chrome-panel flex items-center justify-end gap-3 px-6 py-3 border-b-0">
			{updateAvailable && (
				<button
					onClick={handleUpdate}
					disabled={updating}
					className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-cta-500 hover:bg-cta-600 text-gray-900 rounded-md transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-sm font-medium shadow-xs hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
					title={t("header.updateToVersion", { version: newVersion })}>
					<Icon icon={LuDownload} size="sm" />
					{updating ? t("header.updating") : t("header.updateAvailable")}
				</button>
			)}
			<LanguageSelector />
		</header>
	);
}

export default Header;
