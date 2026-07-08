import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function MinimizeIcon() {
	return (
		<svg width="10" height="10" viewBox="0 0 10 10" fill="none" strokeLinecap="round" strokeLinejoin="round">
			<path d="M0.5 8.5H9.5" stroke="currentColor" />
		</svg>
	);
}

function MaximizeIcon() {
	return (
		<svg width="10" height="10" viewBox="0 0 10 10" fill="none" strokeLinecap="round" strokeLinejoin="round">
			<path d="M6 0.5H9.5V4M4 9.5H0.5V6" stroke="currentColor" />
		</svg>
	);
}

function RestoreIcon() {
	return (
		<svg width="10" height="10" viewBox="0 0 10 10" fill="none">
			<path d="M5.4 0.4V4.6H9.6M4.6 9.6V5.4H0.4" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter" />
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg width="10" height="10" viewBox="0 0 10 10" fill="none" strokeLinecap="round" strokeLinejoin="round">
			<path d="M0.5 0.5L9.5 9.5M9.5 0.5L0.5 9.5" stroke="currentColor" />
		</svg>
	);
}

function TitleBar() {
	const { t } = useTranslation();
	const [isMaximized, setIsMaximized] = useState(false);

	useEffect(() => {
		window.api.window.isMaximized().then(setIsMaximized);
		return window.api.window.onStateChanged(setIsMaximized);
	}, []);

	const buttonClass = "app-no-drag cursor-pointer flex items-center justify-center w-11 h-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-150 ease-out [&_svg]:stroke-[1.1]";

	return (
		<div className="app-drag grid grid-cols-[1fr_auto_1fr] items-center h-8 shrink-0 bg-background/80 border-b border-white/5 select-none">
			<div />
			<div className="flex items-center gap-2 justify-self-center">
				<img src="./logo.svg" alt="" className="h-4" />
				<span className="text-xs font-semibold text-gray-300">{t("header.appName")}</span>
			</div>
			<div className="flex items-center h-full justify-self-end">
				<button onClick={() => window.api.window.minimize()} className={buttonClass} aria-label="Minimize">
					<MinimizeIcon />
				</button>
				<button onClick={() => window.api.window.toggleMaximize()} className={`${buttonClass}${isMaximized ? " [&_svg]:stroke-[0.9]!" : ""}`} aria-label={isMaximized ? "Restore" : "Maximize"}>
					{isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
				</button>
				<button onClick={() => window.api.window.close()} className={`${buttonClass} hover:bg-red-600 hover:text-white`} aria-label="Close">
					<CloseIcon />
				</button>
			</div>
		</div>
	);
}

export default TitleBar;
