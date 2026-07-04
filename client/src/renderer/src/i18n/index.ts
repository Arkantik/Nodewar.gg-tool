import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";

export const resources = {
	en: { translation: en },
	de: { translation: de },
	fr: { translation: fr },
	es: { translation: es },
};

const LANGUAGE_STORAGE_KEY = "app_language";
const SUPPORTED_LANGUAGES = ["en", "de", "fr", "es"];

const getInitialLanguage = async (): Promise<string> => {
	try {
		const storedLang = await window.api.config.get<string>(LANGUAGE_STORAGE_KEY);

		if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang)) {
			return storedLang;
		}
	} catch (e) {
		console.log("No stored language found, using browser default");
	}

	const browserLang = navigator.language.split("-")[0];
	if (SUPPORTED_LANGUAGES.includes(browserLang)) {
		return browserLang;
	}

	return "en";
};

i18n.use(initReactI18next).init({
	resources,
	lng: "en",
	fallbackLng: "en",
	interpolation: {
		escapeValue: false,
	},
});

getInitialLanguage().then(async (lang) => {
	if (lang !== i18n.language) {
		await i18n.changeLanguage(lang);
	}
});

i18n.on("languageChanged", async (lng) => {
	try {
		await window.api.config.set(LANGUAGE_STORAGE_KEY, lng);
	} catch (e) {
		console.error("Failed to save language preference:", e);
	}
});

export default i18n;
