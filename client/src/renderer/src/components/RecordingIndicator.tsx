import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCircle } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { useRecordingStore } from "../logic/recording-store";
import Icon from "./ui/Icon";
import Tooltip from "./ui/Tooltip";

function formatElapsed(ms: number) {
	const totalSeconds = Math.max(0, Math.floor(ms / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function RecordingIndicator() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const sessionActive = useRecordingStore((s) => s.sessionActive);
	const startedAt = useRecordingStore((s) => s.startedAt);
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		if (!sessionActive) return;
		setNow(Date.now());
		const interval = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(interval);
	}, [sessionActive]);

	if (!sessionActive) return null;

	return (
		<Tooltip content={t("record.status.recording")} side="bottom" gap={4}>
			<button
				onClick={() => navigate("/record")}
				className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 hover:bg-green-500/20 transition-all duration-150 ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-500/50">
				<Icon icon={LuCircle} size="sm" className="text-green-400 fill-green-400 animate-pulse" />
				<span className="text-sm font-semibold text-green-400 tabular-nums">{formatElapsed(now - startedAt)}</span>
			</button>
		</Tooltip>
	);
}

export default RecordingIndicator;
