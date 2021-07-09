var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Grid, AStarFinder } from "pathfinding";
import { Logger } from "./log";
import { LogicPos } from "./logic.pos";
import { Position45 } from "./position45";
export class AStar {
  constructor(sizeChart) {
    this.sizeChart = sizeChart;
    __publicField(this, "grid");
    __publicField(this, "finder");
    __publicField(this, "gridBackup");
  }
  init(matrix) {
    if (this.finder) {
      this.reset(matrix);
    } else {
      this.grid = new Grid(matrix);
      this.finder = new AStarFinder({
        allowDiagonal: true,
        dontCrossCorners: true
      });
    }
  }
  reset(matrix) {
    this.grid = new Grid(matrix);
  }
  setWalkableAt(x, y, value) {
    if (!this.grid) {
      return;
    }
    this.grid.setWalkableAt(x, y, value);
  }
  isWalkableAt(x, y) {
    if (!this.grid) {
      return false;
    }
    return this.grid.isWalkableAt(x, y);
  }
  find(startPos, targetList, toReverse) {
    if (!this.finder) {
      Logger.getInstance().error(`finder not exist`);
      return;
    }
    if (!this.grid) {
      Logger.getInstance().error(`can't find path. grid not exist`);
      return;
    }
    const result = [];
    const miniSize = this.sizeChart.miniSize;
    const { rows, cols } = miniSize;
    const start45 = Position45.transformTo45(startPos, miniSize);
    if (this._invalidPoint(start45, cols, rows))
      return result;
    const end45List = [];
    targetList.forEach((p) => {
      p = Position45.transformTo45(p, miniSize);
      if (!this._invalidPoint(p, cols, rows)) {
        end45List.push(p);
      }
    });
    if (end45List.length === 0) {
      return result;
    }
    this.gridBackup = this.grid.clone();
    const paths = this.finder.findPathToMultipleEnds(start45.x, start45.y, end45List, this.gridBackup, toReverse);
    for (const path of paths) {
      const point = Position45.transformTo90(new LogicPos(path[0], path[1]), miniSize);
      point.y += miniSize.tileHeight / 2;
      result.push(point);
    }
    if (toReverse === false) {
      result.shift();
    }
    return result;
  }
  _invalidPoint(position, cols, rows) {
    return position.x < 0 || position.x >= cols || position.y < 0 || position.y >= rows || !this.isWalkableAt(position.x, position.y);
  }
}
