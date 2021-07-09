var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BBCodeText, NineSlicePatch } from "apowophaserui";
import { Font } from "structure";
export class TextToolTips extends Phaser.GameObjects.Container {
  constructor(scene, key, frame, dpr, zoom) {
    super(scene);
    __publicField(this, "bg");
    __publicField(this, "text");
    __publicField(this, "timeID");
    __publicField(this, "dpr");
    const tempframe = scene.textures.getFrame(key, frame);
    const tipsWidth = tempframe.width;
    const tipsHeight = tempframe.height;
    this.dpr = dpr;
    this.bg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, key, frame, {
      left: 20 * dpr,
      top: 20 * dpr,
      right: 20 * dpr,
      bottom: 20 * dpr
    });
    this.text = new BBCodeText(this.scene, 0, 0, "\u84DD\u77FF\u77F3", {
      color: "#333333",
      fontSize: 13 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
      wrap: {
        width: 90 * this.dpr,
        mode: "string"
      }
    }).setOrigin(0);
    this.add([this.bg, this.text]);
    this.setSize(tipsWidth + 20 * dpr, tipsHeight + 20 * dpr);
  }
  setSize(width, height) {
    super.setSize(width, height);
    this.bg.resize(width, height);
    this.bg.setPosition(0, 0);
    const textWidth = width - 16 * this.dpr;
    const textHeight = height - 16 * this.dpr;
    this.text.setSize(textWidth, textHeight);
    this.text.setWrapWidth(textWidth);
    this.text.setPosition(-textWidth * 0.5, -textHeight * 0.5);
    return this;
  }
  setText(text) {
    this.text.text = text;
    if (this.text.height > this.height) {
      this.setSize(this.width, this.text.height + 16 * this.dpr);
    }
  }
  setDelayText(text, delay, compl) {
    this.visible = true;
    this.setText(text);
    if (this.timeID)
      clearTimeout(this.timeID);
    this.timeID = setTimeout(() => {
      this.visible = false;
      if (compl)
        compl.run();
    }, delay);
  }
}
