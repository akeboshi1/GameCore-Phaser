var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export const notice_url = `https://a.tooqing.com/picatown/announcement`;
const HTTP_REGEX = /^(http|https):/i;
const _ConfigPath = class {
  static getConfigPath() {
    return `${_ConfigPath.ROOT_PATH}game/resource/5e719a0a68196e416ecf7aad/.config.json`;
  }
  static getBasePath() {
    return `${_ConfigPath.ROOT_PATH}game/resource/5e719a0a68196e416ecf7aad/`;
  }
  static getBaseVersionPath() {
    if (this.version === "")
      return void 0;
    return this.getBasePath() + this.version + "/";
  }
  static getSceneConfigUrl(url) {
    if (HTTP_REGEX.test(url)) {
      return url;
    }
    return `${this.ROOT_PATH}${url}`;
  }
};
export let ConfigPath = _ConfigPath;
__publicField(ConfigPath, "ROOT_PATH", "/");
__publicField(ConfigPath, "version", "");
