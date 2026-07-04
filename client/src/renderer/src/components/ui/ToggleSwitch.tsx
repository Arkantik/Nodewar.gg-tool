import classNames from "classnames";

interface ToggleSwitchProps {
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
	label?: string;
	className?: string;
}

function ToggleSwitch({ checked, onChange, disabled = false, label, className }: ToggleSwitchProps) {
	return (
		<label
			className={classNames("inline-flex items-center cursor-pointer", className, {
				"opacity-50 cursor-not-allowed": disabled,
			})}>
			<input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="sr-only peer" />
			<div
				className={classNames("relative w-11 h-6 rounded-full transition-colors duration-150 ease-out", "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cta-300/50", {
					"bg-cta-500 peer-checked:bg-cta-500": checked,
					"bg-gray-600": !checked,
				})}>
				<div
					className={classNames("absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-150 ease-out", {
						"translate-x-5": checked,
						"translate-x-0": !checked,
					})}
				/>
			</div>
			{label && <span className="ml-3 text-sm font-medium text-foreground">{label}</span>}
		</label>
	);
}

export default ToggleSwitch;
