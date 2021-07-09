var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Font } from "structure";
export class TextButton extends Phaser.GameObjects.Container {
  constructor(scene, dpr, scale = 1, text, x, y) {
    super(scene, x, y);
    __publicField(this, "mText");
    __publicField(this, "normalColor", "#FFFFFF");
    __publicField(this, "changeColor", "#0099cc");
    this.mText = this.scene.make.text({
      text,
      style: {
        fontSize: 15 * dpr + "px",
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5, 0.5);
    this.add(this.mText);
  }
  setText(val) {
    this.mText.text = val;
  }
  setFontSize(size) {
    this.mText.setFontSize(size);
  }
  setFontStyle(val) {
    this.mText.setFontStyle(val);
  }
  setStyle(style) {
    this.mText.setStyle(style);
  }
  setNormalColor(color) {
    this.normalColor = color;
  }
  setChangeColor(color) {
    this.changeColor = color;
  }
  changeDown() {
    this.mText.setFill(this.changeColor);
  }
  changeNormal() {
    this.mText.setFill(this.normalColor);
  }
  onPointerUpHandler(pointer) {
    this.emit("click", pointer, this);
  }
  get text() {
    return this.mText;
  }
}
