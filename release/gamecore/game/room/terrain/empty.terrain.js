var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BlockObject } from "../block/block.object";
export class EmptyTerrain extends BlockObject {
  constructor(room, pos, i, j) {
    super(i * room.roomSize.rows + j + 1e4, room);
    this.pos = pos;
    __publicField(this, "dirty", false);
    this.setPosition(pos);
  }
  setPosition(pos) {
    if (this.moveControll) {
      this.moveControll.setPosition(pos);
    }
  }
  getPosition() {
    return this.pos;
  }
  addDisplay() {
    this.drawBody();
    return Promise.resolve();
  }
  removeDisplay() {
    this.removeBody();
    return Promise.resolve();
  }
  destroy() {
    this.removeBody();
  }
  drawBody() {
    const roomSize = this.mRoomService.roomSize;
    const height = roomSize.tileHeight;
    const width = roomSize.tileWidth;
    const paths = [{ x: 0, y: 0 }, { x: width / 2, y: height / 2 }, { x: 0, y: height }, { x: -width / 2, y: height / 2 }];
    this.moveControll.drawPolygon(paths);
  }
}
