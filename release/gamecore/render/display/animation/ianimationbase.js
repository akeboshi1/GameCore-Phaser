var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class AnimationUrlData {
  constructor() {
    __publicField(this, "resName");
    __publicField(this, "resUrl");
    __publicField(this, "pngUrl");
    __publicField(this, "jsonUrl");
    __publicField(this, "boneUrl");
    __publicField(this, "responseType");
    __publicField(this, "textureXhrSettings");
    __publicField(this, "atlasXhrSettings");
    __publicField(this, "boneXhrSettings");
  }
  setData(resName, textureUrl, jsonUrl, boneUrl, extension = ".json") {
    this.resName = resName;
    this.pngUrl = textureUrl;
    this.jsonUrl = jsonUrl;
    this.boneUrl = boneUrl;
    this.responseType = extension === ".dbbin" ? "arraybuffer" : null;
    this.boneXhrSettings = this.responseType ? { responseType: "arraybuffer" } : null;
  }
  setDisplayData(pngUrl, jsonUrl, extension = ".json") {
    this.pngUrl = pngUrl;
    this.jsonUrl = jsonUrl;
    this.responseType = extension === ".dbbin" ? "arraybuffer" : null;
    this.boneXhrSettings = this.responseType ? { responseType: "arraybuffer" } : null;
  }
  dispose() {
    this.textureXhrSettings = null;
    this.atlasXhrSettings = null;
    this.boneXhrSettings = null;
  }
}
