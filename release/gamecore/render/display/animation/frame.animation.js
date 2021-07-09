var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
export class FrameAnimation extends BaseAnimation {
  constructor(scene) {
    super(scene);
    __publicField(this, "frameAnim");
    __publicField(this, "complHandler");
  }
  load(resName, textureUrl, jsonUrl, compl) {
    super.load(resName, textureUrl, jsonUrl);
    this.complHandler = compl;
    this.animUrlData = new AnimationUrlData();
    if (resName)
      this.animUrlData.setData(this.resName, textureUrl, jsonUrl);
    else
      this.animUrlData.setDisplayData(textureUrl, jsonUrl);
    if (this.scene.textures.exists(this.resName)) {
      this.onLoadComplete();
    } else {
      this.scene.load.atlas(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl, this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings);
      this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
      this.scene.load.start();
    }
  }
  play(aniName) {
    super.play(aniName);
    if (!this.frameAnim)
      return;
    this.frameAnim.play(this.curAniName);
  }
  destroy() {
    this.complHandler = void 0;
    super.destroy();
  }
  onLoadComplete(loader, totalComplete, totalFailed) {
    this.loaded = true;
    if (!this.scene.anims.exists(this.curAniName)) {
      this.scene.anims.create({
        key: this.curAniName,
        frames: this.scene.anims.generateFrameNames(this.resName),
        repeat: -1
      });
    }
    if (!this.frameAnim) {
      this.frameAnim = this.scene.add.sprite(0, 0, this.resName);
      this.add(this.frameAnim);
    }
    if (this.width === 0) {
      this.setSize(this.frameAnim.width, this.frameAnim.height);
      this.scale = 1;
    } else {
      this.scale = this.width / this.frameAnim.displayWidth;
    }
    if (!this.isPlaying)
      this.play(this.curAniName);
    if (this.complHandler)
      this.complHandler.run();
  }
}
