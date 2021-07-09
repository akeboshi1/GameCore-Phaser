var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { NineSlicePatch } from "apowophaserui";
export class NinePatchButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, key, frame, text, config, data) {
    super(scene, x, y);
    __publicField(this, "mLabel");
    __publicField(this, "mNingBg");
    __publicField(this, "mKey");
    __publicField(this, "mFrame");
    __publicField(this, "mFrame_nrmal");
    __publicField(this, "mFrame_down");
    __publicField(this, "mFrame_over");
    __publicField(this, "btnData");
    __publicField(this, "mScene");
    this.mScene = scene;
    this.mKey = key;
    this.mFrame = frame ? frame : "__BASE";
    this.initFrame();
    this.setSize(width, height);
    this.mNingBg = new NineSlicePatch(this.scene, 0, 0, width, height, key, this.mFrame_nrmal, config);
    this.add(this.mNingBg);
    if (data) {
      this.btnData = data;
    }
    this.mLabel = this.scene.make.text(void 0, false).setOrigin(0.5, 0.5).setSize(this.width, this.height).setAlign("center").setText(text);
    this.add(this.mLabel);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.on("pointerdown", this.onPointerDown, this);
    this.on("pointerup", this.onPointerUp, this);
  }
  set enable(value) {
    if (value) {
      this.mNingBg.clearTint();
      this.mLabel.clearTint();
      this.setInteractive();
    } else {
      this.mNingBg.setTintFill(6710886);
      this.mLabel.setTintFill(7829367);
      this.removeInteractive();
    }
  }
  getBtnData() {
    return this.btnData;
  }
  setText(text) {
    this.mLabel.setText(text);
  }
  getText() {
    return this.mLabel.text;
  }
  setTextStyle(style) {
    this.mLabel.setStyle(style);
  }
  setFontStyle(val) {
    this.mLabel.setFontStyle(val);
  }
  setTextOffset(x, y) {
    this.mLabel.setPosition(x, y);
  }
  setFrame(frame) {
    this.mNingBg.setFrame(String(frame));
    return this;
  }
  destroy(fromScene) {
    if (this.mLabel)
      this.mLabel.destroy();
    super.destroy(fromScene);
  }
  setFrameNormal(normal, down, over) {
    this.mFrame_nrmal = normal;
    this.mFrame_down = down ? down : normal;
    this.mFrame_over = over ? over : normal;
    this.changeNormal();
    return this;
  }
  changeNormal() {
    this.setFrame(this.mFrame_nrmal);
  }
  changeDown() {
    this.setFrame(this.mFrame_down);
  }
  changeOver() {
    this.setFrame(this.mFrame_over);
  }
  isExists(frame) {
    const originTexture = this.scene.textures.get(this.mKey);
    if (originTexture && originTexture.has(frame))
      return true;
    return false;
  }
  onPointerDown(pointer) {
    this.changeDown();
  }
  onPointerUp(pointer) {
    this.changeNormal();
    this.emit("click", pointer, this);
  }
  get label() {
    return this.mLabel;
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
  initFrame() {
    const frame = this.mFrame ? this.mFrame : this.mKey;
    this.mFrame_nrmal = `${frame}_normal`;
    let down = `${frame}_down`;
    if (!this.isExists(down)) {
      down = `${frame}_normal`;
    }
    this.mFrame_down = down;
    let over = `${frame}_over`;
    if (!this.isExists(over)) {
      over = `${frame}_normal`;
    }
    this.mFrame_over = over;
  }
}
