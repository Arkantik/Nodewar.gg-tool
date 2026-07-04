import type { IconType } from "react-icons";
import Icon from "./Icon";
import LoadingIndicator from "./LoadingIndicator";

interface StatusCardProps {
	label: string;
	isValid: boolean;
	statusText: string;
	statusIcon: IconType;
	statusColor: string;
	loading?: boolean;
	link?: {
		url: string;
		text: string;
	};
}

function StatusCard({ label, isValid, statusText, statusIcon, statusColor, loading = false, link }: StatusCardProps) {
	return (
		<div className="flex items-center gap-3">
			<span className="text-sm font-medium text-gray-300">{label}</span>
			{loading ? (
				<LoadingIndicator size="sm" />
			) : isValid ? (
				<div className={`flex items-center gap-2 px-3 py-1 ${statusColor} rounded-md`}>
					<Icon icon={statusIcon} size="sm" className={statusColor.replace("bg-", "text-").replace("/20", "")} />
					<span className={`text-xs font-semibold ${statusColor.replace("bg-", "text-").replace("/20", "")}`}>{statusText}</span>
				</div>
			) : (
				<div className="flex items-center gap-3">
					<Icon icon={statusIcon} size="sm" className="text-red-400" />
					{!loading && link && (
						<button
							onClick={() => window.api.shell.openExternal(link.url)}
							className="cursor-pointer text-sm text-cta-400 hover:text-cta-300 underline transition-colors duration-150 active:scale-[0.97]">
							{link.text}
						</button>
					)}
				</div>
			)}
		</div>
	);
}

export default StatusCard;
