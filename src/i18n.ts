import i18next from "i18next";
import i18nextXHRBackend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export function initLocales(path: string): Promise<any> {
  return i18next
    .use(i18nextXHRBackend)
    .use(LanguageDetector)
    .init({
      fallbackLng: "en",
      backend: {
        loadPath: path,
        crossDomain: true
      }
    });
}

export const i18n = i18next;
