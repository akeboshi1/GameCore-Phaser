var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class LogicPoint {
  constructor(x, y) {
    __publicField(this, "x");
    __publicField(this, "y");
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = x;
    }
    this.x = x;
    this.y = y;
  }
  setTo(x, y) {
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = x;
    }
    this.x = x;
    this.y = y;
    return this;
  }
}
