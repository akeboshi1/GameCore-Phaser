var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ClickEvent, InputText } from "apowophaserui";
import { Font, Logger } from "structure";
import { Tap } from "./tap";
export class LabelInput extends Phaser.GameObjects.Container {
  constructor(scene, config) {
    super(scene);
    __publicField(this, "background");
    __publicField(this, "mLabel");
    __publicField(this, "mInputText");
    __publicField(this, "mInputConfig");
    __publicField(this, "mOriginX");
    __publicField(this, "mOriginY");
    __publicField(this, "mPlaceholder");
    __publicField(this, "mAutoBlur", true);
    const labelConfig = {
      fontFamily: Font.DEFULT_FONT
    };
    const clickW = config.width || 100;
    const clickH = config.height || 100;
    this.mPlaceholder = config.placeholder;
    this.mLabel = this.scene.make.text({
      text: this.mPlaceholder,
      style: Object.assign(labelConfig, config)
    }, false).setInteractive(new Phaser.Geom.Rectangle(-clickW * 0.5, -clickH * 0.5, clickW, clickH), Phaser.Geom.Rectangle.Contains);
    this.mOriginX = this.mLabel.originX;
    this.mOriginY = this.mLabel.originY;
    const tap = new Tap(this.mLabel);
    this.mLabel.on(ClickEvent.Tap, this.onShowInputHandler, this);
    this.add(this.mLabel);
    this.setSize(clickW, clickH);
    this.mInputConfig = config;
  }
  setText(val) {
    this.mLabel.setText(this.mPlaceholder ? val ? val : this.mPlaceholder : val);
    if (this.mInputText) {
      this.mInputText.text = val;
    }
    return this;
  }
  setPlaceholder(val) {
    this.mPlaceholder = val || this.mPlaceholder;
    this.mInputConfig.placeholder = this.mPlaceholder;
    this.mLabel.setText(this.mPlaceholder);
    return this;
  }
  setOrigin(x, y) {
    if (y === void 0)
      y = x;
    this.mLabel.setOrigin(x, y);
    this.mOriginX = x;
    this.mOriginY = y;
    if (this.mInputText)
      this.mInputText.setOrigin(x, y);
    this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * x, -this.height * y, this.width, this.height);
    return this;
  }
  createBackground(padding, radius) {
    if (!this.background) {
      this.background = this.scene.make.graphics(void 0, false);
    }
    this.background.clear();
    this.background.fillStyle(16777215);
    this.background.fillRoundedRect(-padding + this.width * this.mLabel.originX, -padding + this.height * this.mLabel.originY, this.width + padding * 2, this.height + padding * 2, radius);
    this.addAt(this.background, 0);
  }
  setSize(w, h) {
    super.setSize(w, h);
    this.mLabel.input.hitArea = new Phaser.Geom.Rectangle(-this.width * this.mLabel.originX, -this.height * this.mLabel.originX, this.width, this.height);
    return this;
  }
  setAutoBlur(val) {
    this.mAutoBlur = val;
    return this;
  }
  setBlur() {
    this.onShowLabel();
  }
  destroy() {
    this.mLabel.destroy();
    this.destroyInput();
    super.destroy();
  }
  createInputText() {
    if (this.mInputText) {
      return;
    }
    this.mInputText = new InputText(this.scene, Object.assign({}, this.mInputConfig)).setOrigin(this.mOriginX, this.mOriginY);
    this.mInputText.on("textchange", this.onTextChangeHandler, this);
    this.mInputText.on("blur", this.onTextBlurHandler, this);
    this.mInputText.on("focus", this.onTextFocusHandler, this);
    this.mInputText.x = this.mLabel.x;
    this.mInputText.y = this.mLabel.y;
    this.mInputText.node.addEventListener("keypress", (e) => {
      const keycode = e.keyCode || e.which;
      if (keycode === 13) {
        this.emit("enter", this.mInputText.text);
        if (this.mAutoBlur)
          this.onShowLabel();
      }
    });
  }
  onShowInputHandler() {
    this.createInputText();
    this.remove(this.mLabel);
    this.add(this.mInputText);
    if (this.mInputConfig.placeholder !== this.mLabel.text)
      this.mInputText.setText(this.mLabel.text);
    this.mInputText.setFocus();
  }
  onPointerDownHandler() {
  }
  onShowLabel() {
    if (this.mInputText) {
      if (!this.mInputText.text && this.mInputConfig.placeholder) {
        this.mLabel.setText(this.mInputConfig.placeholder);
      } else {
        this.mLabel.setText(this.mInputText.text);
      }
      this.destroyInput();
    }
    this.add(this.mLabel);
  }
  destroyInput() {
    if (this.mInputText) {
      this.mInputText.off("textchange", this.onTextChangeHandler, this);
      this.mInputText.off("blur", this.onTextBlurHandler, this);
      this.mInputText.off("focus", this.onTextFocusHandler, this);
      this.mInputText.destroy();
      this.mInputText = void 0;
    }
  }
  onTextChangeHandler(input, event) {
    this.emit("textchange");
  }
  onTextBlurHandler() {
    this.emit("blur");
  }
  onTextFocusHandler(e) {
    this.emit("focus");
  }
  onTapHandler() {
    Logger.getInstance().log("tap ================");
  }
  get object() {
    return this.mInputText || this.mLabel;
  }
  get text() {
    if (this.mInputText) {
      return this.mInputText.text;
    }
    return this.mLabel.text;
  }
}
