var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { normalizePatchesConfig } from "./patches.config";
const _NinePatch = class extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, key, frame, config) {
    super(scene, x, y);
    __publicField(this, "originTexture");
    __publicField(this, "originFrame");
    __publicField(this, "config");
    __publicField(this, "finalXs");
    __publicField(this, "finalYs");
    __publicField(this, "internalTint");
    __publicField(this, "patchKey");
    this.config = config || this.scene.cache.custom.ninePatch.get(frame ? `${frame}` : key);
    this.patchKey = Math.random() * 1e3 + "";
    this.config.top = Math.round(this.config.top);
    if (this.config.right)
      this.config.right = Math.round(this.config.right);
    if (this.config.bottom)
      this.config.bottom = Math.round(this.config.bottom);
    if (this.config.left)
      this.config.left = Math.round(this.config.left);
    normalizePatchesConfig(this.config);
    this.setSize(width, height);
    this.setTexture(key, frame);
  }
  resize(width, height) {
    width = Math.round(width);
    height = Math.round(height);
    if (!this.config) {
      return this;
    }
    if (this.width === width && this.height === height) {
      return this;
    }
    width = Math.max(width, this.config.left + this.config.right + 1);
    height = Math.max(height, this.config.top + this.config.bottom + 1);
    this.setSize(width, height);
    this.drawPatches();
    return;
  }
  setTexture(key, frame) {
    this.originTexture = this.scene.textures.get(key);
    this.setFrame(frame);
    this.originTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return this;
  }
  setFrame(frame) {
    this.originFrame = this.originTexture.frames[frame] || this.originTexture.frames[_NinePatch.__BASE];
    this.createPatches();
    this.drawPatches();
    return this;
  }
  setSize(width, height) {
    super.setSize(width, height);
    this.finalXs = [0, this.config.left, this.width - this.config.right, this.width];
    this.finalYs = [0, this.config.top, this.height - this.config.bottom, this.height];
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
    this.each((patch) => patch.tintFill = value);
  }
  set tint(value) {
    this.each((patch) => patch.setTintFill(value));
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
    if (this.originTexture) {
      let patchIndex = 0;
      for (let yi = 0; yi < 3; yi++) {
        for (let xi = 0; xi < 3; xi++) {
          const patch = this.getPatchNameByIndex(patchIndex);
          if (this.originTexture.frames.hasOwnProperty(patch)) {
            this.originTexture.remove(patch);
          }
          ++patchIndex;
        }
      }
    }
    super.destroy();
  }
  getPatchNameByIndex(index) {
    return this.originFrame.name + _NinePatch.patches[index] + this.patchKey;
  }
  createPatches() {
    const textureXs = [0, this.config.left, this.originFrame.width - this.config.right, this.originFrame.width];
    const textureYs = [0, this.config.top, this.originFrame.height - this.config.bottom, this.originFrame.height];
    let patchIndex = 0;
    for (let yi = 0; yi < 3; yi++) {
      for (let xi = 0; xi < 3; xi++) {
        this.createPatchFrame(this.getPatchNameByIndex(patchIndex), textureXs[xi], textureYs[yi], textureXs[xi + 1] - textureXs[xi], textureYs[yi + 1] - textureYs[yi]);
        ++patchIndex;
      }
    }
  }
  drawPatches() {
    const tintFill = this.tintFill;
    this.removeAll(true);
    let patchIndex = 0;
    for (let yi = 0; yi < 3; yi++) {
      for (let xi = 0; xi < 3; xi++) {
        const patch = this.originTexture.frames[this.getPatchNameByIndex(patchIndex)];
        const patchImg = new Phaser.GameObjects.Image(this.scene, 0, 0, patch.texture.key, patch.name);
        patchImg.setOrigin(0);
        patchImg.setPosition((this.finalXs[xi] * 1e3 - this.width * this.originX * 1e3) / 1e3, (this.finalYs[yi] * 1e3 - this.height * this.originY * 1e3) / 1e3);
        patchImg.displayWidth = this.finalXs[xi + 1] - this.finalXs[xi];
        patchImg.displayHeight = this.finalYs[yi + 1] - this.finalYs[yi];
        this.add(patchImg);
        if (this.internalTint)
          patchImg.setTint(this.internalTint);
        patchImg.tintFill = tintFill;
        patchImg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        ++patchIndex;
      }
    }
  }
  createPatchFrame(patch, x, y, width, height) {
    if (this.originTexture.frames.hasOwnProperty(patch)) {
      return;
    }
    this.originTexture.add(patch, this.originFrame.sourceIndex, this.originFrame.cutX + x, this.originFrame.cutY + y, width, height);
  }
};
export let NinePatch = _NinePatch;
__publicField(NinePatch, "__BASE", "__BASE");
__publicField(NinePatch, "patches", ["[0][0]", "[1][0]", "[2][0]", "[0][1]", "[1][1]", "[2][1]", "[0][2]", "[1][2]", "[2][2]"]);
