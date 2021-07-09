var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import * as Chance from "chance";
const _Helpers = class {
  static genId() {
    return new Chance().natural({
      min: 1e4,
      max: _Helpers.MAX_ID
    });
  }
  static flipArray(source) {
    if (!source)
      return;
    const array = [...source];
    const result = [];
    if (array.length > 0) {
      const len = array[0].length;
      for (let i = 0; i < len; i++) {
        result[i] = [];
        for (const j of array) {
          result[i].push(j[i]);
        }
      }
    }
    return result;
  }
  static openUrl(url) {
    const tempwindow = window.open("", "_blank");
    if (tempwindow)
      tempwindow.location.href = url;
  }
};
export let Helpers = _Helpers;
__publicField(Helpers, "MAX_ID", Math.pow(2, 31));
