import i18next from "i18next";
import { op_def } from "pixelpai_proto";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// 获取花括号内字段
const GET_WORD_REXGE = /[^{][a-zA-Z0-9_]+(?=\})/g;
// 占位符字段
const GET_DATA_REXGE = /(?<=%{)([0-9A-Za-z_]*)(?=})/g;

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

export function ttranslate(string: string, options?: any, namespaces?: string) {
  if (namespaces) string += `${namespaces}:`;
  return i18n.t(string, options);
}

export function translateProto(strMsg: op_def.IStrMsg, namespaces?: string) {
  const { msg, i18nMsg, i18nData } = strMsg;
  if (msg) return msg;
  // {{take}},{{reward}}%{number}{{secceed}}
  // take,reward %{number} secceed
  const allWords = i18nMsg.match(GET_WORD_REXGE) || [i18nMsg];
  const dataWords = i18nMsg.match(GET_DATA_REXGE) || [];
  let text = "";
  let word = null;
  for (let i = 0; i < allWords.length; i++) {
    word = allWords[i];
    text += dataWords.includes(word) ? `{{${word}}} ` : i === 0 ? `${word}` : ` $t(${word})`;
  }

  return i18n.t(text, i18nData, namespaces);
}

export function addResources(ns: string, resources: any) {
  if (i18n.isInitialized) return;
  return i18n.addResources(i18n.languages[0], ns, resources);
}

export function addResourceBundle(lng: string, ns: string, resources: any, deep?: boolean, overwrite?: boolean) {
  return i18n.addResourceBundle(lng, ns, resources, deep, overwrite);
}

export const i18n = i18next;
