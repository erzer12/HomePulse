import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import hi from "./hi.json";

if (!i18n.isInitialized) {
	void i18n.use(initReactI18next).init({
		compatibilityJSON: "v4",
		resources: { en: { translation: en }, hi: { translation: hi } },
		lng: "en",
		fallbackLng: "en",
		interpolation: { escapeValue: false },
	});
}

export default i18n;
