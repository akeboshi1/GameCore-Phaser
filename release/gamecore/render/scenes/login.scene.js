var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SceneName } from "structure";
import { BaseLayer, BasicScene } from "baseRender";
import { MainUIScene } from "./main.ui.scene";
export class LoginScene extends BasicScene {
  constructor() {
    super({ key: SceneName.LOGIN_SCENE });
    __publicField(this, "dpr");
  }
  preload() {
  }
  create() {
    super.create();
    if (this.render) {
      this.render.gameLoadedCallBack();
      this.render.hideLoading();
      this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_UI, 1);
      this.layerManager.addLayer(this, BaseLayer, MainUIScene.LAYER_DIALOG, 2);
    }
  }
  init(data) {
    super.init(data);
    if (data) {
      this.dpr = data.dpr;
    }
  }
  stop() {
    super.stop();
  }
  sleep() {
  }
}
