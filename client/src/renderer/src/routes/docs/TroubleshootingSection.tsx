import { useTranslation } from "react-i18next";
import { LuTriangleAlert } from "react-icons/lu";
import Accordion, { type AccordionHandle } from "../../components/ui/Accordion";
import Icon from "../../components/ui/Icon";
import { TROUBLESHOOTING_IDS } from "./ids";

interface TroubleshootingSectionProps {
	registerRef: (id: string, el: AccordionHandle | null) => void;
}

function TroubleshootingSection({ registerRef }: TroubleshootingSectionProps) {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold text-white flex items-center gap-3">
				<div className="p-2 bg-white/5 border border-white/10 rounded-md">
					<Icon icon={LuTriangleAlert} className="text-gray-400" />
				</div>
				{t("docs.troubleshooting.title")}
			</h2>

			<Accordion id={TROUBLESHOOTING_IDS.startupIssues} ref={(el) => registerRef(TROUBLESHOOTING_IDS.startupIssues, el)} title={t("docs.troubleshooting.startupIssues.title")} defaultOpen={true}>
				<p className="font-semibold text-white">{t("docs.troubleshooting.startupIssues.problem")}</p>
				<ol className="list-inside space-y-2 ml-2">
					<li>
						{t("docs.troubleshooting.startupIssues.checkNpcap")}
						<ul className="list-disc list-inside ml-6 mt-1 space-y-1">
							<li>{t("docs.troubleshooting.startupIssues.openLogger")}</li>
							<li>{t("docs.troubleshooting.startupIssues.checkStatus")}</li>
							<li>
								{t("docs.troubleshooting.startupIssues.downloadNpcap")}{" "}
								<a href="https://npcap.com/dist/" className="text-cta-400 hover:text-cta-300 underline">
									npcap.com
								</a>
							</li>
						</ul>
					</li>
				</ol>
			</Accordion>

			<Accordion id={TROUBLESHOOTING_IDS.pathError} ref={(el) => registerRef(TROUBLESHOOTING_IDS.pathError, el)} title={t("docs.troubleshooting.pathError.title")}>
				<p>{t("docs.troubleshooting.pathError.description")}</p>
				<ol className="list-decimal list-inside space-y-2 ml-2 mt-3">
					<li>
						{t("docs.troubleshooting.pathError.step1")}{" "}
						<a href="https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/" className="text-cta-400 hover:text-cta-300 underline break-all">
							{t("docs.troubleshooting.pathError.step1Link")}
						</a>
					</li>
					<li>{t("docs.troubleshooting.pathError.step2")}</li>
					<li>{t("docs.troubleshooting.pathError.step3")}</li>
				</ol>
			</Accordion>

			<Accordion id={TROUBLESHOOTING_IDS.noLogs} ref={(el) => registerRef(TROUBLESHOOTING_IDS.noLogs, el)} title={t("docs.troubleshooting.noLogs.title")}>
				<ol className="list-decimal list-inside space-y-3 ml-2">
					<li>
						<strong className="text-white">{t("docs.troubleshooting.noLogs.vpn.title")}</strong> {t("docs.troubleshooting.noLogs.vpn.text")}
					</li>
					<li>
						<strong className="text-white">{t("docs.troubleshooting.noLogs.outdatedConfig.title")}</strong> {t("docs.troubleshooting.noLogs.outdatedConfig.text")}
						<ul className="list-disc list-inside ml-6 mt-1 space-y-1">
							<li>{t("docs.troubleshooting.noLogs.outdatedConfig.waitUpdate")}</li>
							<li>{t("docs.troubleshooting.noLogs.outdatedConfig.checkDiscord")}</li>
							<li>{t("docs.troubleshooting.noLogs.outdatedConfig.useWireshark")}</li>
						</ul>
					</li>
					<li>
						<strong className="text-white">{t("docs.troubleshooting.noLogs.wrongInterface.title")}</strong>
						<ul className="list-disc list-inside ml-6 mt-1 space-y-1">
							<li>{t("docs.troubleshooting.noLogs.wrongInterface.goToSettings")}</li>
							<li>{t("docs.troubleshooting.noLogs.wrongInterface.trySwitching")}</li>
							<li>{t("docs.troubleshooting.noLogs.wrongInterface.restartRecording")}</li>
						</ul>
					</li>
					<li>
						<strong className="text-white">{t("docs.troubleshooting.noLogs.firewall.title")}</strong>
						<ul className="list-disc list-inside ml-6 mt-1 space-y-1">
							<li>{t("docs.troubleshooting.noLogs.firewall.addException")}</li>
							<li>{t("docs.troubleshooting.noLogs.firewall.runAdmin")}</li>
						</ul>
					</li>
				</ol>
			</Accordion>

			<Accordion id={TROUBLESHOOTING_IDS.wrongNames} ref={(el) => registerRef(TROUBLESHOOTING_IDS.wrongNames, el)} title={t("docs.troubleshooting.wrongNames.title")}>
				<ol className="list-decimal list-inside space-y-2 ml-2">
					<li>{t("docs.troubleshooting.wrongNames.step1")}</li>
					<li>
						{t("docs.troubleshooting.wrongNames.step2")}{" "}
						<span className="font-mono text-cta-400">
							YourGuild-FamilyName {t("logger.killed")}/{t("logger.diedTo")} Enemy-FamilyName {t("logger.from")} Guild
						</span>
					</li>
					<li>{t("docs.troubleshooting.wrongNames.step3")}</li>
				</ol>
			</Accordion>

			<Accordion id={TROUBLESHOOTING_IDS.cantSave} ref={(el) => registerRef(TROUBLESHOOTING_IDS.cantSave, el)} title={t("docs.troubleshooting.cantSave.title")}>
				<ol className="list-decimal list-inside space-y-2 ml-2">
					<li>{t("docs.troubleshooting.cantSave.step1")}</li>
					<li>{t("docs.troubleshooting.cantSave.step2")}</li>
					<li>{t("docs.troubleshooting.cantSave.step3")}</li>
				</ol>
			</Accordion>
		</div>
	);
}

export default TroubleshootingSection;
