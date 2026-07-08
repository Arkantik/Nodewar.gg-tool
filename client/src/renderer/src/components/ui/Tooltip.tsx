import { cloneElement, isValidElement, useEffect, useLayoutEffect, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

type Side = "top" | "bottom" | "left" | "right";

interface TooltipProps {
	content: string;
	side?: Side;
	gap?: number;
	children: ReactElement;
}

const SHOW_DELAY = 300;
const DEFAULT_GAP = 8;
const VIEWPORT_PADDING = 4;

const OFFSETS: Record<Side, (rect: DOMRect, gap: number) => { top: number; left: number }> = {
	right: (rect, gap) => ({ top: rect.top + rect.height / 2, left: rect.right + gap }),
	left: (rect, gap) => ({ top: rect.top + rect.height / 2, left: rect.left - gap }),
	top: (rect, gap) => ({ top: rect.top - gap, left: rect.left + rect.width / 2 }),
	bottom: (rect, gap) => ({ top: rect.bottom + gap, left: rect.left + rect.width / 2 }),
};

const TRANSFORMS: Record<Side, string> = {
	right: "translateY(-50%)",
	left: "translate(-100%, -50%)",
	top: "translate(-50%, -100%)",
	bottom: "translateX(-50%)",
};

function Tooltip({ content, side = "top", gap = DEFAULT_GAP, children }: TooltipProps) {
	const [open, setOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const triggerRef = useRef<HTMLElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null);
	const timeoutRef = useRef<number | undefined>(undefined);

	useEffect(
		() => () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		},
		[],
	);

	useLayoutEffect(() => {
		if (!open || !tooltipRef.current) return;
		const rect = tooltipRef.current.getBoundingClientRect();

		let deltaX = 0;
		if (rect.right > window.innerWidth - VIEWPORT_PADDING) deltaX = window.innerWidth - VIEWPORT_PADDING - rect.right;
		else if (rect.left < VIEWPORT_PADDING) deltaX = VIEWPORT_PADDING - rect.left;

		let deltaY = 0;
		if (rect.bottom > window.innerHeight - VIEWPORT_PADDING) deltaY = window.innerHeight - VIEWPORT_PADDING - rect.bottom;
		else if (rect.top < VIEWPORT_PADDING) deltaY = VIEWPORT_PADDING - rect.top;

		if (deltaX !== 0 || deltaY !== 0) {
			setPosition((prev) => ({ top: prev.top + deltaY, left: prev.left + deltaX }));
		}
	}, [open]);

	function show() {
		timeoutRef.current = setTimeout(() => {
			const rect = triggerRef.current?.getBoundingClientRect();
			if (!rect) return;
			setPosition(OFFSETS[side](rect, gap));
			setOpen(true);
		}, SHOW_DELAY);
	}

	function hide() {
		clearTimeout(timeoutRef.current);
		setOpen(false);
	}

	if (!isValidElement(children)) return children;

	return (
		<>
			{cloneElement(children as ReactElement<Record<string, unknown>>, {
				ref: triggerRef,
				onMouseEnter: show,
				onMouseLeave: hide,
				onFocus: show,
				onBlur: hide,
				onMouseDown: hide,
			})}
			{open &&
				createPortal(
					<div
						ref={tooltipRef}
						role="tooltip"
						className="tooltip-fade fixed z-100 px-2 py-1 rounded-md chrome-panel border border-white/10 text-xs font-medium text-gray-200 whitespace-nowrap pointer-events-none shadow-lg"
						style={{ top: position.top, left: position.left, transform: TRANSFORMS[side] }}>
						{content}
					</div>,
					document.body,
				)}
		</>
	);
}

export default Tooltip;
