var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Pos } from "structure";
export class IconSelectBtn extends Phaser.GameObjects.Container {
  constructor(scene, render, bgResKey, bgTexture, scale = 28 / 43) {
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
    this.mScene = scene;
    this.mRender = render;
    this.mBtnBg = scene.make.image(void 0, false);
    this.mBgTexture = bgTexture;
    this.mBgResKey = bgResKey;
    this.mBtnBg.setTexture(bgResKey, bgTexture[0]);
    this.mBtnBg.scaleX = this.mBtnBg.scaleY = scale;
    this.addAt(this.mBtnBg, 0);
    this.setSize(this.mBtnBg.width, this.mBtnBg.height);
    this.setInteractive();
    this.on("pointerup", this.upHandler, this);
    this.on("pointerdown", this.downHandler, this);
    this.on("pointerover", this.overHandler, this);
    this.on("pointerout", this.outHandler, this);
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
  setBgRes(index) {
    this.mBtnBg.setTexture(this.mBgResKey, this.mBgTexture[index] || 0);
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
  overHandler(pointer) {
  }
  outHandler(pointer) {
  }
  upHandler() {
    if (this.monClick) {
      this.monClick();
    }
  }
  downHandler() {
    this.scaleHandler();
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
