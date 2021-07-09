var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger, SceneName } from "structure";
export class MatterBodies {
  constructor(render) {
    this.render = render;
    __publicField(this, "mGraphics");
    const scene = this.render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
    if (!scene) {
      Logger.getInstance().error("no matter scene");
      return;
    }
    this.mGraphics = scene.make.graphics(void 0, false);
    scene.layerManager.addToLayer("middleLayer", this.mGraphics);
  }
  update() {
    if (this.mGraphics)
      this.mGraphics.clear();
  }
  renderWireframes(bodies) {
    const graphics = this.mGraphics;
    if (!graphics)
      return;
    graphics.clear();
    if (!bodies)
      return;
    graphics.lineStyle(1, 16711680);
    graphics.beginPath();
    const dpr = this.render.scaleRatio;
    for (const bodie of bodies) {
      const { points, pos, offset } = bodie;
      graphics.moveTo(points[0].x + pos.x + offset.x, points[0].y + pos.y + offset.y);
      for (let j = 1; j < points.length; j++) {
        graphics.lineTo(points[j].x + pos.x + offset.x, points[j].y + pos.y + offset.y);
      }
      graphics.lineTo(points[0].x + pos.x + offset.x, points[0].y + pos.y + offset.y);
    }
    graphics.strokePath();
  }
  destroy() {
    if (this.mGraphics) {
      this.mGraphics.destroy();
    }
  }
}
