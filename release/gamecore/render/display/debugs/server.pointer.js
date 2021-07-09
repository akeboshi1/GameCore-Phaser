var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { SceneName } from "structure";
export class ServerPosition {
  constructor(render) {
    __publicField(this, "mGridhics");
    __publicField(this, "dpr");
    const scene = render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
    this.dpr = render.scaleRatio;
    this.mGridhics = scene.make.graphics(void 0, false);
    scene.layerManager.addToLayer("middleLayer", this.mGridhics);
  }
  draw(x, y) {
    this.mGridhics.clear();
    this.mGridhics.fillStyle(65280, 1);
    this.mGridhics.fillCircle(x, y, 2 * this.dpr);
  }
  destroy() {
    if (this.mGridhics)
      this.mGridhics.destroy();
  }
}
