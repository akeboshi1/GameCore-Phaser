var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class Pos {
  constructor(x, y, z, depth) {
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    __publicField(this, "depth");
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.depth = depth | 0;
  }
  add(x, y, z) {
    this.x += x;
    this.x += y;
    this.z += z ? z : 0;
    return this;
  }
  equal(p) {
    return p.x === this.x && p.y === this.y && p.z === this.z && p.depth === this.depth;
  }
  toString() {
    return `Pos >> x: ${this.x}, y: ${this.y}, z: ${this.z}, depth: ${this.depth}`;
  }
  toPoint() {
    return new Pos(this.x, this.y);
  }
}
