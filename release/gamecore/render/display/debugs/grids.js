var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { LogicPos, Position45 } from "structure";
import { BasicScene } from "baseRender";
export class GridsDebugger {
  constructor(render) {
    this.render = render;
    __publicField(this, "isDebug", false);
    __publicField(this, "mGraphic");
    __publicField(this, "mRoomSize");
  }
  destroy() {
    if (this.mGraphic)
      this.mGraphic.destroy();
    this.mRoomSize = null;
  }
  setData(posObj) {
    this.mRoomSize = posObj;
    if (this.isDebug) {
      this.show();
    } else {
      this.hide();
    }
  }
  show() {
    if (!this.mRoomSize)
      return;
    const scene = this.render.sceneManager.getMainScene();
    if (!scene || !(scene instanceof BasicScene)) {
      return;
    }
    if (this.mGraphic)
      this.mGraphic.destroy();
    this.mGraphic = scene.make.graphics(void 0, false);
    this.mGraphic.clear();
    this.mGraphic.lineStyle(1, 65280);
    this.mGraphic.beginPath();
    for (let i = 0; i <= this.mRoomSize.rows; i++) {
      this.drawLine(this.mRoomSize, this.mGraphic, 0, i, this.mRoomSize.cols, i);
    }
    for (let i = 0; i <= this.mRoomSize.cols; i++) {
      this.drawLine(this.mRoomSize, this.mGraphic, i, 0, i, this.mRoomSize.rows);
    }
    this.mGraphic.closePath();
    this.mGraphic.strokePath();
    scene.layerManager.addToLayer("middleLayer", this.mGraphic);
  }
  hide() {
    if (this.mGraphic)
      this.mGraphic.destroy();
  }
  q() {
    this.isDebug = false;
    this.hide();
  }
  v() {
    if (!this.isDebug) {
      this.show();
    }
    this.isDebug = true;
  }
  drawLine(posObj, graphics, startX, endX, startY, endY) {
    let point = new LogicPos(startX, endX);
    point = Position45.transformTo90(point, posObj);
    graphics.moveTo(point.x, point.y);
    point = new LogicPos(startY, endY);
    point = Position45.transformTo90(point, posObj);
    graphics.lineTo(point.x, point.y);
  }
}
