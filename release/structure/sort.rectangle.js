var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { LogicPos } from "./logic.pos";
import { Position45 } from "./position45";
export class SortRectangle {
  constructor() {
    __publicField(this, "mLeft", new LogicPos());
    __publicField(this, "mRight", new LogicPos());
    __publicField(this, "mTop", new LogicPos());
    __publicField(this, "mBottom", new LogicPos());
  }
  setArea(val) {
    if (!val || val.length < 1 || val[0].length < 0)
      return;
    const width = val[0].length;
    const height = val.length;
    const position = { rows: width, cols: height, tileWidth: 30, tileHeight: 15, sceneWidth: (width + height) * (30 / 2), sceneHeight: (width + height) * (15 / 2) };
    this.mTop = Position45.transformTo90(new LogicPos(0, 0), position);
    this.mLeft = Position45.transformTo90(new LogicPos(0, val.length - 1), position).add(-15, 0);
    this.mRight = Position45.transformTo90(new LogicPos(val.length - 1, 0), position).add(15, 0);
    this.mBottom = Position45.transformTo90(new LogicPos(val[0].length - 1, val.length - 1), position).add(0, 7);
  }
  get left() {
    return this.mLeft;
  }
  get right() {
    return this.mRight;
  }
  get top() {
    return this.mTop;
  }
  get bottom() {
    return this.mBottom;
  }
}
