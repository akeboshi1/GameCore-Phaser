var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import * as SAT from "sat";
import { LogicPos, Logger } from "structure";
export class MoveControll {
  constructor(id, room) {
    this.id = id;
    this.room = room;
    __publicField(this, "mBodies");
    __publicField(this, "ignoreCollsion", false);
    __publicField(this, "velocity");
    __publicField(this, "mPosition");
    __publicField(this, "mPrePosition");
    __publicField(this, "collsion");
    __publicField(this, "maxWidth", 0);
    __publicField(this, "maxHeight", 0);
    this.mPosition = new LogicPos();
    this.mPrePosition = new LogicPos();
    this.velocity = new LogicPos();
    this.collsion = room.collsionManager;
  }
  setVelocity(x, y) {
    this.velocity.x = x;
    this.velocity.y = y;
  }
  update(time, delta) {
    if (this.velocity.x !== 0 || this.velocity.y !== 0) {
      this.mPrePosition.x = this.mPosition.x;
      this.mPrePosition.y = this.mPosition.y;
      const pos = this.mBodies ? this.mBodies.pos : this.mPosition;
      pos.x = pos.x + this.velocity.x;
      pos.y = pos.y + this.velocity.y;
      const collideResponses = this.getCollideResponses();
      if (collideResponses.length > 2) {
        pos.x = this.mPosition.x;
        pos.y = this.mPosition.y;
        return;
      }
      for (const response of collideResponses) {
        if (response.aInB || response.bInA || response.overlap > this.maxWidth * 0.5 || response.overlap > this.maxHeight * 0.5) {
          this.setVelocity(0, 0);
          pos.x = this.mPosition.x;
          pos.y = this.mPosition.y;
          return;
        }
        pos.x -= response.overlapV.x;
        pos.y -= response.overlapV.y;
      }
      this.mPosition.x = pos.x;
      this.mPosition.y = pos.y;
    }
  }
  setPosition(pos) {
    if (this.mPosition) {
      this.mPrePosition.x = this.mPosition.x;
      this.mPrePosition.y = this.mPosition.y;
    }
    this.mPosition = pos;
    if (this.mBodies) {
      const p = this.mBodies.pos;
      p.x = this.mPosition.x;
      p.y = this.mPosition.y;
    }
  }
  drawPolygon(path, offset) {
    if (!path || path.length < 1) {
      return;
    }
    const vectors = [];
    for (const p of path) {
      const absX = Math.abs(p.x);
      const absY = Math.abs(p.y);
      vectors.push(new SAT.Vector(p.x, p.y));
      if (absX > this.maxWidth)
        this.maxWidth = absX;
      if (absY > this.maxHeight)
        this.maxHeight = absY;
    }
    this.mBodies = new SAT.Polygon(new SAT.Vector(this.mPosition.x, this.mPosition.y), vectors);
    if (offset)
      this.setBodiesOffset(offset);
    this.collsion.add(this.id, this.mBodies);
  }
  setBodiesOffset(offset) {
    if (!this.mBodies)
      return;
    this.mBodies.setOffset(new SAT.Vector(offset.x, offset.y));
  }
  removePolygon() {
    if (!this.mBodies) {
      return;
    }
    this.collsion.remove(this.id);
    this.mBodies = null;
  }
  setIgnoreCollsion(val) {
    this.ignoreCollsion = val;
  }
  destroy() {
    this.removePolygon();
    this.setVelocity(0, 0);
    this.mPosition = null;
    this.mPrePosition = null;
  }
  getCollideResponses() {
    if (!this.mBodies || this.ignoreCollsion) {
      return [];
    }
    return this.collsion.collideObjects(this.mBodies);
  }
  getBottomPoint(points) {
    if (!points || !points[2]) {
      return Logger.getInstance().error("Irregular collisions are not currently supported");
    }
    const bottomPoint = points[2];
    return this.room.transformToMini45(new LogicPos(bottomPoint.x, bottomPoint.y));
  }
  get position() {
    return this.mPosition;
  }
  get prePosition() {
    return this.mPrePosition;
  }
  get bodies() {
    return this.mBodies;
  }
}
