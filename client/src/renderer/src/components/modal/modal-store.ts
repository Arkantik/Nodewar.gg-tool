import type { ComponentType } from "react";
import { create } from "zustand";

interface ModalState {
	component: ComponentType<any> | null;
	props: Record<string, any>;
	isOpen: boolean;
}

interface ModalStore extends ModalState {
	open: (component: ComponentType<any>, props: Record<string, any>) => void;
	updateProps: (component: ComponentType<any>, props: Record<string, any>) => void;
	close: () => void;
}

export const useModalStore = create<ModalStore>((set, get) => ({
	component: null,
	props: {},
	isOpen: false,
	open: (component, props) => set({ component, props, isOpen: true }),
	updateProps: (component, props) => {
		const state = get();
		if (!state.isOpen || state.component !== component) return;
		set({ props });
	},
	close: () => set({ component: null, props: {}, isOpen: false }),
}));

export abstract class ModalManager {
	static open<P extends object>(component: ComponentType<P>, props: P) {
		useModalStore.getState().open(component, props);
	}

	static update<P extends object>(component: ComponentType<P>, props: P) {
		useModalStore.getState().updateProps(component, props);
	}

	static close() {
		useModalStore.getState().close();
	}
}
