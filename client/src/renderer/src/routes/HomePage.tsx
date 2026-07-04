import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LuCheck, LuCircleAlert, LuShield } from "react-icons/lu";
import Icon from "../components/ui/Icon";
import StatusCard from "../components/ui/StatusCard";
import { check_status, type LoggerStatus } from "../logic/logger-status";

function HomePage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState<LoggerStatus | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const statusResult = await check_status();
				setStatus(statusResult);
			} catch (e) {
				console.error(e);
			}
			setLoading(false);
		})();
	}, []);

	return (
		<div className="flex flex-col h-full relative">
			<div className="absolute top-20 right-20 w-64 h-64 bg-cta-500/10 rounded-full blur-3xl animate-float"></div>
			<div className="absolute bottom-20 left-20 w-64 h-64 bg-cta-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

			<div className="flex-1 flex items-center justify-center px-8 relative z-10">
				<div className="w-full max-w-2xl">
					<div className="glass-card rounded-md px-6 py-4 border border-white/10 flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="p-2.5 bg-cta-500/10 rounded-md">
								<Icon icon={LuShield} className="text-cta-400" size="md" />
							</div>
							<div>
								<h2 className="text-base font-semibold text-white">{t("home.systemStatus.title")}</h2>
								<p className="text-xs text-gray-400">{t("home.systemStatus.subtitle")}</p>
							</div>
						</div>

						<StatusCard
							label={t("home.npcap.label")}
							isValid={status?.npcap_installed || false}
							statusText={t("home.npcap.installed")}
							statusIcon={status?.npcap_installed ? LuCheck : LuCircleAlert}
							statusColor="bg-green-500/20"
							loading={loading}
							link={
								!status?.npcap_installed
									? {
											url: "https://npcap.com/dist/npcap-1.87.exe",
											text: t("home.npcap.downloadNpcap"),
										}
									: undefined
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default HomePage;
