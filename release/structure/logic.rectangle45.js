var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { LogicRectangle } from "./logic.rectangle";
export class LogicRectangle45 extends LogicRectangle {
  constructor(row, col, endRow, endCol) {
    super(row, col, endRow, endCol);
    __publicField(this, "row", 0);
    __publicField(this, "col", 0);
    __publicField(this, "endRow", 0);
    __publicField(this, "endCol", 0);
    this.row = row;
    this.col = col;
    this.endRow = endRow;
    this.endCol = endCol;
  }
}
