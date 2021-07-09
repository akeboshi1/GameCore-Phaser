var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Pos, Position45 } from "structure";
export class ReferenceArea extends Phaser.GameObjects.Graphics {
  constructor(scene) {
    super(scene);
    __publicField(this, "mSize");
    __publicField(this, "mOrigin");
  }
  draw(area, origin, tileWidth, tileHeight) {
    this.clear();
    if (area.length === 0 || area[0].length === 0) {
      return;
    }
    let p1;
    let p2;
    let p3;
    let p4;
    const rows = area.length;
    const cols = area[0].length;
    this.mOrigin = origin;
    this.mSize = {
      rows,
      cols,
      tileWidth,
      tileHeight,
      sceneWidth: (rows + cols) * (tileWidth / 2),
      sceneHeight: (rows + cols) * (tileHeight / 2)
    };
    this.beginPath();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (area[y][x] === 0)
          continue;
        this.lineStyle(2, 0);
        p1 = Position45.transformTo90(new Pos(x, y), this.mSize);
        p2 = Position45.transformTo90(new Pos(x + 1, y), this.mSize);
        p3 = Position45.transformTo90(new Pos(x + 1, y + 1), this.mSize);
        p4 = Position45.transformTo90(new Pos(x, y + 1), this.mSize);
        this.beginPath();
        this.fillStyle(area[y][x] === 1 ? 65280 : 16711680);
        this.strokePoints([p1.toPoint(), p2.toPoint(), p3.toPoint(), p4.toPoint()], true, true);
        this.fillPath();
      }
    }
    this.setPosition(0, 0);
  }
  setPosition(x, y, z, w) {
    if (!this.mSize)
      return;
    const _x = x - (this.mOrigin.x - this.mOrigin.y) * (this.mSize.tileWidth >> 1);
    const _y = y - (this.mOrigin.x + this.mOrigin.y + 0.5) * (this.mSize.tileHeight >> 1);
    return super.setPosition(_x, _y, z, w);
  }
  get size() {
    return this.mSize;
  }
}
