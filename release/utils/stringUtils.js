export class StringUtils {
  static format(baseStr, params) {
    if (arguments.length === 0)
      return this;
    if (typeof params === "object") {
      for (const key in params)
        baseStr = baseStr.replace(new RegExp("\\{" + key + "\\}", "g"), params[key]);
      return baseStr;
    } else {
      for (let i = 0; i < params.length; i++)
        baseStr = baseStr.replace(new RegExp("\\{" + i + "\\}", "g"), params[i]);
      return baseStr;
    }
  }
  static isNullOrUndefined(text) {
    if (text === null || text === void 0)
      return true;
  }
}
