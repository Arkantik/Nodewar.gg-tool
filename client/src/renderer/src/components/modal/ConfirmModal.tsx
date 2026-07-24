import Button from "../ui/Button";
import { ModalManager } from "./modal-store";

export interface ConfirmModalProps {
	title: string;
	message: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => void | Promise<void>;
}

export default function ConfirmModal({ title, message, confirmLabel, cancelLabel, onConfirm }: ConfirmModalProps) {
	return (
		<div className="flex flex-col gap-4 max-w-md">
			<h2 className="text-lg font-semibold text-white">{title}</h2>
			<p className="text-sm text-gray-300 whitespace-pre-line">{message}</p>
			<div className="flex gap-2 justify-end">
				<Button color="outline" size="sm" onClick={() => ModalManager.close()}>
					{cancelLabel}
				</Button>
				<Button
					color="primary"
					size="sm"
					onClick={async () => {
						ModalManager.close();
						await onConfirm();
					}}
				>
					{confirmLabel}
				</Button>
			</div>
		</div>
	);
}
