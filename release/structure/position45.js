import { LogicPos } from "./logic.pos";
export class Position45 {
  static transformTo90(point, position) {
    const offsetX = position.rows * (position.tileWidth / 2);
    return new LogicPos((point.x - point.y) * (position.tileWidth / 2), (point.x + point.y) * (position.tileHeight / 2));
  }
  static transformTo45(point3, position) {
    const offsetX = position.rows * (position.tileWidth / 2);
    return new LogicPos(Math.floor((point3.y + point3.z) / position.tileHeight + point3.x / position.tileWidth), Math.floor((point3.y + point3.z) / position.tileHeight - point3.x / position.tileWidth));
  }
}
