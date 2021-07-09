var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseUI } from "apowophaserui";
export class ProgressMaskBar extends BaseUI {
  constructor(scene, key, background, bar, style) {
    super(scene);
    __publicField(this, "value", 0);
    __publicField(this, "max", 1);
    __publicField(this, "mBackground");
    __publicField(this, "mBar");
    __publicField(this, "mText");
    __publicField(this, "zoom", 1);
    this.createBackgroundBar(key, background, bar, style);
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
    this.max = 1;
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
    if (this.mBar)
      this.mBar.setCrop(new Phaser.Geom.Rectangle(0, 0, this.value / this.max * this.width, this.height));
  }
  destroy() {
    super.destroy();
  }
  get text() {
    return this.mText;
  }
  get bar() {
    return this.mBar;
  }
  createBackgroundBar(key, background, bar, style) {
    if (background) {
      this.mBackground = this.scene.make.image({ key, frame: background });
      this.setSize(this.mBackground.width, this.mBackground.height);
    }
    this.mBar = this.scene.make.image({ key, frame: bar });
    this.mBar.isCropped = true;
    if (style) {
      this.mText = this.scene.make.text({
        style
      }, false).setOrigin(0.5);
    }
  }
}
