var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ClickEvent } from "apowophaserui";
import { Font } from "structure";
import { ButtonEventDispatcher } from "./button.event.dispatch";
export class ToggleButton extends ButtonEventDispatcher {
  constructor(scene, width, height, key, frame, down, dpr, text) {
    super(scene, dpr);
    __publicField(this, "mText");
    __publicField(this, "normalColor", "#FFFFFF");
    __publicField(this, "changeColor", "#0099cc");
    __publicField(this, "mBackground");
    __publicField(this, "mIsOn", false);
    __publicField(this, "key");
    __publicField(this, "mNormal");
    __publicField(this, "mDown");
    this.mBackground = this.scene.make.image({ key, frame });
    this.mText = this.scene.make.text({
      text,
      style: {
        fontSize: 15 * dpr + "px",
        fontFamily: Font.DEFULT_FONT,
        color: "#ffffff"
      }
    }, false).setOrigin(0.5, 0.5);
    this.add([this.mBackground, this.mText]);
    this.mNormal = frame;
    this.mDown = down;
    this.width = width > this.mBackground.width ? width : this.mBackground.width;
    this.height = height > this.mBackground.height ? height : this.mBackground.height;
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
    this.isOn = this.mIsOn;
  }
  setChangeColor(color) {
    this.changeColor = color;
    this.isOn = this.mIsOn;
  }
  setNormalFrame(normal, down) {
    if (normal)
      this.mNormal = normal;
    if (down)
      this.mDown = down;
    this.isOn = this.mIsOn;
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
    this.mBackground.setFrame(this.mDown);
  }
  changeNormal() {
    this.mText.setFill(this.normalColor);
    this.mBackground.setFrame(this.mNormal);
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
