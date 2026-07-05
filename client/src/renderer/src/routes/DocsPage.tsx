import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuBookOpen } from "react-icons/lu";
import type { AccordionHandle } from "../components/ui/Accordion";
import PageHeader from "../components/ui/PageHeader";
import { scrollToId } from "../logic/scroll";
import { ALL_DOCS_SECTION_IDS } from "./docs/ids";
import FaqSection from "./docs/FaqSection";
import ImportantCallout from "./docs/ImportantCallout";
import NeedHelpCard from "./docs/NeedHelpCard";
import OnThisPageNav from "./docs/OnThisPageNav";
import TroubleshootingSection from "./docs/TroubleshootingSection";

function DocsPage() {
	const { t } = useTranslation();
	const scrollRef = useRef<HTMLDivElement>(null);
	const accordionRefs = useRef(new Map<string, AccordionHandle>());
	const [activeId, setActiveId] = useState<string | null>(null);

	function registerAccordionRef(id: string, el: AccordionHandle | null) {
		if (el) accordionRefs.current.set(id, el);
	}

	function jumpToTroubleshooting(id: string) {
		accordionRefs.current.get(id)?.open();
		scrollToId(id);
	}

	useEffect(() => {
		const elements = ALL_DOCS_SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible.length > 0) setActiveId(visible[0].target.id);
			},
			{ root: scrollRef.current, rootMargin: "0px 0px -70% 0px", threshold: 0 },
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={scrollRef} className="flex flex-col h-full w-full overflow-y-auto">
			<div className="w-full p-8 space-y-6">
				<PageHeader icon={LuBookOpen} title={t("docs.title")} subtitle={t("docs.subtitle")} />

				<div className="flex items-start gap-8">
					<div className="flex-1 min-w-0 space-y-6">
						<ImportantCallout />
						<TroubleshootingSection registerRef={registerAccordionRef} />
						<FaqSection />
						<NeedHelpCard />
					</div>

					<OnThisPageNav activeId={activeId} onNavigateTroubleshooting={jumpToTroubleshooting} />
				</div>
			</div>
		</div>
	);
}

export default DocsPage;
