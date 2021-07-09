var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Pos } from "structure";
export class IconBtn extends Phaser.GameObjects.Container {
  constructor(scene, render, data) {
    super(scene);
    __publicField(this, "monClick");
    __publicField(this, "mScene");
    __publicField(this, "mRender");
    __publicField(this, "mBgResKey");
    __publicField(this, "mBtnBg");
    __publicField(this, "mBtnIcon");
    __publicField(this, "mBtnData");
    __publicField(this, "mBasePos");
    __publicField(this, "mBgTexture");
    __publicField(this, "mData");
    this.mScene = scene;
    this.mRender = render;
    this.mBtnBg = scene.make.image(void 0, false);
    this.mBgResKey = data.bgResKey;
    this.mBgTexture = data.bgTextures;
    this.mData = data;
    if (!this.mScene.textures.exists(this.mBgResKey) && data.pngUrl && data.jsonUrl) {
      this.mScene.load.atlas(data.key, render.url.getRes(data.pngUrl), render.url.getRes(data.jsonUrl));
      this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
      this.mScene.load.start();
      return;
    }
    this.loadComplete();
  }
  getKey() {
    return this.mData.key;
  }
  setPos(x, y) {
    if (!this.mBasePos) {
      this.mBasePos = new Pos();
    }
    this.mBasePos.x = x;
    this.mBasePos.y = y;
  }
  getPos() {
    return this.mBasePos;
  }
  setBtnData(value) {
    this.mBtnData = value;
  }
  getBtnData() {
    return this.mBtnData;
  }
  setClick(func) {
    this.monClick = func;
  }
  destroy() {
    if (this.mBtnBg) {
      this.mBtnBg.destroy(true);
    }
    if (this.mBtnIcon) {
      this.mBtnIcon.destroy(true);
    }
    this.monClick = null;
    this.mBtnBg = null;
    this.mBtnIcon = null;
    this.mBtnData = null;
    this.mScene = null;
    super.destroy();
  }
  loadComplete() {
    this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[0]);
    this.mBtnBg.scaleX = this.mBtnBg.scaleY = this.mData.scale;
    this.addAt(this.mBtnBg, 0);
    if (this.mData.iconResKey && this.mData.iconTexture && this.mData.iconTexture.length > 0) {
      this.mBtnIcon = this.mScene.make.image(void 0, false);
      this.mBtnIcon.setTexture(this.mData.iconResKey, this.mData.iconTexture);
      this.add(this.mBtnIcon);
    }
    this.setSize(this.mBtnBg.width, this.mBtnBg.height);
    this.setInteractive();
    this.on("pointerup", this.upHandler, this);
    this.on("pointerdown", this.downHandler, this);
    this.on("pointerover", this.overHandler, this);
    this.on("pointerout", this.outHandler, this);
  }
  overHandler(pointer) {
    if (this.mBgTexture.length < 2) {
      return;
    }
    this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[1]);
  }
  outHandler(pointer) {
    if (this.mBgTexture.length < 2) {
      return;
    }
    this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[0]);
  }
  upHandler() {
    if (this.monClick) {
      this.monClick();
    }
    if (this.mData && this.mData.callBack) {
      this.mData.callBack.apply(this);
    }
    this.emit("click", this);
    if (this.mBgTexture.length < 3) {
      return;
    }
    this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[2]);
  }
  downHandler() {
    if (this.mBgTexture.length < 4) {
      return;
    }
    this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[3]);
  }
  scaleHandler() {
    this.mScene.tweens.add({
      targets: this,
      duration: 50,
      ease: "Linear",
      props: {
        scaleX: { value: 0.5 },
        scaleY: { value: 0.5 }
      },
      yoyo: true,
      repeat: 0
    });
    this.scaleX = this.scaleY = 1;
  }
}
