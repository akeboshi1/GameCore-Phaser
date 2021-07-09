var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import * as SAT from "sat";
import { LogicPos } from "structure";
export class CollsionManager {
  constructor(roomService) {
    this.roomService = roomService;
    __publicField(this, "debug", false);
    __publicField(this, "borders", new Map());
  }
  add(id, boder) {
    this.borders.set(id, boder);
  }
  remove(id) {
    this.borders.delete(id);
  }
  collideObjects(body) {
    const responses = [];
    this.borders.forEach((border, key) => {
      if (border !== body) {
        const response = new SAT.Response();
        if (SAT.testPolygonPolygon(body, border, response)) {
          responses.push(response);
        }
      }
    });
    return responses;
  }
  update(time, delta) {
    if (!this.debug) {
      return;
    }
    this.roomService.game.renderPeer.showMatterDebug(Array.from(this.borders.values()));
  }
  addWall() {
    const size = this.roomService.roomSize;
    const { rows, cols } = size;
    const vertexSets = [this.roomService.transformTo90(new LogicPos(0, 0)), this.roomService.transformTo90(new LogicPos(cols, 0)), this.roomService.transformTo90(new LogicPos(cols, rows)), this.roomService.transformTo90(new LogicPos(0, rows))];
    let nextBody = null;
    let curVertex = null;
    for (let i = 0; i < vertexSets.length; i++) {
      curVertex = vertexSets[i];
      nextBody = vertexSets[i + 1];
      if (!nextBody)
        nextBody = vertexSets[0];
      let offset = 5;
      if (i === 1 || i === 2) {
        offset = -5;
      }
      const polygon = new SAT.Polygon(new SAT.Vector(curVertex.x - curVertex.x, curVertex.y - curVertex.y), [
        new SAT.Vector(curVertex.x, curVertex.y),
        new SAT.Vector(nextBody.x, nextBody.y),
        new SAT.Vector(nextBody.x, nextBody.y - offset),
        new SAT.Vector(curVertex.x, curVertex.y - offset)
      ]);
      this.add(Math.random(), polygon);
    }
  }
  v() {
    this.debug = true;
  }
  q() {
    this.debug = false;
  }
  destroy() {
    this.borders.clear();
  }
}
