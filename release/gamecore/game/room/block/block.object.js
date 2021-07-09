var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { InputEnable } from "../element/input.enable";
import { LogicPos, Position45 } from "structure";
import { op_def } from "pixelpai_proto";
import { MoveControll } from "../../collsion";
export class BlockObject {
  constructor(id, mRoomService) {
    this.mRoomService = mRoomService;
    __publicField(this, "isUsed", false);
    __publicField(this, "mRenderable", false);
    __publicField(this, "mBlockable", false);
    __publicField(this, "mModel");
    __publicField(this, "mInputEnable");
    __publicField(this, "mCreatedDisplay");
    __publicField(this, "moveControll");
    this.isUsed = true;
    if (id && this.mRoomService)
      this.moveControll = new MoveControll(id, this.mRoomService);
  }
  setRenderable(isRenderable, delay = 0) {
    return __async(this, null, function* () {
      if (this.mRenderable !== isRenderable) {
        this.mRenderable = isRenderable;
        if (isRenderable) {
          yield this.addDisplay();
          if (delay > 0) {
            return this.fadeIn();
          }
        } else {
          if (delay > 0) {
            this.fadeOut(() => {
              return this.removeDisplay();
            });
          } else {
            return this.removeDisplay();
          }
        }
      }
    });
  }
  getPosition() {
    const pos = this.mModel && this.mModel.pos ? this.mModel.pos : new LogicPos();
    return pos;
  }
  getPosition45() {
    const pos = this.getPosition();
    if (!pos)
      return new LogicPos();
    return this.mRoomService.transformToMini45(pos);
  }
  getRenderable() {
    return this.mRenderable;
  }
  fadeIn(callback) {
    return this.mRoomService.game.peer.render.fadeIn(this.id, this.type);
  }
  fadeOut(callback) {
    return this.mRoomService.game.peer.render.fadeOut(this.id, this.type);
  }
  fadeAlpha(alpha) {
    this.mRoomService.game.peer.render.fadeAlpha(this.id, this.type, alpha);
  }
  setInputEnable(val) {
    this.mInputEnable = val;
    if (!this.mRoomService)
      return;
    switch (val) {
      case InputEnable.Interactive:
        if (this.mModel && (this.mModel.hasInteractive || this.mModel.nodeType === op_def.NodeType.ElementNodeType)) {
          this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
        } else {
          this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
        }
        break;
      case InputEnable.Enable:
        this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
        break;
      default:
        this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
        break;
    }
  }
  setBlockable(val) {
    if (this.mBlockable !== val) {
      this.mBlockable = val;
      if (this.mRoomService) {
        if (val) {
          this.mRoomService.addBlockObject(this);
        } else {
          this.mRoomService.removeBlockObject(this);
        }
      }
    }
    return this;
  }
  destroy() {
    if (this.moveControll)
      this.moveControll.removePolygon();
  }
  moveBasePos() {
    return this.moveControll ? this.moveControll.position : void 0;
  }
  clear() {
    this.isUsed = false;
  }
  disableBlock() {
    this.removeFromBlock();
    this.mBlockable = false;
    this.mRenderable = false;
  }
  enableBlock() {
    this.mBlockable = true;
    this.addToBlock();
  }
  getProjectionSize() {
    const miniSize = this.mRoomService.miniSize;
    const collision = this.mModel.getCollisionArea();
    const origin = this.mModel.getOriginPoint();
    if (!collision)
      return;
    const rows = collision.length;
    const cols = collision[0].length;
    const width = cols;
    const height = rows;
    const offset = this.mRoomService.transformToMini90(new LogicPos(origin.x, origin.y));
    return { offset, width, height };
  }
  load(displayInfo) {
    this.addDisplay();
  }
  addDisplay() {
    if (this.mCreatedDisplay)
      return;
    return this.createDisplay();
  }
  createDisplay() {
    this.mCreatedDisplay = true;
    return Promise.resolve();
  }
  removeDisplay() {
    this.mCreatedDisplay = false;
    if (!this.mRoomService)
      return;
    return this.mRoomService.game.peer.render.removeBlockObject(this.id);
  }
  changeDisplay(displayInfo) {
    this.mCreatedDisplay = false;
    this.load(displayInfo);
  }
  addToBlock() {
    if (this.mBlockable) {
      return this.mRoomService.addBlockObject(this).then((resolve) => {
        return Promise.resolve();
      });
    } else {
      this.addDisplay();
      return Promise.resolve();
    }
  }
  removeFromBlock(remove) {
    if (this.mBlockable) {
      this.mRoomService.removeBlockObject(this);
      if (remove) {
        this.setRenderable(false);
      }
    }
  }
  updateBlock() {
    if (this.mBlockable) {
      this.mRoomService.updateBlockObject(this);
    }
  }
  addBody() {
    this.drawBody();
  }
  removeBody() {
    if (!this.moveControll)
      return;
    this.moveControll.removePolygon();
  }
  drawBody() {
    if (!this.moveControll)
      return;
    if (!this.mModel)
      return;
    const collision = this.mModel.getCollisionArea();
    if (!collision) {
      return;
    }
    const collisionArea = [...collision];
    let walkableArea = this.mModel.getWalkableArea();
    if (!walkableArea) {
      walkableArea = [];
    }
    const cols = collisionArea.length;
    const rows = collisionArea[0].length;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (walkableArea[i] && walkableArea[i][j] === 1) {
          collisionArea[i][j] = 0;
        }
      }
    }
    const walkable = (val) => val === 0;
    const resule = collisionArea.some((val) => val.some(walkable));
    let paths = [];
    const miniSize = this.mRoomService.miniSize;
    if (resule) {
      paths = this.calcBodyPath(collisionArea, miniSize);
    } else {
      paths = [Position45.transformTo90(new LogicPos(0, 0), miniSize), Position45.transformTo90(new LogicPos(rows, 0), miniSize), Position45.transformTo90(new LogicPos(rows, cols), miniSize), Position45.transformTo90(new LogicPos(0, cols), miniSize)];
    }
    if (paths.length < 1) {
      this.removeBody();
      return;
    }
    const origin = Position45.transformTo90(this.mModel.getOriginPoint(), miniSize);
    this.moveControll.drawPolygon(paths, { x: -origin.x, y: -origin.y });
  }
  updateBody(model) {
  }
  calcBodyPath(collisionArea, miniSize) {
    const allpoints = this.prepareVertices(collisionArea).reduce((acc, p) => acc.concat(this.transformBodyPath(p[1], p[0], miniSize)), []);
    const convexHull = require("monotone-convex-hull-2d");
    const resultIndices = convexHull(allpoints);
    return resultIndices.map((i) => ({ x: allpoints[i][0], y: allpoints[i][1] }));
  }
  prepareVertices(collisionArea) {
    const allpoints = [];
    for (let i = 0; i < collisionArea.length; i++) {
      let leftMost, rightMost;
      for (let j = 0; j < collisionArea[i].length; j++) {
        if (collisionArea[i][j] === 1) {
          if (!leftMost) {
            leftMost = [i, j];
            allpoints.push(leftMost);
          } else {
            rightMost = [i, j];
          }
        }
      }
      if (rightMost) {
        allpoints.push(rightMost);
      }
    }
    return allpoints;
  }
  transformBodyPath(x, y, miniSize) {
    const pos = Position45.transformTo90(new LogicPos(x, y), miniSize);
    const result = [[pos.x, -miniSize.tileHeight * 0.5 + pos.y], [pos.x + miniSize.tileWidth * 0.5, pos.y], [pos.x, pos.y + miniSize.tileHeight * 0.5], [pos.x - miniSize.tileWidth * 0.5, pos.y]];
    return result;
  }
  get id() {
    return -1;
  }
  get type() {
    return -1;
  }
}
