var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
export class BubbleAnimation extends BaseAnimation {
  constructor(scene) {
    super(scene);
    __publicField(this, "frameAnim");
    __publicField(this, "bubblebg");
  }
  load(resName, textureUrl, jsonUrl) {
    super.load(resName, textureUrl, jsonUrl);
    this.animUrlData = new AnimationUrlData();
    if (resName)
      this.animUrlData.setData(this.resName, this.textureUrl, jsonUrl);
    else
      this.animUrlData.setDisplayData(textureUrl, jsonUrl);
    this.scene.load.image(this.resName, this.animUrlData.pngUrl);
    this.scene.load.image(this.animUrlData.jsonUrl, this.animUrlData.jsonUrl);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
    this.scene.load.start();
  }
  play(aniName) {
    super.play(aniName);
    if (!this.frameAnim)
      return;
    this.setScale(0.2, 0.2);
    this.y = 50;
    this.scene.tweens.add({
      targets: this,
      y: { value: -100, duration: 300, ease: "Bounce.easeOut" },
      scaleX: { value: 1, duration: 300, ease: "Bounce.easeOut" },
      scaleY: { value: 1, duration: 300, ease: "Bounce.easeOut" }
    });
  }
  destroy() {
    super.destroy();
    if (this.frameAnim)
      this.frameAnim.destroy();
    if (this.bubblebg)
      this.bubblebg.destroy();
    this.frameAnim = null;
    this.bubblebg = null;
  }
  onLoadComplete(loader, totalComplete, totalFailed) {
    this.loaded = true;
    this.bubblebg = this.scene.add.image(0, 0, this.resName);
    this.frameAnim = this.scene.add.image(0, 0, this.animUrlData.jsonUrl);
    this.add([this.bubblebg, this.frameAnim]);
    if (this.isPlaying)
      this.play();
  }
}
