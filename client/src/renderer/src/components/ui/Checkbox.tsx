import type { InputHTMLAttributes } from "react";
import classNames from "classnames";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
	checked: boolean;
}

export function Checkbox({ checked, className, ...props }: CheckboxProps) {
	return (
		<label className={classNames("inline-flex items-center cursor-pointer", className)}>
			<input type="checkbox" checked={checked} className="sr-only peer" {...props} />
			<div
				className={classNames("relative w-4 h-4 rounded border-2 transition-colors", "peer-focus:ring-2 peer-focus:ring-cta-300/50 peer-focus:ring-offset-1 peer-focus:ring-offset-background", {
					"bg-cta-500 border-cta-500": checked,
					"bg-transparent border-gray-600": !checked,
				})}>
				{checked && (
					<svg className="absolute inset-0 w-full h-full text-black p-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
						<polyline points="3,8 6,11 13,4" />
					</svg>
				)}
			</div>
		</label>
	);
}

export default Checkbox;
