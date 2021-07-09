var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { LogicRectangle, Logger } from "structure";
import { Viewblock } from "./view.block";
export class ViewblockManager {
  constructor(cameras) {
    __publicField(this, "mCameras");
    __publicField(this, "mBlocks", []);
    __publicField(this, "mDelay", 0);
    this.mCameras = cameras;
  }
  add(e) {
    return new Promise((resolve, reject) => {
      if (!this.mCameras) {
        resolve(false);
        return;
      }
      const ePos = e.getPosition();
      if (!ePos) {
        resolve(false);
        return;
      }
      for (const block of this.mBlocks) {
        const rect = block.rectangle;
        if (rect.contains(ePos.x, ePos.y)) {
          block.add(e).then(() => {
            resolve(true);
          });
          return;
        }
      }
    });
  }
  remove(e) {
    if (!e)
      return;
    for (const block of this.mBlocks) {
      if (block.remove(e)) {
        return;
      }
    }
  }
  check(e) {
    if (!e)
      return;
    for (const block of this.mBlocks) {
      if (block.inCamera) {
        const rect = block.rectangle;
        const pos = e.getPosition();
        if (rect.contains(pos.x, pos.y)) {
          if (!block.getElement(e.id)) {
            this.remove(e);
            block.add(e);
          }
          return;
        }
      }
    }
  }
  int(size) {
    if (!size) {
      return;
    }
    this.mBlocks = [];
    const colSize = 10;
    const viewW = (colSize + colSize) * (size.tileWidth / 2);
    const viewH = (colSize + colSize) * (size.tileHeight / 2);
    const blockW = size.sceneWidth / viewW;
    const blockH = size.sceneHeight / viewH;
    const offsetX = size.rows * (size.tileWidth / 2);
    let index = 0;
    for (let i = 0; i < blockW; i++) {
      for (let j = 0; j < blockH; j++) {
        const block = new Viewblock(new LogicRectangle(i * viewW - offsetX, j * viewH, viewW, viewH), index++);
        this.mBlocks.push(block);
      }
    }
  }
  update(time, delta) {
    if (!this.mCameras)
      return;
    this.mDelay = time;
    const promise = this.mCameras.getViewPort();
    if (promise) {
      promise.then((obj) => {
        const bound = obj;
        for (const block of this.mBlocks) {
          block.check(bound);
        }
      }).catch((error) => {
        Logger.getInstance().error(error);
      });
    }
  }
  destroy() {
    this.mDelay = 0;
    if (this.mBlocks) {
      this.mBlocks.length = 0;
      this.mBlocks = [];
    }
  }
}
