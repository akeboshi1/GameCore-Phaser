var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Font } from "structure";
import { MainUIScene } from "../scenes";
export class GuideEffect extends Phaser.GameObjects.Container {
  constructor(scene, tmpScale = 1, url) {
    super(scene);
    this.tmpScale = tmpScale;
    this.url = url;
    __publicField(this, "mInitialized", false);
    __publicField(this, "mGuideEffect");
    __publicField(this, "mMask");
    __publicField(this, "guideText");
    __publicField(this, "mScaleTween");
    __publicField(this, "mScale", 1);
    __publicField(this, "mResources", new Map());
    __publicField(this, "mCachePos");
    __publicField(this, "mHandDisplay");
    __publicField(this, "mCacheText");
    this.mScale *= this.tmpScale;
    this.preload();
  }
  preload() {
    let index = 0;
    this.mResources.set("guideBg", { key: "guideBg", url: "guide/guideBg.png", type: "image" });
    this.mResources.set("handEffect", { key: "handEffect", url: "ui/fall_effect/falleffect.png", data: "ui/fall_effect/falleffect.json", type: "atlas" });
    if (this.mResources) {
      this.mResources.forEach((resource) => {
        if (!this.scene.textures.exists(resource.key)) {
          index++;
          if (resource.type) {
            if (this.scene.load[resource.type]) {
              this.scene.load[resource.type](resource.key, this.url.getRes(resource.url), this.url.getRes(resource.data));
            }
          }
        }
      }, this);
    }
    if (index > 0) {
      this.addListen();
      this.scene.load.start();
    } else {
      if (this.mResources)
        this.mResources.clear();
      this.setInitialize(true);
    }
  }
  createGuideEffect(pos, text) {
    if (!this.mInitialized) {
      this.mCachePos = pos;
      this.mCacheText = text;
      return;
    }
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.setSize(width, height);
    if (!this.mGuideEffect) {
      this.mGuideEffect = this.scene.make.image({ x: 0, y: 0, key: "guideBg" });
      this.mGuideEffect.setOrigin(0, 0);
      this.mGuideEffect.frame.setSize(width + 20, height + 20);
      this.mGuideEffect.setPosition(0, 0);
      this.mHandDisplay = new HandDisplay(this.scene, "handEffect");
      this.mHandDisplay.scale = this.tmpScale;
      this.guideText = this.scene.make.text({
        style: {
          fontSize: 18 * this.tmpScale + "px",
          fontFamily: Font.DEFULT_FONT,
          color: "#ffffff"
        }
      }).setOrigin(0.5);
      this.scene.layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mGuideEffect);
      this.scene.layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mHandDisplay);
      this.scene.layerManager.addToLayer(MainUIScene.LAYER_MASK, this.guideText);
    }
    this.setGuideText(text);
    this.updatePos(pos);
    this.start();
  }
  setGuideText(text) {
    this.guideText.text = text;
  }
  updatePos(pos) {
    if (!this.mMask) {
      this.mMask = this.scene.make.graphics(void 0);
      this.mMask.fillStyle(0);
      this.mMask.fillCircle(0, 0, 50);
      this.mMask.setPosition(pos.x, pos.y);
      const geometryMask = this.mMask.createGeometryMask().setInvertAlpha(true);
      this.mGuideEffect.setMask(geometryMask);
    } else {
      this.mMask.setPosition(pos.x, pos.y);
    }
    if (this.mHandDisplay)
      this.mHandDisplay.setPosition(pos.x, pos.y);
    if (this.guideText) {
      const textWidth = this.guideText.width;
      this.guideText.setPosition(pos.x, pos.y + 70 * this.tmpScale);
      const leftx = pos.x - textWidth * 0.5;
      const rightx = pos.x + textWidth * 0.5;
      if (leftx < 0)
        this.guideText.x = pos.x + textWidth * 0.5;
      if (rightx > this.width)
        this.guideText.x = pos.x - textWidth * 0.5;
    }
  }
  start() {
    this.scaleTween();
  }
  stop() {
    if (this.mScaleTween) {
      this.mScaleTween.stop();
      this.mScaleTween = null;
    }
  }
  scaleTween() {
    if (this.mScaleTween || !this.scene) {
      return;
    }
    const self = this;
    this.mScaleTween = this.scene.tweens.add({
      targets: self.mMask,
      duration: 700,
      ease: "Linear",
      props: {
        scaleX: { value: self.mScale > 0.5 * this.tmpScale ? 0.5 * this.tmpScale : 1 * this.tmpScale },
        scaleY: { value: self.mScale > 0.5 * this.tmpScale ? 0.5 * this.tmpScale : 1 * this.tmpScale }
      },
      onComplete: () => {
        self.mScale = self.mScale > 0.5 * this.tmpScale ? 0.5 * this.tmpScale : 1 * this.tmpScale;
        if (self.mScaleTween) {
          self.mScaleTween = void 0;
        }
        self.scaleTween();
      }
    });
  }
  destroy() {
    this.disableInteractive();
    this.stop();
    if (this.mGuideEffect) {
      this.mGuideEffect.destroy();
      this.mGuideEffect = null;
    }
    if (this.mHandDisplay) {
      this.mHandDisplay.destroy();
      this.mHandDisplay = null;
    }
    if (this.guideText) {
      this.guideText.destroy();
      this.guideText = null;
    }
    if (this.mMask) {
      this.mMask.clear();
      this.mMask.destroy();
      this.mMask = null;
    }
    this.setInitialize(false);
    this.removeListen();
    super.destroy();
  }
  setInitialize(val) {
    this.mInitialized = val;
    if (val && this.mCachePos)
      this.createGuideEffect(this.mCachePos, this.mCacheText);
  }
  addListen() {
    if (this.scene) {
      this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
      this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
    }
  }
  removeListen() {
    if (this.scene) {
      this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
      this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
    }
  }
  loadImageHandler(key) {
    if (!this.mResources)
      return;
    if (this.mResources.has(key)) {
      this.mResources.delete(key);
    }
    if (this.mResources.size === 0) {
      this.setInitialize(true);
      this.removeListen();
    }
  }
  loadError(file) {
    if (!this.mResources) {
      return;
    }
    this.loadImageHandler(file.key);
  }
}
class HandDisplay extends Phaser.GameObjects.Container {
  constructor(scene, key) {
    super(scene);
    __publicField(this, "mImage");
    this.mImage = scene.make.sprite({
      key,
      x: 9,
      y: -20
    }, false);
    this.add(this.mImage);
    const config = {
      key: "hand_enable",
      frames: this.scene.anims.generateFrameNames("handEffect", { prefix: "enable", end: 3, zeroPad: 2 }),
      frameRate: 4,
      repeat: -1
    };
    this.scene.anims.create(config);
    this.mImage.play("hand_enable");
  }
}
