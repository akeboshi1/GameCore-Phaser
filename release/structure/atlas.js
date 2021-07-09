var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class Atlas {
  constructor() {
    __publicField(this, "atlas");
    __publicField(this, "frames");
    this.frames = [];
    this.atlas = { frames: this.frames };
  }
  addFrame(name, rect) {
    this.frames.push({
      filename: name,
      frame: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: rect.width, h: rect.height },
      sourceSize: { w: rect.width, h: rect.height }
    });
  }
  setFrame(frame) {
    this.frames = frame;
    this.atlas = { frames: this.frames };
  }
  removeFrame(name) {
    this.frames[name] = null;
    delete this.frames[name];
  }
  clearFrames() {
    this.frames.length = 0;
  }
  toString() {
    return JSON.stringify(this.atlas);
  }
}
