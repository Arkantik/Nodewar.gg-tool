import type { IconType } from "react-icons";
import Icon from "./Icon";

interface StatCardProps {
	label: string;
	value: number | string;
	icon: IconType;
	valueColor?: string;
}

function StatCard({ label, value, icon, valueColor = "text-white" }: StatCardProps) {
	return (
		<div className="glass-card flex justify-between items-center rounded-md p-3 border border-white/10">
			<div className="flex items-center gap-2">
				<Icon icon={icon} size="sm" className="text-gray-500" />
				<span className="section-label">{label}</span>
			</div>
			<div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
		</div>
	);
}

export default StatCard;
