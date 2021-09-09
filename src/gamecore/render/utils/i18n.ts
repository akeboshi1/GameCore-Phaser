import i18next, { InitOptions } from "i18next";
import { op_def } from "pixelpai_proto";
import i18nextXHRBackend from "i18next-xhr-backend";
import LanguageDetector from "i18next-browser-languagedetector";

export function initLocales(path: string, options?: InitOptions): Promise<any> {
  return i18next
    .use(i18nextXHRBackend)
    .use(LanguageDetector)
    .init(Object.assign({
      fallbackLng: {
        "en-US": ["en"],
        "zh": ["zh-CN"],
        "default": ["en"]
      },
      load: "currentOnly",
      backend: {
        loadPath: path,
        crossDomain: true
      },
    }, options));
}

export function translate(string: string, options?: any, namespaces?: string) {
  if (namespaces) string += `${namespaces}:`;
  return i18n.t(string, options);
}

export function translateProto(strMsg: op_def.IStrMsg, namespaces?: string) {
  if (!strMsg) return "";
  const { msg, i18nMsg, i18nData } = strMsg;
  if (msg) return msg;
  // 获取花括号内字段
  // const GET_WORD_REXGE = /[^{][a-zA-Z0-9_]+(?=\})/g;
  // 占位符字段
  // const GET_DATA_REXGE = /(?<=%{)([0-9A-Za-z_]*)(?=})/g;
  // // {{take}},{{reward}}%{number}{{secceed}}
  // // take,reward %{number} secceed
  // const allWords = i18nMsg.match(GET_WORD_REXGE) || [i18nMsg];
  // const dataWords = i18nMsg.match(GET_DATA_REXGE) || [];
  // let text = "";
  // let word = null;
  // for (let i = 0; i < allWords.length; i++) {
  //   word = allWords[i];
  //   text += dataWords.includes(word) ? `{{${word}}} ` : i === 0 ? `${word}` : ` $t(${word})`;
  // }
  let datas = null;
  if (i18nData) {
    datas = JSON.parse(i18nData);
    for (const key in datas) {
      const subData = datas[key];
      if (subData.i18n_msg) {
        datas[key] = translate(subData.i18n_msg, subData.i18n_data, namespaces);
      }
    }
  }
  return translate(i18nMsg, datas, namespaces);
}

export function addResources(ns: string, resources: any) {
  if (i18n.isInitialized) return;
  return i18n.addResources(i18n.languages[0], ns, resources);
}

export function addResourceBundle(lng: string, ns: string, resources: any, deep?: boolean, overwrite?: boolean) {
  return i18n.addResourceBundle(lng, ns, resources, deep, overwrite);
}

export function isZh() {
  const lng = i18n.languages[0];
  return lng.includes("zh");
}

export const i18n = i18next;
