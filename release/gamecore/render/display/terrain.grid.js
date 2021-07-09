var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { LayerName, LogicPos, Position45 } from "structure";
export class TerrainGrid {
  constructor(render, miniSize) {
    this.render = render;
    this.miniSize = miniSize;
    __publicField(this, "graphics");
    __publicField(this, "dirty", false);
    __publicField(this, "map");
    __publicField(this, "deltaTime", 500);
    __publicField(this, "curDelta", 0);
  }
  setMap(map) {
    this.map = map;
    this.dirty = true;
  }
  update(time, delta) {
    this.curDelta += delta;
    if (this.curDelta >= this.deltaTime) {
      if (this.dirty) {
        this.dirty = false;
        this.drawGrid();
      }
    }
  }
  destroy() {
    if (this.graphics) {
      this.graphics.destroy();
      this.graphics = void 0;
    }
    this.dirty = false;
    this.map = null;
  }
  drawGrid() {
    if (!this.map) {
      return;
    }
    if (!this.graphics) {
      const scene = this.render.sceneManager.getMainScene();
      if (!scene) {
        return;
      }
      this.graphics = scene.make.graphics(void 0, false);
      scene.layerManager.addToLayer(LayerName.MIDDLE, this.graphics);
    }
    this.graphics.clear();
    this.graphics.lineStyle(1, 16777215, 0.5);
    const cols = this.map[0].length;
    const rows = this.map.length;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (this.map[i][j] !== -1) {
          this.draw(j, i);
        }
      }
    }
    this.graphics.strokePath();
  }
  draw(x, y) {
    const pos = Position45.transformTo90({ x, y }, this.miniSize);
    this.graphics.moveTo(pos.x, pos.y);
    this.graphics.lineTo(pos.x + this.miniSize.tileWidth * 0.5, pos.y + this.miniSize.tileHeight * 0.5);
    this.graphics.lineTo(pos.x, pos.y + this.miniSize.tileHeight);
    this.graphics.lineTo(pos.x - this.miniSize.tileWidth * 0.5, pos.y + this.miniSize.tileHeight * 0.5);
    this.graphics.closePath();
  }
  drawLine(graphics, startX, endX, startY, endY, size) {
    let point = new LogicPos(startX, endX);
    point = Position45.transformTo90(point, size);
    graphics.moveTo(point.x, point.y);
    point = new LogicPos(startY, endY);
    point = Position45.transformTo90(point, size);
    graphics.lineTo(point.x, point.y);
  }
}
