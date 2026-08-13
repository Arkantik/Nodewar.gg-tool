import { useTranslation } from "react-i18next";
import { FaDiscord } from "react-icons/fa";
import { LuBookOpen, LuFlaskConical, LuFolder, LuGithub, LuGlobe, LuHistory, LuMonitor, LuPlay, LuSettings } from "react-icons/lu";
import { NavLink } from "react-router-dom";
import Icon from "./ui/Icon";
import Tooltip from "./ui/Tooltip";

function Sidebar() {
	const { t } = useTranslation();

	const navItems = [
		{ to: "/record", label: t("home.actions.record.title"), icon: LuPlay },
		{ to: "/open", label: t("home.actions.openFile.title"), icon: LuFolder },
		{ to: "/history", label: t("home.actions.history.title"), icon: LuHistory },
		{ to: "/overlay", label: t("overlay.title"), icon: LuMonitor },
		{ to: "/demo", label: t("home.actions.demo.title"), icon: LuFlaskConical },
		{ to: "/docs", label: t("docs.title"), icon: LuBookOpen },
		{ to: "/settings", label: t("home.actions.settings.title"), icon: LuSettings },
	];

	const socialLinks = [
		{ icon: LuGlobe, url: "https://nodewar.gg", title: t("home.social.nodewarggWebsite") },
		{ icon: FaDiscord, url: "https://discord.gg/yWYKYRzBt6", title: t("home.social.joinDiscord") },
		{ icon: LuGithub, url: "https://github.com/Arkantik/Nodewar.gg-tool", title: t("home.social.viewOnGitHub") },
	];

	return (
		<aside className="relative w-16 shrink-0 h-full flex flex-col chrome-panel border-r border-white/10 border-b-0">
			<NavLink to="/" className="flex items-center justify-center gap-2.5 px-4 h-18 shrink-0">
				<img src="./logo.svg" alt="" className="w-8 h-8 shrink-0" />
			</NavLink>

			<nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
				{navItems.map((item) => (
					<Tooltip key={item.to} content={item.label} side="right" gap={14}>
						<NavLink
							to={item.to}
							className={({ isActive }) =>
								`flex items-center gap-3 px-3 py-2.5 rounded-md justify-center transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50 ${
									isActive ? "bg-cta-500/10 text-cta-400" : "text-gray-400 hover:bg-white/5 hover:text-white"
								}`
							}>
							<Icon icon={item.icon} size="sm" className="shrink-0" />
						</NavLink>
					</Tooltip>
				))}
			</nav>

			<hr className="border-white/10" />

			<div className="flex flex-col gap-1 p-2">
				{socialLinks.map((link, index) => (
					<Tooltip key={index} content={link.title} side="right" gap={14}>
						<button
							onClick={() => window.api.shell.openExternal(link.url)}
							className="cursor-pointer flex items-center justify-center px-3 py-2.5 rounded-md transition-all duration-150 ease-out hover:bg-white/10 active:scale-[0.92] text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50">
							<Icon icon={link.icon} size="sm" />
						</button>
					</Tooltip>
				))}
			</div>
		</aside>
	);
}

export default Sidebar;
