const DATE_LOCALE_OVERRIDES: Record<string, string> = { en: "en-GB" };

export function formatSessionDate(date: Date | string, language: string) {
	const d = typeof date === "string" ? new Date(date) : date;
	const locale = DATE_LOCALE_OVERRIDES[language] ?? language;
	return d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" }).replace(/,/g, "");
}
