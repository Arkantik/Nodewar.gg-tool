import { create } from "zustand";
import type { ComponentType } from "react";

interface ModalState {
	component: ComponentType<any> | null;
	props: Record<string, any>;
	isOpen: boolean;
}

interface ModalStore extends ModalState {
	open: (component: ComponentType<any>, props: Record<string, any>) => void;
	close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
	component: null,
	props: {},
	isOpen: false,
	open: (component, props) => set({ component, props, isOpen: true }),
	close: () => set({ component: null, props: {}, isOpen: false }),
}));

export abstract class ModalManager {
	static open<P extends object>(component: ComponentType<P>, props: P) {
		useModalStore.getState().open(component, props);
	}

	static close() {
		useModalStore.getState().close();
	}
}
