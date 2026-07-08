import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaDiscord } from "react-icons/fa";
import { LuBookOpen, LuFlaskConical, LuFolder, LuGithub, LuGlobe, LuHistory, LuPanelLeftClose, LuPanelLeftOpen, LuPlay, LuSettings } from "react-icons/lu";
import { NavLink } from "react-router-dom";
import Icon from "./ui/Icon";

const SIDEBAR_COLLAPSED_KEY = "sidebarCollapsed";

function Sidebar() {
	const { t } = useTranslation();
	const [version, setVersion] = useState("");
	const [collapsed, setCollapsed] = useState(false);

	useEffect(() => {
		window.api.app.getVersion().then(setVersion);
		window.api.config.get<boolean>(SIDEBAR_COLLAPSED_KEY).then((value) => {
			if (value !== null) setCollapsed(value);
		});
	}, []);

	function toggleCollapsed() {
		setCollapsed((prev) => {
			const next = !prev;
			window.api.config.set(SIDEBAR_COLLAPSED_KEY, next);
			return next;
		});
	}

	const navItems = [
		{ to: "/record", label: t("home.actions.record.title"), icon: LuPlay },
		{ to: "/open", label: t("home.actions.openFile.title"), icon: LuFolder },
		{ to: "/history", label: t("home.actions.history.title"), icon: LuHistory },
		{ to: "/demo", label: t("home.actions.demo.title"), icon: LuFlaskConical },
		{ to: "/docs", label: t("docs.title"), icon: LuBookOpen },
		{ to: "/settings", label: t("home.actions.settings.title"), icon: LuSettings },
	];

	const socialLinks = [
		{ icon: LuGlobe, url: "https://nodewar.gg", title: t("home.social.nodewarggWebsite") },
		{ icon: FaDiscord, url: "https://discord.gg/yWYKYRzBt6", title: t("home.social.joinDiscord") },
		{ icon: LuGithub, url: "https://github.com/Arkantik/Nodewar.gg-tool", title: t("home.social.viewOnGitHub") },
	];

	const labelClass = collapsed ? "hidden" : "hidden lg:inline";
	const labelBlockClass = collapsed ? "hidden" : "hidden lg:block";
	const justifyClass = collapsed ? "justify-center" : "justify-center lg:justify-start";
	const rowClass = collapsed ? "flex-col" : "flex-col lg:flex-row";
	const rowJustifyClass = collapsed ? "justify-center" : "justify-center lg:justify-between";

	return (
		<aside className={`relative ${collapsed ? "w-16" : "w-16 lg:w-56"} shrink-0 h-full flex flex-col chrome-panel border-r border-white/10 border-b-0`}>
			<button
				onClick={toggleCollapsed}
				className="cursor-pointer hidden lg:flex absolute -right-3 top-8 -translate-y-1/2 z-30 w-6 h-6 items-center justify-center rounded-full bg-background-secondary border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-150 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
				title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}>
				<Icon icon={collapsed ? LuPanelLeftOpen : LuPanelLeftClose} size="sm" />
			</button>

			<NavLink to="/" className={`flex items-center ${justifyClass} gap-2.5 px-4 h-16 shrink-0 border-white/10 transition-colors duration-150 ease-out hover:bg-white/5`}>
				<img src="./logo.svg" alt="" className="w-6 h-6 shrink-0" />
				<span className={`${labelBlockClass} min-w-0`}>
					<span className="block text-sm font-bold text-cta truncate">{t("header.appName")}</span>
					<span className="block text-[10px] text-gray-500 truncate">{t("header.version", { version })}</span>
				</span>
			</NavLink>

			<hr className="border-white/10 mx-4" />

			<nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
				{navItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						title={item.label}
						className={({ isActive }) =>
							`flex items-center gap-3 px-3 py-2.5 rounded-md ${justifyClass} transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50 ${
								isActive ? "bg-cta-500/10 text-cta-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
							}`
						}>
						<Icon icon={item.icon} size="sm" className="shrink-0" />
						<span className={`${labelClass} text-sm font-medium truncate`}>{item.label}</span>
					</NavLink>
				))}
			</nav>

			<hr className="border-white/10 mx-4" />

			<div className={`p-2 flex ${rowClass} items-center ${rowJustifyClass} gap-2`}>
				<span className={`ml-2 ${labelClass} text-xs font-semibold text-gray-300 truncate`}>by Arkantik</span>
				<div className={`flex ${rowClass} gap-1`}>
					{socialLinks.map((link, index) => (
						<button
							key={index}
							onClick={() => window.api.shell.openExternal(link.url)}
							className="cursor-pointer p-2 rounded-md transition-all duration-150 ease-out hover:bg-white/10 active:scale-[0.92] text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50"
							title={link.title}>
							<Icon icon={link.icon} size="sm" />
						</button>
					))}
				</div>
			</div>
		</aside>
	);
}

export default Sidebar;
