var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BasicScene } from "baseRender";
import { Logger, LogicPos } from "structure";
const _SortDebugger = class {
  constructor(render) {
    this.render = render;
    __publicField(this, "isDebug", false);
    __publicField(this, "RECT_COLOR", 65280);
    __publicField(this, "mData");
    __publicField(this, "mGraphics");
    _SortDebugger._instance = this;
    this.mData = new Map();
    this.mGraphics = new Map();
  }
  static getInstance() {
    if (!_SortDebugger._instance) {
      Logger.getInstance().error("SortDebugger not created");
    }
    return _SortDebugger._instance;
  }
  q() {
    this.isDebug = false;
    this.clear();
  }
  v() {
    if (!this.isDebug) {
      this.redraw();
    }
    this.isDebug = true;
  }
  clear() {
    this.mGraphics.forEach((graphics) => {
      graphics.destroy();
    });
    this.mGraphics.clear();
  }
  addDisplayObject(id, x, y, w, h) {
    const rect = new Rect(x, y, w, h);
    this.mData.set(id, rect);
    if (!this.isDebug)
      return;
    const scene = this.render.sceneManager.getMainScene();
    if (!scene || !(scene instanceof BasicScene)) {
      return;
    }
    this.render.mainPeer.getCurrentRoomSize().then((size) => {
      if (this.mGraphics.get(id)) {
        this.mGraphics.get(id).destroy();
      }
      this.mGraphics.set(id, this.drawObj(scene, this.RECT_COLOR, rect, size));
    });
  }
  redraw() {
    this.clear();
    const scene = this.render.sceneManager.getMainScene();
    if (!scene || !(scene instanceof BasicScene)) {
      return;
    }
    this.render.mainPeer.getCurrentRoomSize().then((size) => {
      this.mData.forEach((rect, id) => {
        this.mGraphics.set(id, this.drawObj(scene, this.RECT_COLOR, rect, size));
      });
    });
  }
  drawObj(scene, color, rect, posObj) {
    Logger.getInstance().debug("#sort drawRect: ", rect);
    const pos1 = new LogicPos(rect.x, rect.y);
    const pos2 = new LogicPos(rect.x + rect.w, rect.y);
    const pos3 = new LogicPos(rect.x + rect.w, rect.y + rect.h);
    const pos4 = new LogicPos(rect.x, rect.y + rect.h);
    const graphics = scene.make.graphics(void 0, false);
    graphics.lineStyle(1, color);
    graphics.fillStyle(color, 1);
    graphics.moveTo(pos1.x, pos1.y);
    graphics.lineTo(pos2.x, pos2.y);
    graphics.lineTo(pos3.x, pos3.y);
    graphics.lineTo(pos4.x, pos4.y);
    graphics.lineTo(pos1.x, pos1.y);
    graphics.fillPath();
    scene.layerManager.addToLayer("middleLayer", graphics);
    return graphics;
  }
};
export let SortDebugger = _SortDebugger;
__publicField(SortDebugger, "_instance");
class Rect {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}
