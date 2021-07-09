var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BasicScene } from "baseRender";
import { Size, SceneName } from "structure";
export class GamePauseScene extends BasicScene {
  constructor() {
    super({ key: SceneName.GAMEPAUSE_SCENE });
    __publicField(this, "bg");
    __publicField(this, "tipTF");
  }
  preload() {
  }
  create() {
    super.create();
    const width = this.scale.gameSize.width;
    const height = this.scale.gameSize.height;
    this.bg = this.add.graphics();
    this.bg.fillStyle(0, 0.8);
    this.bg.fillRect(0, 0, width, height);
    this.tipTF = this.add.text(width - 240 >> 1, height - 50, "\u70B9\u51FB\u4EFB\u610F\u4F4D\u7F6E\u5F00\u59CB\u6E38\u620F", { font: "30px Tahoma" });
    this.scale.on("resize", this.checkSize, this);
    this.checkSize(new Size(width, height));
    this.input.on("pointerdown", this.downHandler, this);
  }
  awake() {
    this.scale.on("resize", this.checkSize, this);
    this.input.on("pointerdown", this.downHandler, this);
    this.scene.wake();
  }
  sleep() {
    this.scale.off("resize", this.checkSize, this);
    this.input.off("pointerdown", this.downHandler, this);
    this.scene.sleep();
  }
  getKey() {
    return this.sys.config.key;
  }
  downHandler() {
    this.render.onFocus();
  }
  checkSize(size) {
    const width = size.width;
    const height = size.height;
    this.bg.clear();
    this.bg.fillStyle(0, 0.8);
    this.bg.fillRect(0, 0, width, height);
    this.tipTF.scaleX = this.tipTF.scaleY = this.render.uiScale;
    this.tipTF.x = width - 280 * this.render.uiScale >> 1;
    this.tipTF.y = height - 50 * this.render.uiScale;
  }
}
