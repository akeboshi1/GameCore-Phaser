var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseLayer } from "baseRender";
import { Font, SceneName } from "structure";
import { RoomScene } from "./room.scene";
const _MainUIScene = class extends RoomScene {
  constructor() {
    super({ key: SceneName.MAINUI_SCENE });
    __publicField(this, "timeOutID", 0);
    __publicField(this, "timeOutCancelMap", {});
    __publicField(this, "timeOutCallerList", []);
    __publicField(this, "timeOutTimeMap", {});
    __publicField(this, "fps");
  }
  init(data) {
    super.init(data);
    if (this.render) {
      this.render.uiManager.setScene(null);
    }
  }
  create() {
    const width = this.cameras.main.width;
    this.fps = this.add.text(width - 6 * this.render.devicePixelRatio, 10, "", { color: "#00FF00" });
    this.fps.setStroke("#000000", 1);
    this.fps.setFontFamily(Font.DEFULT_FONT);
    this.fps.setFontSize(13 * this.render.devicePixelRatio);
    this.fps.setDepth(1e3);
    this.fps.setOrigin(1, 0);
    this.render.uiManager.setScene(this);
    this.render.initUI();
    this.layerManager.addLayer(this, BaseLayer, _MainUIScene.LAYER_UI, 1);
    this.layerManager.addLayer(this, BaseLayer, _MainUIScene.LAYER_DIALOG, 2);
    this.layerManager.addLayer(this, BaseLayer, _MainUIScene.LAYER_TOOLTIPS, 3);
    this.layerManager.addLayer(this, BaseLayer, _MainUIScene.LAYER_MASK, 4);
    super.create();
  }
  setTimeout(caller, time) {
    const begin = Date.now();
    this.timeOutCallerList[++this.timeOutID] = caller;
    this.timeOutTimeMap[this.timeOutID] = { now: begin, delay: time };
    return this.timeOutID;
  }
  clearTimeout(id) {
    this.timeOutCancelMap[id] = true;
  }
  updateFPS() {
    if (this.fps)
      this.fps.setText(this.game.loop.actualFps.toFixed());
  }
  getKey() {
    return this.sys.config.key;
  }
  onPointerDownHandler(pointer, currentlyOver) {
    this.render.emitter.emit("pointerScene", SceneName.MAINUI_SCENE, currentlyOver);
  }
  loadVideos() {
  }
  checkSize(size) {
    const width = size.width;
    const height = size.height;
    const world = this.render;
  }
};
export let MainUIScene = _MainUIScene;
__publicField(MainUIScene, "LAYER_UI", "uiLayer");
__publicField(MainUIScene, "LAYER_DIALOG", "dialogLayer");
__publicField(MainUIScene, "LAYER_TOOLTIPS", "toolTipsLayer");
__publicField(MainUIScene, "LAYER_MASK", "maskLayer");
