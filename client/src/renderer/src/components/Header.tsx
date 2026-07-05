import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuDownload } from "react-icons/lu";
import Icon from "./ui/Icon";
import LanguageSelector from "./LanguageSelector";
import Button from "./ui/Button";

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
				<Button
					onClick={handleUpdate}
					disabled={updating}
					size="sm"
					className="bg-cta-500 hover:bg-cta-600 text-gray-900"
					title={t("header.updateToVersion", { version: newVersion })}>
					<Icon icon={LuDownload} size="sm" />
					{updating ? t("header.updating") : t("header.updateAvailable")}
				</Button>
			)}
			<LanguageSelector />
		</header>
	);
}

export default Header;
