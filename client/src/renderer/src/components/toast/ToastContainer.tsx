import { LuCircleCheck, LuCircleX, LuInfo, LuTriangleAlert, LuX } from "react-icons/lu";
import Icon from "../ui/Icon";
import { useToastStore, type ToastType } from "./toast-store";

const TYPE_STYLES: Record<ToastType, { icon: typeof LuInfo; className: string }> = {
	info: { icon: LuInfo, className: "border-blue-500/30 text-blue-400" },
	success: { icon: LuCircleCheck, className: "border-green-500/30 text-green-400" },
	warning: { icon: LuTriangleAlert, className: "border-yellow-500/30 text-yellow-400" },
	error: { icon: LuCircleX, className: "border-red-500/30 text-red-400" },
};

function ToastContainer() {
	const toasts = useToastStore((s) => s.toasts);
	const dismiss = useToastStore((s) => s.dismiss);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed bottom-4 right-4 z-52 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
			{toasts.map((toast) => {
				const { icon, className } = TYPE_STYLES[toast.type];
				return (
					<div key={toast.id} className={`glass-card flex items-start gap-2.5 rounded-md border bg-background p-3 shadow-lg ${className}`}>
						<Icon icon={icon} size="sm" className="mt-0.5 shrink-0" />
						<p className="flex-1 text-sm text-gray-200">{toast.message}</p>
						<button onClick={() => dismiss(toast.id)} className="shrink-0 text-gray-500 hover:text-gray-300 cursor-pointer">
							<Icon icon={LuX} size="sm" />
						</button>
					</div>
				);
			})}
		</div>
	);
}

export default ToastContainer;
