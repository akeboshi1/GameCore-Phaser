var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SceneName } from "structure";
import { GuideEffect } from "./guide.effect";
export class BaseGuide {
  constructor(render) {
    this.render = render;
    __publicField(this, "id");
    __publicField(this, "guideID");
    __publicField(this, "guideEffect");
    __publicField(this, "scene");
    __publicField(this, "uiManager");
    __publicField(this, "mData");
    __publicField(this, "mIsShow", false);
    this.scene = render.sceneManager.getSceneByName(SceneName.MAINUI_SCENE);
    this.uiManager = render.uiManager;
  }
  get data() {
    return this.mData;
  }
  show(data) {
    this.mIsShow = true;
    this.mData = data;
    this.id = data.id;
    this.guideID = data.guideID;
    if (!this.guideEffect)
      this.guideEffect = new GuideEffect(this.scene, this.render.uiRatio, this.render.url);
    this.render.guideManager.startGuide(this);
  }
  end() {
    this.hide();
  }
  hide() {
    this.mIsShow = false;
    this.render.guideManager.stopGuide();
    if (this.guideEffect) {
      this.guideEffect.destroy();
      this.guideEffect = null;
    }
    this.render.uiManager.closePanel(this.id);
  }
  checkInteractive(data) {
    return true;
  }
  destroy() {
    this.hide();
  }
  resize() {
  }
  isShow() {
    return this.mIsShow;
  }
  addExportListener(f) {
  }
}
