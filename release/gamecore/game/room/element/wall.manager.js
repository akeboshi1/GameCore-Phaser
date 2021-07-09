var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Direction, LogicPos, Position45 } from "structure";
import { Wall } from "../wall/wall";
import { Sprite } from "baseGame";
import { LayerEnum } from "game-capsule";
import { Helpers } from "utils";
export class WallManager {
  constructor(roomService) {
    this.roomService = roomService;
    __publicField(this, "walls");
    this.walls = [];
  }
  init() {
    const elementStorage = this.roomService.game.elementStorage;
    const wallCollection = elementStorage.getWallCollection();
    if (!wallCollection) {
      return;
    }
    const walls = Array.from(wallCollection.dataMap.values());
    for (const palette of walls) {
      const obj = {
        id: Helpers.genId(),
        point3f: {
          x: palette.x,
          y: palette.y
        },
        layer: LayerEnum.Wall,
        direction: palette.dir
      };
      const sprite = new Sprite(obj);
      sprite.setDisplayInfo(elementStorage.getMossPalette(palette.key).frameModel);
      const w = new Wall(sprite, this.roomService);
      this.walls.push(w);
    }
  }
  destroy() {
    for (const wall of this.walls) {
      wall.destroy();
    }
    this.walls.length = 0;
  }
  isInWallRect(pos) {
    const pos45 = Position45.transformTo45(pos, this.roomService.roomSize);
    for (const wall of this.walls) {
      const minX = wall.model.pos.x - 4;
      const maxX = wall.model.pos.x;
      const minY = wall.model.pos.y - 4;
      const maxY = wall.model.pos.y;
      if (pos45.x >= minX && pos45.x <= maxX && pos45.y >= minY && pos45.y <= maxY) {
        return true;
      }
    }
    return false;
  }
  isAgainstWall(pos, originPoint) {
    const pos45 = Position45.transformTo45(pos, this.roomService.miniSize);
    const checkPos45 = new LogicPos(pos45.x - originPoint.x, pos45.y - originPoint.y);
    for (const wall of this.walls) {
      const roomSizePos = wall.model.pos;
      const miniSizePoses = [
        new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2),
        new LogicPos(roomSizePos.x * 2, roomSizePos.y * 2 + 1),
        new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2),
        new LogicPos(roomSizePos.x * 2 + 1, roomSizePos.y * 2 + 1)
      ];
      if (wall.model.direction === Direction.concave) {
        const yinPos = new LogicPos(roomSizePos.x, roomSizePos.y + 1);
        miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2));
        miniSizePoses.push(new LogicPos(yinPos.x * 2, yinPos.y * 2 + 1));
        miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2));
        miniSizePoses.push(new LogicPos(yinPos.x * 2 + 1, yinPos.y * 2 + 1));
        const yangPos = new LogicPos(roomSizePos.x + 1, roomSizePos.y);
        miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2));
        miniSizePoses.push(new LogicPos(yangPos.x * 2, yangPos.y * 2 + 1));
        miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2));
        miniSizePoses.push(new LogicPos(yangPos.x * 2 + 1, yangPos.y * 2 + 1));
      }
      for (const miniSizePose of miniSizePoses) {
        if (miniSizePose.y === checkPos45.y && (miniSizePose.x === checkPos45.x + 1 || miniSizePose.x === checkPos45.x - 1) || miniSizePose.x === checkPos45.x && (miniSizePose.y === checkPos45.y + 1 || miniSizePose.y === checkPos45.y - 1)) {
          return true;
        }
      }
    }
    return false;
  }
  changeAllDisplayData(id) {
  }
}
