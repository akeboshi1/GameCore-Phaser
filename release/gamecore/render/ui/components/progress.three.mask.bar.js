var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ProgressNineMaskBar } from "./progress.nine.mask.bar";
import { ThreeSlicePath } from "./three.slice.path";
export class ProgressThreeMaskBar extends ProgressNineMaskBar {
  constructor(scene, key, background, bar, style, barconfig, bgconfig) {
    super(scene, key, background, bar, style, barconfig, bgconfig);
    __publicField(this, "mBackground");
    __publicField(this, "mBar");
    __publicField(this, "maskGraphics");
    __publicField(this, "mText");
    __publicField(this, "zoom", 1);
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
