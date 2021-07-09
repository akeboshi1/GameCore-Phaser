var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseUI, NineSlicePatch } from "apowophaserui";
export class ProgressNineMaskBar extends BaseUI {
  constructor(scene, key, background, bar, style, barconfig, bgconfig) {
    super(scene);
    __publicField(this, "value", 0);
    __publicField(this, "max", 1);
    __publicField(this, "mBackground");
    __publicField(this, "mBar");
    __publicField(this, "maskGraphics");
    __publicField(this, "mText");
    __publicField(this, "zoom", 1);
    this.createBackgroundBar(key, background, bar, style, barconfig, bgconfig);
    this.maskGraphics = this.scene.make.graphics(void 0, false);
    this.maskGraphics.fillStyle(0, 1);
    this.maskGraphics.fillRect(0, 0, this.width, this.height);
    this.mBar.setMask(this.maskGraphics.createGeometryMask());
    if (this.mBackground)
      this.add(this.mBackground);
    if (this.mBar)
      this.add(this.mBar);
    if (this.mText)
      this.add(this.mText);
    this.disInteractive();
  }
  setProgress(curVal, maxVal) {
    let value = curVal / maxVal;
    if (value > 1)
      value = 1;
    else if (value < 0)
      value = 0;
    this.value = value;
    this.max = maxVal;
    this.refreshMask();
  }
  setText(val) {
    if (this.mText) {
      this.mText.text = val;
      if (!this.mText.parentContainer)
        this.add(this.mText);
    }
  }
  refreshMask() {
    const world = this.getWorldTransformMatrix();
    if (this.zoom !== world.scaleX) {
      this.zoom = world.scaleX;
      this.maskGraphics.clear();
      this.maskGraphics.fillRect(0, 0, this.width * this.zoom, this.height * this.zoom);
    }
    const offsetx = world.tx - this.width * this.zoom * 1.5;
    const tx = offsetx + this.width * this.zoom * this.value;
    const ty = world.ty - this.height * this.zoom * 0.5;
    this.maskGraphics.setPosition(tx, ty);
  }
  destroy() {
    super.destroy();
    this.maskGraphics.destroy();
  }
  get text() {
    return this.mText;
  }
  get bar() {
    return this.mBar;
  }
  createBackgroundBar(key, background, bar, style, barconfig, bgconfig) {
    if (background) {
      if (bgconfig) {
        const bgW = bgconfig.width || this.width;
        const bgH = bgconfig.height || this.height;
        this.mBackground = new NineSlicePatch(this.scene, 0, -2 * this.dpr, bgW, bgH, key, background, bgconfig);
        this.setSize(bgW, bgH);
      } else {
        this.mBackground = this.scene.make.image({ key, frame: background });
        this.setSize(this.mBackground.width, this.mBackground.height);
      }
    }
    if (barconfig) {
      const barW = barconfig.width || this.width;
      const barH = barconfig.height || this.height;
      this.mBar = new NineSlicePatch(this.scene, 0, -2 * this.dpr, barW, barH, key, bar, barconfig);
    } else {
      this.mBar = this.scene.make.image({ key, frame: bar });
      this.mBar.isCropped = true;
    }
    if (style) {
      this.mText = this.scene.make.text({
        style
      }, false).setOrigin(0.5);
    }
  }
}
