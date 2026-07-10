import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import Icon from "./Icon";

interface PageHeaderProps {
	icon: IconType;
	title: string;
	subtitle?: string;
	action?: ReactNode;
	cardHighlight?: boolean;
	iconAccent?: boolean;
	className?: string;
}

export function PageHeader({ icon, title, subtitle, action, cardHighlight = false, iconAccent = false, className }: PageHeaderProps) {
	const cardClasses = cardHighlight ? "border-cta-500/50 bg-cta-500/5" : "border-white/10";
	const iconWrapperClasses = iconAccent ? "bg-cta-500/10" : "bg-white/5";
	const iconClasses = iconAccent ? "text-cta-400" : "text-gray-300";

	return (
		<div className={`glass-card rounded-md p-3 border ${cardClasses} ${className ?? ""}`}>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<div className={`p-2 rounded-md ${iconWrapperClasses}`}>
						<Icon icon={icon} size="sm" className={iconClasses} />
					</div>
					<div>
						<h2 className="text-sm font-bold text-white">{title}</h2>
						{subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
					</div>
				</div>
				{action}
			</div>
		</div>
	);
}

export default PageHeader;
