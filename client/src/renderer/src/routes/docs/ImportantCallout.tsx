import { useTranslation } from "react-i18next";
import { LuCircleCheck, LuTriangleAlert } from "react-icons/lu";
import Icon from "../../components/ui/Icon";

function ImportantCallout() {
	const { t } = useTranslation();

	return (
		<div className="glass-card rounded-md p-6 border border-cta-500/50 bg-cta-500/5">
			<div className="flex items-start gap-4">
				<div className="p-3 bg-cta-500/10 rounded-md shrink-0">
					<Icon icon={LuTriangleAlert} size="lg" className="text-cta-400" />
				</div>
				<div className="flex-1 space-y-3 max-w-3xl">
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
	);
}

export default ImportantCallout;
