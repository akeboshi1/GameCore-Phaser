var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseUI, ClickEvent } from "apowophaserui";
import { UiUtils } from "utils";
import { ThreeSlicePath } from "./three.slice.path";
export var ButtonState;
(function(ButtonState2) {
  ButtonState2["Normal"] = "normal";
  ButtonState2["Over"] = "over";
  ButtonState2["Select"] = "select";
  ButtonState2["Disable"] = "disable";
})(ButtonState || (ButtonState = {}));
export class ThreeSliceButton extends BaseUI {
  constructor(scene, width, height, key, frame, downFrame, text, dpr, scale, tweenBoo, music) {
    super(scene);
    __publicField(this, "soundGroup");
    __publicField(this, "mDownTime", 0);
    __publicField(this, "mPressDelay", 1e3);
    __publicField(this, "mPressTime");
    __publicField(this, "mBackground");
    __publicField(this, "mKey");
    __publicField(this, "mFrame");
    __publicField(this, "mDownFrame");
    __publicField(this, "mText");
    __publicField(this, "mIsMove", false);
    __publicField(this, "mIsDown");
    __publicField(this, "mRectangle");
    __publicField(this, "zoom");
    __publicField(this, "mTweening", false);
    __publicField(this, "tweenScale", 0.9);
    __publicField(this, "mTweenBoo", true);
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
  addListen() {
    this.removeListen();
    this.on("pointerdown", this.onPointerDownHandler, this);
    this.on("pointerup", this.onPointerUpHandler, this);
    this.on("pointerout", this.onPointerOutHandler, this);
    this.on("pointermove", this.onPointerMoveHandler, this);
  }
  removeListen() {
    this.off("pointerdown", this.onPointerDownHandler, this);
    this.off("pointerup", this.onPointerUpHandler, this);
    this.off("pointerout", this.onPointerOutHandler, this);
    this.off("pointermove", this.onPointerMoveHandler, this);
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
      this.mBackground = new ThreeSlicePath(this.scene, 0, 0, this.width, this.height, this.mKey, this.mFrame, this.dpr, this.zoom, 4);
      this.add(this.mBackground);
    }
  }
  setBgFrame(frame) {
    if (this.mBackground) {
      this.mBackground.setFrame(frame);
    }
  }
  buttonStateChange(state) {
    switch (state) {
      case ButtonState.Normal:
        this.changeNormal();
        break;
      case ButtonState.Over:
        break;
      case ButtonState.Select:
        this.changeDown();
        break;
      case ButtonState.Disable:
        break;
    }
  }
  onPointerMoveHandler(pointer) {
    if (this.soundGroup && this.soundGroup.move)
      this.playSound(this.soundGroup.move);
    if (!this.interactiveBoo)
      return;
    this.mIsMove = true;
    this.emit(ClickEvent.Move);
  }
  onPointerUpHandler(pointer) {
    if (!this.interactiveBoo) {
      if (this.soundGroup && this.soundGroup.disabled)
        this.playSound(this.soundGroup.disabled);
      return;
    }
    if (this.mTweenBoo) {
      this.tween(false, this.pointerUp.bind(this, pointer));
    } else {
      this.pointerUp(pointer);
    }
  }
  pointerUp(pointer) {
    this.buttonStateChange(ButtonState.Normal);
    const isdown = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
    this.emit(ClickEvent.Up, this);
    if (isdown && this.mIsDown) {
      if (this.soundGroup && this.soundGroup.up)
        this.playSound(this.soundGroup.up);
      this.emit(ClickEvent.Tap, pointer, this);
    }
    clearTimeout(this.mPressTime);
    this.mIsMove = false;
    this.mIsDown = false;
    this.mDownTime = 0;
  }
  onPointerOutHandler(pointer) {
    if (this.mTweenBoo && pointer.isDown) {
      this.tween(false);
    }
  }
  onPointerDownHandler(pointer) {
    if (this.mTweening)
      return;
    if (!this.interactiveBoo) {
      if (this.soundGroup && this.soundGroup.disabled)
        this.playSound(this.soundGroup.disabled);
      return;
    }
    if (this.soundGroup && this.soundGroup.down)
      this.playSound(this.soundGroup.down);
    this.buttonStateChange(ButtonState.Select);
    this.mDownTime = Date.now();
    this.mPressTime = setTimeout(() => {
      this.emit(ClickEvent.Hold, this);
    }, this.mPressDelay);
    if (this.mTweenBoo)
      this.tween(true);
    this.emit(ClickEvent.Down, this);
    this.mIsDown = true;
  }
  checkPointerInBounds(gameObject, pointerx, pointery) {
    if (!this.mRectangle) {
      this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    }
    const zoom = this.zoom ? this.zoom : 1;
    this.mRectangle.left = -gameObject.width / 2;
    this.mRectangle.right = gameObject.width / 2;
    this.mRectangle.top = -gameObject.height / 2;
    this.mRectangle.bottom = gameObject.height / 2;
    const worldMatrix = gameObject.getWorldTransformMatrix();
    const x = (pointerx - worldMatrix.tx) / zoom;
    const y = (pointery - worldMatrix.ty) / zoom;
    if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
      return true;
    }
    return false;
  }
  tween(show, callback) {
    this.mTweening = true;
    const scale = show ? this.tweenScale : 1;
    if (this.mTween) {
      this.mTween.stop();
      this.mTween.remove();
      this.mTween = void 0;
    }
    this.mTween = this.scene.tweens.add({
      targets: this.list,
      duration: 45,
      ease: "Linear",
      props: {
        scaleX: { value: scale },
        scaleY: { value: scale }
      },
      onComplete: () => {
        this.tweenComplete(show);
        if (callback)
          callback();
      },
      onCompleteParams: [this]
    });
  }
  tweenComplete(show) {
    this.mTweening = false;
    if (this.mTween) {
      this.mTween.stop();
      this.mTween.remove();
      this.mTween = void 0;
    }
  }
}
