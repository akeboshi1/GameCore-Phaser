var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class Url {
  constructor() {
    __publicField(this, "OSD_PATH", "");
    __publicField(this, "RES_PATH", "");
    __publicField(this, "RESUI_PATH", "");
    __publicField(this, "RESOURCE_ROOT", "");
  }
  init(config) {
    this.OSD_PATH = config.osd;
    this.RES_PATH = config.res;
    this.RESUI_PATH = config.resUI;
  }
  getRes(value) {
    return this.RES_PATH + value;
  }
  getUIRes(dpr, value) {
    return this.RESUI_PATH + `${dpr}x/${value}`;
  }
  getSound(key) {
    return "sound/" + key + ".mp3";
  }
  getNormalUIRes(value) {
    return this.RESUI_PATH + value;
  }
  getOsdRes(value) {
    if (!value) {
      console.warn("splicing url failed");
      return;
    }
    if (this.OSD_PATH) {
      return this.OSD_PATH + value;
    }
    return value;
  }
  getPartName(value) {
    return value + "_png";
  }
  getPartUrl(value) {
    return this.OSD_PATH + "avatar/part/" + value + ".png";
  }
  getUsrAvatarTextureUrls(value) {
    return {
      img: this.OSD_PATH + "user_avatar/texture/" + value + ".png",
      json: this.OSD_PATH + "user_avatar/texture/" + value + ".json"
    };
  }
  getResRoot(value) {
    if (this.OSD_PATH)
      return this.OSD_PATH + "/" + value;
    return value;
  }
}
