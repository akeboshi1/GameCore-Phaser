import { op_def } from "pixelpai_proto";
export declare function initLocales(path: string): Promise<any>;
export declare function translateConfig(msg: op_def.StrMsg, options?: any): string;
export declare function addResources(ns: string, resources: any): import("i18next").i18n;
export declare function addResourceBundle(lng: string, ns: string, resources: any): import("i18next").i18n;
export declare const i18n: import("i18next").i18n;
