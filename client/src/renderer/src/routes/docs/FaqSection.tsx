import { useTranslation } from "react-i18next";
import { LuInfo } from "react-icons/lu";
import Icon from "../../components/ui/Icon";
import { FAQ_IDS } from "./ids";

function FaqItem({ id, question, answer }: { id: string; question: string; answer: string }) {
	return (
		<div id={id} className="glass-card rounded-md border border-white/10 p-5 scroll-mt-4">
			<h3 className="text-sm font-semibold text-white mb-2">{question}</h3>
			<p className="text-sm text-gray-300 leading-relaxed">{answer}</p>
		</div>
	);
}

function FaqSection() {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-bold text-white flex items-center gap-3">
				<div className="p-2 bg-white/5 border border-white/10 rounded-md">
					<Icon icon={LuInfo} className="text-gray-400" />
				</div>
				{t("docs.faq.title")}
			</h2>

			<FaqItem id={FAQ_IDS.safe} question={t("docs.faq.safe.title")} answer={t("docs.faq.safe.answer")} />
			<FaqItem id={FAQ_IDS.banned} question={t("docs.faq.banned.title")} answer={t("docs.faq.banned.answer")} />
			<FaqItem id={FAQ_IDS.outdatedConfig} question={t("docs.faq.outdatedConfig.title")} answer={t("docs.faq.outdatedConfig.answer")} />
			<FaqItem id={FAQ_IDS.anyPvp} question={t("docs.faq.anyPvp.title")} answer={t("docs.faq.anyPvp.answer")} />
			<FaqItem id={FAQ_IDS.editLogs} question={t("docs.faq.editLogs.title")} answer={t("docs.faq.editLogs.answer")} />
			<FaqItem id={FAQ_IDS.accidentalClose} question={t("docs.faq.accidentalClose.title")} answer={t("docs.faq.accidentalClose.answer")} />
		</div>
	);
}

export default FaqSection;
