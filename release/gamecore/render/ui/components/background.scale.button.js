var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { ClickEvent } from "apowophaserui";
import { UiUtils } from "utils";
import { ButtonEventDispatcher } from "./button.event.dispatch";
export class BackgroundScaleButton extends ButtonEventDispatcher {
  constructor(scene, width, height, key, frame, downFrame, text, dpr, scale, tweenBoo, music) {
    super(scene, 0, 0);
    __publicField(this, "soundGroup");
    __publicField(this, "mDownTime", 0);
    __publicField(this, "mBackground");
    __publicField(this, "mKey");
    __publicField(this, "mFrame");
    __publicField(this, "mDownFrame");
    __publicField(this, "mText");
    this.dpr = dpr || UiUtils.baseDpr;
    this.zoom = scale || UiUtils.baseScale;
    this.soundGroup = {
      up: {
        key: "click"
      }
    };
    if (tweenBoo === void 0)
      tweenBoo = true;
    this.mTweenBoo = tweenBoo;
    Object.assign(this.soundGroup, music);
    this.mKey = key;
    this.mFrame = frame;
    this.mDownFrame = downFrame;
    this.setSize(width, height);
    this.createBackground();
    if (text) {
      this.mText = this.scene.make.text({ style: { color: "#ffffff", fontSize: 16 * dpr + "px" } }, false).setOrigin(0.5, 0.5).setText(text);
      if (this.mBackground) {
        this.mText.setSize(this.mBackground.width, this.mBackground.height);
      }
      this.add(this.mText);
    }
    this.setInteractive();
    this.addListen();
  }
  get background() {
    return this.mBackground;
  }
  get text() {
    return this.mText;
  }
  setEnable(value, tint = true) {
    if (value) {
      if (this.mBackground) {
        this.mBackground.clearTint();
        if (this.mText)
          this.mText.clearTint();
      }
      this.setInteractive();
    } else {
      if (this.mBackground && tint) {
        this.mBackground.setTintFill(6710886);
        if (this.mText)
          this.mText.setTintFill(7829367);
      }
      this.removeInteractive();
    }
  }
  set tweenEnable(value) {
    this.mTweenBoo = value;
  }
  mute(boo) {
    this.silent = boo;
  }
  changeNormal() {
    this.setBgFrame(this.mFrame);
  }
  changeDown() {
    if (this.mDownFrame) {
      this.setBgFrame(this.mDownFrame);
    }
  }
  setFrame(frame) {
    this.setBgFrame(frame);
  }
  setText(val) {
    if (this.mText) {
      this.mText.setText(val);
    }
  }
  setTextStyle(style) {
    if (this.mText) {
      this.mText.setStyle(style);
    }
  }
  setFontStyle(val) {
    if (this.mText) {
      this.mText.setFontStyle(val);
    }
  }
  setTextOffset(x, y) {
    if (this.mText) {
      this.mText.setPosition(x, y);
    }
  }
  setTextColor(color) {
    if (this.mText) {
      this.mText.setColor(color);
    }
  }
  setFrameNormal(normal, down) {
    this.mFrame = normal;
    this.mDownFrame = down ? down : normal;
    this.changeNormal();
    return this;
  }
  createBackground() {
    if (this.mFrame) {
      this.mBackground = this.scene.make.image({ key: this.mKey, frame: this.mFrame });
      this.mBackground.displayWidth = this.width;
      this.mBackground.displayHeight = this.height;
      this.add(this.mBackground);
    }
  }
  setBgFrame(frame) {
    if (this.mBackground) {
      this.mBackground.setFrame(frame);
      this.mBackground.displayWidth = this.width;
      this.mBackground.displayHeight = this.height;
    }
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
        this.changeNormal();
        break;
      case ClickEvent.Out:
        this.changeNormal();
        break;
    }
  }
}
