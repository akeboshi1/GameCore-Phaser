var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
export class DragonbonesAnimation extends BaseAnimation {
  constructor(scene) {
    super(scene);
    __publicField(this, "armatureDisplay");
  }
  load(resName, textureUrl, jsonUrl, boneUrl) {
    super.load(resName, textureUrl, jsonUrl);
    this.animUrlData = new AnimationUrlData();
    if (resName)
      this.animUrlData.setData(this.resName, this.textureUrl, boneUrl, ".dbbin");
    else
      this.animUrlData.setDisplayData(textureUrl, jsonUrl);
    this.scene.load.dragonbone(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl, this.animUrlData.boneUrl, this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings, this.animUrlData.boneXhrSettings);
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
    this.scene.load.start();
  }
  play(aniName) {
    super.play(aniName);
    if (!this.armatureDisplay)
      return;
    this.armatureDisplay.animation.play(aniName);
  }
  destroy() {
    super.destroy();
    if (this.armatureDisplay)
      this.armatureDisplay.destroy();
    this.armatureDisplay = null;
  }
  onLoadComplete(loader, totalComplete, totalFailed) {
    this.loaded = true;
    this.armatureDisplay = this.scene.add.armature("mecha_1002_101d", this.resName);
    this.add(this.armatureDisplay);
    if (this.isPlaying)
      this.play(this.curAniName);
  }
}
