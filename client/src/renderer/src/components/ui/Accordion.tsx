import { forwardRef, useId, useImperativeHandle, useState } from "react";
import Icon from "./Icon";
import { LuChevronDown } from "react-icons/lu";

export interface AccordionHandle {
	open: () => void;
}

interface AccordionProps {
	id?: string;
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}

const Accordion = forwardRef<AccordionHandle, AccordionProps>(function Accordion({ id, title, children, defaultOpen = false }, ref) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const contentId = useId();

	useImperativeHandle(ref, () => ({ open: () => setIsOpen(true) }), []);

	return (
		<div id={id} className="glass-card rounded-md border border-white/10 overflow-hidden scroll-mt-4">
			<button
				onClick={() => setIsOpen(!isOpen)}
				aria-expanded={isOpen}
				aria-controls={contentId}
				className="cursor-pointer w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
				<span className="text-base font-semibold text-white text-left">{title}</span>
				<Icon icon={LuChevronDown} size="sm" className={`text-gray-400 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`} />
			</button>
			<div id={contentId} inert={!isOpen} className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
				<div className="overflow-hidden">
					<div className="px-5 pb-5 max-w-3xl text-sm text-gray-300 leading-relaxed space-y-3">{children}</div>
				</div>
			</div>
		</div>
	);
});

export default Accordion;
