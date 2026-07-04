import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown, LuChevronUp, LuCircleCheck, LuInfo, LuTriangleAlert } from "react-icons/lu";
import Icon from "../components/ui/Icon";

interface AccordionItemProps {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<div className="glass-card rounded-md border border-white/10 overflow-hidden">
			<button onClick={() => setIsOpen(!isOpen)} className="cursor-pointer w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
				<span className="text-base font-semibold text-white text-left">{title}</span>
				<Icon icon={isOpen ? LuChevronUp : LuChevronDown} size="sm" className="text-gray-400" />
			</button>
			{isOpen && <div className="px-5 pb-5 text-sm text-gray-300 leading-relaxed space-y-3">{children}</div>}
		</div>
	);
}

function DocsPage() {
	const { t } = useTranslation();

	return (
		<div className="flex flex-col h-full w-full overflow-y-auto">
			<div className="max-w-4xl mx-auto w-full p-8 space-y-6">
				<div className="glass-card rounded-md p-6 border border-white/10">
					<div className="flex items-center gap-4">
						<div className="p-3 bg-white/5 border border-white/10 rounded-md">
							<Icon icon={LuInfo} size="lg" className="text-gray-400" />
						</div>
						<div>
							<h1 className="text-3xl font-bold text-white mb-1">{t("docs.title")}</h1>
							<p className="text-sm text-gray-400">{t("docs.subtitle")}</p>
						</div>
					</div>
				</div>

				<div className="glass-card rounded-md p-6 border border-cta-500/50 bg-cta-500/5">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-cta-500/10 rounded-md shrink-0">
							<Icon icon={LuTriangleAlert} size="lg" className="text-cta-400" />
						</div>
						<div className="flex-1 space-y-3">
							<h2 className="text-xl font-bold text-white flex items-center gap-2">{t("docs.important.title")}</h2>
							<div className="space-y-2 text-sm text-gray-300 leading-relaxed">
								<p>
									<strong className="text-cta-400">{t("docs.important.enableCharacters")}</strong>{" "}
									{t("docs.important.enableCharactersText")
										.split("Characters")
										.map((part, i) =>
											i === 0 ? (
												part
											) : (
												<>
													<strong key={i}>Characters</strong>
													{part}
												</>
											),
										)}
								</p>
								<p>
									<strong className="text-cta-400">{t("docs.important.followFormat")}</strong> {t("docs.important.followFormatText")}
								</p>
								<div className="bg-black/30 rounded-md p-4 font-mono text-xs border border-white/10">
									<span className="text-gray-400">{t("docs.important.formatLabel")}</span> <span className="text-cta-400">YourGuild-FamilyName</span> <span className="text-green-400">{t("logger.killed")}</span>/
									<span className="text-red-400">{t("logger.diedTo")}</span> <span className="text-blue-400">Enemy-FamilyName</span> {t("logger.from")} <span className="text-purple-400">Guild</span>
								</div>
								<p className="flex items-start gap-2">
									<Icon icon={LuCircleCheck} size="sm" className="text-green-400 shrink-0 mt-0.5" />
									<span>{t("docs.important.formatNote")}</span>
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-white flex items-center gap-3">
						<div className="p-2 bg-white/5 border border-white/10 rounded-md">
							<Icon icon={LuTriangleAlert} className="text-gray-400" />
						</div>
						{t("docs.troubleshooting.title")}
					</h2>

					<AccordionItem title={t("docs.troubleshooting.startupIssues.title")} defaultOpen={true}>
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
					</AccordionItem>

					<AccordionItem title={t("docs.troubleshooting.pathError.title")}>
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
					</AccordionItem>

					<AccordionItem title={t("docs.troubleshooting.noLogs.title")}>
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
					</AccordionItem>

					<AccordionItem title={t("docs.troubleshooting.wrongNames.title")}>
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
					</AccordionItem>

					<AccordionItem title={t("docs.troubleshooting.cantSave.title")}>
						<ol className="list-decimal list-inside space-y-2 ml-2">
							<li>{t("docs.troubleshooting.cantSave.step1")}</li>
							<li>{t("docs.troubleshooting.cantSave.step2")}</li>
							<li>{t("docs.troubleshooting.cantSave.step3")}</li>
						</ol>
					</AccordionItem>
				</div>

				<div className="space-y-4">
					<h2 className="text-2xl font-bold text-white flex items-center gap-3">
						<div className="p-2 bg-white/5 border border-white/10 rounded-md">
							<Icon icon={LuInfo} className="text-gray-400" />
						</div>
						{t("docs.faq.title")}
					</h2>

					<AccordionItem title={t("docs.faq.safe.title")}>
						<p>{t("docs.faq.safe.answer")}</p>
					</AccordionItem>

					<AccordionItem title={t("docs.faq.banned.title")}>
						<p>{t("docs.faq.banned.answer")}</p>
					</AccordionItem>

					<AccordionItem title={t("docs.faq.outdatedConfig.title")}>
						<p>{t("docs.faq.outdatedConfig.answer")}</p>
					</AccordionItem>

					<AccordionItem title={t("docs.faq.anyPvp.title")}>
						<p>{t("docs.faq.anyPvp.answer")}</p>
					</AccordionItem>

					<AccordionItem title={t("docs.faq.editLogs.title")}>
						<p>{t("docs.faq.editLogs.answer")}</p>
					</AccordionItem>

					<AccordionItem title={t("docs.faq.accidentalClose.title")}>
						<p>{t("docs.faq.accidentalClose.answer")}</p>
					</AccordionItem>
				</div>

				<div className="glass-card rounded-md p-6 border border-white/10">
					<div className="flex items-start gap-4">
						<div className="p-3 bg-white/5 border border-white/10 rounded-md shrink-0">
							<Icon icon={LuInfo} size="lg" className="text-gray-400" />
						</div>
						<div className="flex-1 space-y-3">
							<h3 className="text-xl font-bold text-white">{t("docs.help.title")}</h3>
							<p className="text-sm text-gray-300 leading-relaxed">{t("docs.help.description")}</p>
							<ul className="space-y-2 text-sm text-gray-300">
								<li className="flex items-start gap-2">
									<span className="text-gray-500">•</span>
									<span>
										<strong className="text-white">{t("docs.help.discord")}</strong> {t("docs.help.discordText")}{" "}
										<a href="https://discord.gg/CUc38nKyDU" className="text-cta-400 hover:text-cta-300 underline">
											discord.gg/CUc38nKyDU
										</a>
									</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-gray-500">•</span>
									<span>
										<strong className="text-white">{t("docs.help.github")}</strong> {t("docs.help.githubText")}{" "}
										<a href="https://github.com/Arkantik/Nodewar.gg-tool/issues" className="text-cta-400 hover:text-cta-300 underline">
											{t("docs.help.issuesPage")}
										</a>
									</span>
								</li>
							</ul>
							<div className="bg-black/30 rounded-md p-4 space-y-2 text-xs text-gray-400 border border-white/10">
								<p className="font-semibold text-white">{t("docs.help.whenAsking")}</p>
								<ul className="list-disc list-inside ml-2 space-y-1">
									<li>{t("docs.help.windowsVersion")}</li>
									<li>{t("docs.help.errorMessage")}</li>
									<li>{t("docs.help.whatDoing")}</li>
									<li>{t("docs.help.screenshots")}</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default DocsPage;
