var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseUI } from "apowophaserui";
import { ThreeSlicePath } from "./three.slice.path";
export class ProgressThreeBar extends BaseUI {
  constructor(scene, key, background, bar, style, barconfig, bgconfig) {
    super(scene);
    __publicField(this, "value", 0);
    __publicField(this, "max", 1);
    __publicField(this, "mBackground");
    __publicField(this, "mBar");
    __publicField(this, "mText");
    __publicField(this, "zoom", 1);
    this.createBackgroundBar(key, background, bar, style, barconfig, bgconfig);
    this.add([this.mBackground, this.mBar]);
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
    const width = this.width * this.zoom * this.value;
    this.bar.resize(width, this.height);
    this.bar.x = -this.width * 0.5 + width * 0.5;
  }
  setText(val) {
    if (this.mText) {
      this.mText.text = val;
      if (!this.mText.parentContainer)
        this.add(this.mText);
    }
  }
  get text() {
    return this.mText;
  }
  get bar() {
    return this.mBar;
  }
  createBackgroundBar(key, background, bar, style, barconfig, bgconfig) {
    if (bgconfig) {
      const bgW = bgconfig.width || this.width;
      const bgH = bgconfig.height || this.height;
      const correct = barconfig.correct;
      this.mBackground = new ThreeSlicePath(this.scene, 0, -2 * this.dpr, bgW, bgH, key, background, 1, 1, correct);
      this.setSize(bgW, bgH);
    } else {
      this.mBackground = this.scene.make.image({ key, frame: background });
      this.setSize(this.mBackground.width, this.mBackground.height);
    }
    if (barconfig) {
      const barW = barconfig.width || this.width;
      const barH = barconfig.height || this.height;
      const correct = barconfig.correct;
      this.mBar = new ThreeSlicePath(this.scene, 0, -2 * this.dpr, barW, barH, key, bar, 1, 1, correct);
    } else
      this.mBar = this.scene.make.image({ key, frame: bar });
    if (style) {
      this.mText = this.scene.make.text({
        style
      }, false);
    }
  }
}
