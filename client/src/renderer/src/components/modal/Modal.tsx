import { useEffect } from "react";
import { useModalStore } from "./modal-store";

function Modal() {
	const { component: ModalComponent, props, isOpen, close } = useModalStore();

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				close();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [isOpen, close]);

	if (!isOpen || !ModalComponent) return null;

	return (
		<div className="z-51 fixed top-0 left-0 w-screen h-screen flex flex-col justify-center bg-background/50 backdrop-blur-sm" onClick={close}>
			<div className="relative m-2 max-h-full">
				<div className="relative w-fit max-w-full max-h-full mx-auto bg-background shadow-lg rounded-md border-cta-400 border h-full" onClick={(e) => e.stopPropagation()}>
					<div className="relative p-4 overflow-auto h-full">
						<ModalComponent {...props} />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Modal;
