var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class GuideManager {
  constructor(render) {
    this.render = render;
    __publicField(this, "mGurGuide");
    __publicField(this, "guideMap");
    this.guideMap = new Map();
  }
  get curGuide() {
    return this.mGurGuide;
  }
  canInteractive(data) {
    if (!this.mGurGuide)
      return false;
    const boo = data ? this.mGurGuide.checkInteractive(data) : true;
    return boo;
  }
  init(data) {
  }
  destroy() {
    this.guideMap.forEach((guide) => {
      guide.destroy();
    });
    this.guideMap.clear();
    this.guideMap = null;
  }
  startGuide(guide) {
    this.mGurGuide = guide;
  }
  stopGuide() {
    this.mGurGuide = null;
  }
}
