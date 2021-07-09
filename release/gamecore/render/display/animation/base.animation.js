var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class BaseAnimation extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene);
    __publicField(this, "resName");
    __publicField(this, "textureUrl");
    __publicField(this, "animUrlData");
    __publicField(this, "loaded", false);
    __publicField(this, "isPlaying", false);
    __publicField(this, "loop", false);
    __publicField(this, "curAniName");
  }
  load(resName, textureUrl, jsonUrl) {
    this.clear();
    this.resName = resName ? resName : textureUrl;
    this.curAniName = resName;
    this.textureUrl = textureUrl;
  }
  play(aniName) {
    if (aniName)
      this.curAniName = aniName;
    this.isPlaying = true;
  }
  clear() {
    if (this.animUrlData)
      this.animUrlData.dispose();
    this.animUrlData = void 0;
    this.curAniName = void 0;
    this.isPlaying = false;
    this.loaded = false;
    this.loop = false;
  }
  destroy() {
    this.clear();
    super.destroy();
  }
  onLoadComplete(loader, totalComplete, totalFailed) {
  }
}
