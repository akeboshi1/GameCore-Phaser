var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Logger } from "structure";
export class Scenery {
  constructor(scenery) {
    __publicField(this, "mID");
    __publicField(this, "mDepth");
    __publicField(this, "mWidth");
    __publicField(this, "mHeight");
    __publicField(this, "mUris");
    __publicField(this, "mSpeed");
    __publicField(this, "mFit");
    __publicField(this, "mOffset");
    this.mID = scenery.id;
    this.mDepth = scenery.depth;
    this.mUris = [];
    let uris = null;
    if (Array.isArray(scenery.uris)) {
      uris = scenery.uris;
    } else {
      uris = scenery.uris.value;
    }
    if (uris.length < 1) {
      Logger.getInstance().error(`${Scenery.name}: scenery uris is empty`);
    }
    for (let i = 0; i < uris.length; i++) {
      const val = uris[i].value || uris;
      this.mUris[i] = new Array(val[i].length);
      for (let j = 0; j < val[i].length; j++) {
        this.mUris[i][j] = val[i][j];
      }
    }
    this.mSpeed = scenery.speed || 1;
    if (!scenery.width) {
      Logger.getInstance().error(`${Scenery.name}: scenery width is ${scenery.width}`);
    }
    if (!scenery.height) {
      Logger.getInstance().error(`${Scenery.name}: scenery height is ${scenery.height}`);
    }
    this.mWidth = scenery.width;
    this.mHeight = scenery.height;
    this.mFit = scenery.fit;
    const pos = { x: 0, y: 0 };
    const offset = scenery.offset;
    if (offset) {
      pos.x = offset.x;
      pos.y = offset.y;
    }
    this.mOffset = pos;
  }
  get offset() {
    return this.mOffset;
  }
  get width() {
    return this.mWidth;
  }
  get height() {
    return this.mHeight;
  }
  get id() {
    return this.mID;
  }
  get depth() {
    return this.mDepth;
  }
  get speed() {
    return this.mSpeed;
  }
  get uris() {
    return this.mUris;
  }
  get fit() {
    return this.mFit;
  }
}
