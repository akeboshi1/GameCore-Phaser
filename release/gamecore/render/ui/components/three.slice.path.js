var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseUI } from "apowophaserui";
import { UiUtils } from "utils";
export class ThreeSlicePath extends BaseUI {
  constructor(scene, x, y, width, height, key, frame, dpr, scale, correct) {
    super(scene, dpr, scale);
    __publicField(this, "imgs");
    __publicField(this, "mCorrection", 4);
    __publicField(this, "internalTint");
    this.dpr = dpr || UiUtils.baseDpr;
    this.scale = scale || UiUtils.baseScale;
    this.mCorrection = correct === void 0 ? 4 : correct;
    this.imgs = [];
    this.setTexture(key, frame);
    this.setSize(width, height);
    this.setPosition(x, y);
  }
  resize(width, height) {
    width = Math.round(width);
    height = Math.round(height);
    if (this.width === width && this.height === height) {
      return this;
    }
    this.setSize(width, height);
    return;
  }
  set correctValue(value) {
    this.mCorrection = value;
  }
  setTexture(key, frame) {
    if (!this.imgs[0]) {
      this.imgs[0] = this.scene.make.image({ key, frame: frame[0] });
      this.add(this.imgs[0]);
    } else
      this.imgs[0].setTexture(key, frame[0]);
    if (!this.imgs[2]) {
      this.imgs[2] = this.scene.make.image({ key, frame: frame[2] });
      this.add(this.imgs[2]);
    } else
      this.imgs[2].setTexture(key, frame[2]);
    if (!this.imgs[1]) {
      this.imgs[1] = this.scene.make.image({ key, frame: frame[1] });
      this.add(this.imgs[1]);
    } else
      this.imgs[1].setTexture(key, frame[1]);
    return this;
  }
  setFrame(frame) {
    this.imgs[0].setFrame(frame[0]);
    this.imgs[1].setFrame(frame[1]);
    this.imgs[2].setFrame(frame[2]);
    return this;
  }
  setSize(width, height) {
    super.setSize(width, height);
    this.imgs[0].scale = 1;
    this.imgs[2].scale = 1;
    let midWidth = width - (this.imgs[0].displayWidth + this.imgs[2].displayWidth) + this.mCorrection;
    if (midWidth < 0) {
      midWidth = 0;
      this.imgs[0].displayWidth = width * 0.5;
      this.imgs[2].displayWidth = width * 0.5;
    }
    this.imgs[0].x = -width * 0.5 + this.imgs[0].displayWidth * 0.5;
    this.imgs[2].x = width * 0.5 - this.imgs[2].displayWidth * 0.5;
    this.imgs[1].displayWidth = midWidth;
    return this;
  }
  setTint(tint) {
    this.tint = tint;
    return this;
  }
  setTintFill(tint) {
    this.tint = tint;
    this.tintFill = true;
    return this;
  }
  get tintFill() {
    return this.first && this.first.tintFill;
  }
  set tintFill(value) {
    this.imgs.forEach((patch) => patch.tintFill = value);
  }
  set tint(value) {
    this.imgs.forEach((patch) => patch.setTint(value));
    this.internalTint = value;
  }
  get isTinted() {
    return this.first && this.first.isTinted;
  }
  clearTint() {
    this.each((patch) => patch.clearTint());
    this.internalTint = void 0;
    this.tintFill = false;
  }
  destroy() {
    super.destroy();
    if (this.imgs)
      this.imgs.length = 0;
    this.imgs = void 0;
  }
}
