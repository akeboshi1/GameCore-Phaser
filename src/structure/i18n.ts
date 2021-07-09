import i18next from "i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export function initLocales(path: string): Promise<any> {
  return i18next
    .use(HttpApi)
    .use(LanguageDetector)
    .init({
      fallbackLng: "zh-CN",
      load: "currentOnly",
      backend: {
        loadPath: path,
        crossDomain: true
      }
    });
}

export function addResources(ns: string, resources: any) {
  if (i18n.isInitialized) return;
  return i18n.addResources(i18n.languages[0], ns, resources);
}

export function addResourceBundle(lng: string, ns: string, resources: any) {
  return i18n.addResourceBundle(lng, ns, resources);
}

export const i18n = i18next;
