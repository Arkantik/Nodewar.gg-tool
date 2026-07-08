import { create } from "zustand";

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
	id: string;
	type: ToastType;
	message: string;
}

const DEFAULT_DURATION_MS = 5000;
const MAX_VISIBLE_TOASTS = 4;

function generateId() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface ToastStore {
	toasts: Toast[];
	push: (type: ToastType, message: string) => string;
	dismiss: (id: string) => void;
}

const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const useToastStore = create<ToastStore>((set) => ({
	toasts: [],

	push: (type, message) => {
		const id = generateId();
		set((state) => ({ toasts: [...state.toasts, { id, type, message }].slice(-MAX_VISIBLE_TOASTS) }));

		const timer = setTimeout(() => useToastStore.getState().dismiss(id), DEFAULT_DURATION_MS);
		dismissTimers.set(id, timer);

		return id;
	},

	dismiss: (id) => {
		const timer = dismissTimers.get(id);
		if (timer) {
			clearTimeout(timer);
			dismissTimers.delete(id);
		}
		set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
	},
}));

export abstract class ToastManager {
	static push(type: ToastType, message: string): string {
		return useToastStore.getState().push(type, message);
	}
	static dismiss(id: string): void {
		useToastStore.getState().dismiss(id);
	}
	static info(message: string): string {
		return ToastManager.push("info", message);
	}
	static success(message: string): string {
		return ToastManager.push("success", message);
	}
	static warning(message: string): string {
		return ToastManager.push("warning", message);
	}
	static error(message: string): string {
		return ToastManager.push("error", message);
	}
}
