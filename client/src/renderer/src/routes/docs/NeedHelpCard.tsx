import { useTranslation } from "react-i18next";
import { LuInfo } from "react-icons/lu";
import Icon from "../../components/ui/Icon";

function NeedHelpCard() {
	const { t } = useTranslation();

	return (
		<div className="glass-card rounded-md p-6 border border-white/10">
			<div className="flex items-start gap-4">
				<div className="p-3 bg-white/5 border border-white/10 rounded-md shrink-0">
					<Icon icon={LuInfo} size="lg" className="text-gray-400" />
				</div>
				<div className="flex-1 space-y-3 max-w-3xl">
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
	);
}

export default NeedHelpCard;
