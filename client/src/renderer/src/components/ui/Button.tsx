import type { ButtonHTMLAttributes } from "react";
import classNames from "classnames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	color?: "primary" | "secondary" | "outline";
	size?: "sm" | "md" | "lg";
}

function Button({ children, className, color = "primary", size = "sm", disabled, ...props }: ButtonProps) {
	const buttonClasses = classNames(
		"cursor-pointer disabled:cursor-not-allowed text-center font-medium focus-visible:ring-2 focus-visible:ring-cta-500/50 focus:outline-none flex items-center justify-center rounded-md transition-all duration-150 ease-out active:scale-[0.97] disabled:active:scale-100",
		{
			"bg-cta-500 hover:bg-cta-600 text-gray-900 shadow-xs hover:shadow-md": color === "primary" && !disabled,
			"glass-card glass-card-hover text-white border border-white/10": color === "secondary",
			"bg-transparent border-2 border-cta-500/50 hover:border-cta-500 hover:bg-cta-500/10 text-cta-400": color === "outline" && !disabled,
			"bg-transparent border-2 border-white/10 text-gray-500 shadow-none": color === "outline" && disabled,
			"!bg-gray-700 text-gray-400 shadow-none": color === "primary" && disabled,
			"h-8 px-4 text-xs": size === "sm",
			"h-10 px-5 text-sm": size === "md",
			"h-12 px-6 text-base": size === "lg",
		},
		className,
	);

	return (
		<button className={buttonClasses} disabled={disabled} {...props}>
			{children}
		</button>
	);
}

export default Button;
