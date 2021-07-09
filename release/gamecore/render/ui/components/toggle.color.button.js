var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ClickEvent } from "apowophaserui";
import { Font } from "structure";
import { ButtonEventDispatcher } from "./button.event.dispatch";
export class ToggleColorButton extends ButtonEventDispatcher {
  constructor(scene, width, height, dpr, text, style) {
    super(scene, dpr);
    __publicField(this, "mText");
    __publicField(this, "normalColor", "#FFFFFF");
    __publicField(this, "changeColor", "#0099cc");
    __publicField(this, "mIsOn", false);
    this.setSize(width, height);
    style = style || {
      fontSize: 15 * dpr + "px",
      fontFamily: Font.DEFULT_FONT,
      color: "#ffffff"
    };
    this.mText = this.scene.make.text({
      text,
      style
    }, false).setOrigin(0.5, 0.5);
    this.add(this.mText);
    this.enable = true;
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
  set isOn(value) {
    this.mIsOn = value;
    if (this.mIsOn)
      this.changeDown();
    else
      this.changeNormal();
  }
  get isOn() {
    return this.mIsOn;
  }
  changeDown() {
    this.mText.setFill(this.changeColor);
  }
  changeNormal() {
    this.mText.setFill(this.normalColor);
  }
  get text() {
    return this.mText;
  }
  EventStateChange(state) {
    switch (state) {
      case ClickEvent.Up:
        this.changeNormal();
        break;
      case ClickEvent.Down:
        this.changeDown();
        break;
      case ClickEvent.Tap:
        this.isOn = true;
        this.changeDown();
        break;
      case ClickEvent.Out:
        if (this.isOn) {
          this.changeDown();
        } else {
          this.changeNormal();
        }
        break;
    }
  }
}
