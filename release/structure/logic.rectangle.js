var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class LogicRectangle {
  constructor(x, y, width, height) {
    __publicField(this, "x", 0);
    __publicField(this, "y", 0);
    __publicField(this, "width", 0);
    __publicField(this, "height", 0);
    if (x === void 0) {
      x = 0;
    }
    if (y === void 0) {
      y = 0;
    }
    if (width === void 0) {
      width = 0;
    }
    if (height === void 0) {
      height = 0;
    }
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  get left() {
    return this.x;
  }
  set left(value) {
    if (value >= this.right) {
      this.width = 0;
    } else {
      this.width = this.right - value;
    }
    this.x = value;
  }
  get right() {
    return this.x + this.width;
  }
  set right(value) {
    if (value <= this.x) {
      this.width = 0;
    } else {
      this.width = value - this.x;
    }
  }
  get top() {
    return this.y;
  }
  set top(value) {
    if (value >= this.bottom) {
      this.height = 0;
    } else {
      this.height = this.bottom - value;
    }
    this.y = value;
  }
  get bottom() {
    return this.y + this.height;
  }
  set bottom(value) {
    if (value <= this.y) {
      this.height = 0;
    } else {
      this.height = value - this.y;
    }
  }
  contains(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }
    return this.x <= x && this.x + this.width >= x && this.y <= y && this.y + this.height >= y;
  }
}
