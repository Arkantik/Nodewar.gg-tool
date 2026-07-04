import type { IconType } from "react-icons";
import classNames from "classnames";

interface IconProps {
	icon: IconType;
	className?: string;
	size?: "sm" | "md" | "lg";
}

export function Icon({ icon: IconComponent, className, size = "md" }: IconProps) {
	const iconClasses = classNames(
		{
			"w-4 h-4": size === "sm",
			"w-5 h-5": size === "md",
			"w-8 h-8": size === "lg",
		},
		className,
	);

	return (
		<div className={iconClasses}>
			<IconComponent className="w-full h-full" />
		</div>
	);
}

export default Icon;
