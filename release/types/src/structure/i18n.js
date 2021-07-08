import i18next from "i18next";
import i18nextXHRBackend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";
export function initLocales(path) {
    return i18next
        .use(i18nextXHRBackend)
        .use(LanguageDetector)
        .init({
        fallbackLng: "zh-CN",
        backend: {
            loadPath: path,
            crossDomain: true
        }
    });
}
export var i18n = i18next;
//# sourceMappingURL=i18n.js.map