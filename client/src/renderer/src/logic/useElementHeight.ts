import { useLayoutEffect, useRef, useState } from "react";

export function useElementHeight<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [height, setHeight] = useState(0);

	useLayoutEffect(() => {
		const el = ref.current;
		if (!el) return;

		const update = () => setHeight(el.getBoundingClientRect().height);
		update();

		const observer = new ResizeObserver(update);
		observer.observe(el);

		return () => observer.disconnect();
	}, []);

	return { ref, height };
}
