import { useTranslation } from "react-i18next";
import { scrollToId } from "../../logic/scroll";
import { FAQ_IDS, TROUBLESHOOTING_IDS } from "./ids";

interface NavLink {
	id: string;
	label: string;
}

interface NavGroupProps {
	title: string;
	links: NavLink[];
	activeId: string | null;
	onNavigate: (id: string) => void;
}

function NavGroup({ title, links, activeId, onNavigate }: NavGroupProps) {
	return (
		<div>
			<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
			<ul className="space-y-0.5 border-l border-white/10">
				{links.map((link) => (
					<li key={link.id}>
						<button
							onClick={() => onNavigate(link.id)}
							className={`cursor-pointer w-full text-left -ml-px pl-3 py-1 text-xs border-l-2 transition-colors duration-150 ease-out ${
								activeId === link.id ? "border-cta-400 text-cta-400 font-medium" : "border-transparent text-gray-400 hover:text-white hover:border-white/30"
							}`}>
							{link.label}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}

interface OnThisPageNavProps {
	activeId: string | null;
	onNavigateTroubleshooting: (id: string) => void;
}

function OnThisPageNav({ activeId, onNavigateTroubleshooting }: OnThisPageNavProps) {
	const { t } = useTranslation();

	const troubleshootingLinks: NavLink[] = [
		{ id: TROUBLESHOOTING_IDS.startupIssues, label: t("docs.troubleshooting.startupIssues.title") },
		{ id: TROUBLESHOOTING_IDS.pathError, label: t("docs.troubleshooting.pathError.title") },
		{ id: TROUBLESHOOTING_IDS.noLogs, label: t("docs.troubleshooting.noLogs.title") },
		{ id: TROUBLESHOOTING_IDS.wrongNames, label: t("docs.troubleshooting.wrongNames.title") },
		{ id: TROUBLESHOOTING_IDS.cantSave, label: t("docs.troubleshooting.cantSave.title") },
	];

	const faqLinks: NavLink[] = [
		{ id: FAQ_IDS.safe, label: t("docs.faq.safe.title") },
		{ id: FAQ_IDS.banned, label: t("docs.faq.banned.title") },
		{ id: FAQ_IDS.outdatedConfig, label: t("docs.faq.outdatedConfig.title") },
		{ id: FAQ_IDS.anyPvp, label: t("docs.faq.anyPvp.title") },
		{ id: FAQ_IDS.editLogs, label: t("docs.faq.editLogs.title") },
		{ id: FAQ_IDS.accidentalClose, label: t("docs.faq.accidentalClose.title") },
	];

	return (
		<nav className="hidden lg:flex flex-col w-56 shrink-0 sticky top-8 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1 gap-5">
			<NavGroup title={t("docs.troubleshooting.title")} links={troubleshootingLinks} activeId={activeId} onNavigate={onNavigateTroubleshooting} />
			<NavGroup title={t("docs.faq.title")} links={faqLinks} activeId={activeId} onNavigate={scrollToId} />
		</nav>
	);
}

export default OnThisPageNav;
