var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PlayCamera } from "../cameras";
import { BasicScene } from "./basic.scene";
export class SkyBoxScene extends BasicScene {
  constructor() {
    super({});
    __publicField(this, "skyBoxManager");
  }
  init(data) {
    super.init(data);
    if (data) {
      this.skyBoxManager = data;
    }
  }
  preload() {
  }
  create() {
    const oldCamera = this.cameras.main;
    this.cameras.addExisting(new PlayCamera(0, 0, this.sys.scale.width, this.sys.scale.height, this.skyBoxManager.scaleRatio), true);
    this.cameras.remove(oldCamera);
    this.skyBoxManager.startPlay(this);
  }
  update(time, delta) {
    this.skyBoxManager.check(time, delta);
  }
}
