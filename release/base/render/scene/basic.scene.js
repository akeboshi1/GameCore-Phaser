var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { StringUtils } from "utils";
import { LayerManager } from "../layer";
export class BasicScene extends Phaser.Scene {
  constructor(config) {
    super(config);
    __publicField(this, "layerManager");
    __publicField(this, "initialize", false);
    __publicField(this, "hasChangeScene", false);
    __publicField(this, "hasDestroy", false);
    __publicField(this, "render");
    this.layerManager = new LayerManager();
  }
  init(data) {
    if (data) {
      this.render = data.render;
    }
  }
  preload() {
    const str = StringUtils.format("\u6B63\u5728\u52A0\u8F7D\u8D44\u6E90 {0}", ["0%"]);
    if (this.render)
      this.render.showLoading({ "text": str });
  }
  setScale(zoom) {
    if (this.layerManager)
      this.layerManager.setScale(zoom);
  }
  updateProgress(data) {
  }
  loadProgress(data) {
  }
  create() {
    this.initialize = true;
    this.render.emitter.emit("sceneCreated");
    this.events.on("shutdown", this.destroy, this);
  }
  destroy() {
    this.events.off("shutdown", this.destroy, this);
    this.hasDestroy = true;
    this.initialize = false;
    this.hasChangeScene = false;
  }
  sceneInitialize() {
    return this.initialize;
  }
  sceneDestroy() {
    return this.hasDestroy;
  }
  get sceneChange() {
    return this.hasChangeScene;
  }
  set sceneChange(boo) {
    this.hasChangeScene = boo;
  }
  setViewPort(x, y, width, height) {
    this.cameras.main.setViewport(x, y, width, height);
  }
  wake(data) {
    this.scene.wake(void 0, data);
  }
  sleep() {
    this.scene.sleep();
  }
  stop() {
    this.scene.stop();
  }
}
