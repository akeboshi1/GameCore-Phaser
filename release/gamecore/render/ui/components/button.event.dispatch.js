var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { BaseUI, ClickEvent } from "apowophaserui";
export class ButtonEventDispatcher extends BaseUI {
  constructor(scene, dpr, zoom, tweenBoo, music) {
    super(scene);
    __publicField(this, "soundGroup");
    __publicField(this, "mDownTime", 0);
    __publicField(this, "mPressDelay", 1e3);
    __publicField(this, "mPressTime");
    __publicField(this, "mIsMove", false);
    __publicField(this, "mIsDown");
    __publicField(this, "mRectangle");
    __publicField(this, "mTweening", false);
    __publicField(this, "tweenScale", 0.9);
    __publicField(this, "mTweenBoo", true);
    __publicField(this, "mDuration", 45);
    __publicField(this, "zoom", 1);
    this.dpr = dpr || this.dpr;
    this.zoom = zoom || this.zoom;
    this.soundGroup = {
      up: {
        key: "click"
      }
    };
    if (tweenBoo === void 0)
      tweenBoo = true;
    this.mTweenBoo = tweenBoo;
    Object.assign(this.soundGroup, music);
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
  set enable(value) {
    if (value) {
      this.addListen();
      this.setInteractive();
    } else {
      this.removeListen();
      this.removeInteractive();
    }
  }
  resize(width, height) {
    this.setSize(width, height);
    if (this.input && this.input.hitArea)
      this.input.hitArea.setSize(width, height);
  }
  onPointerMoveHandler(pointer) {
    if (this.soundGroup && this.soundGroup.move)
      this.playSound(this.soundGroup.move);
    if (!this.interactiveBoo)
      return;
    this.mIsMove = true;
    this.EventStateChange(ClickEvent.Move);
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
    const isdown = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
    this.EventStateChange(ClickEvent.Up);
    this.emit(ClickEvent.Up, this);
    if (isdown && this.mIsDown) {
      if (this.soundGroup && this.soundGroup.up)
        this.playSound(this.soundGroup.up);
      this.EventStateChange(ClickEvent.Tap);
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
    const isint = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
    if (!isint)
      this.EventStateChange(ClickEvent.Out);
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
    this.mDownTime = Date.now();
    this.mPressTime = setTimeout(() => {
      this.EventStateChange(ClickEvent.Hold);
      this.emit(ClickEvent.Hold, this);
    }, this.mPressDelay);
    if (this.mTweenBoo)
      this.tween(true);
    this.EventStateChange(ClickEvent.Down);
    this.emit(ClickEvent.Down, this);
    this.mIsDown = true;
  }
  checkPointerInBounds(gameObject, pointerx, pointery) {
    if (!this.mRectangle) {
      this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
    }
    const worldMatrix = gameObject.getWorldTransformMatrix();
    const zoom = worldMatrix.scaleX;
    this.mRectangle.left = -gameObject.width / 2;
    this.mRectangle.right = gameObject.width / 2;
    this.mRectangle.top = -gameObject.height / 2;
    this.mRectangle.bottom = gameObject.height / 2;
    const x = (pointerx - worldMatrix.tx) / zoom;
    const y = (pointery - worldMatrix.ty) / zoom;
    if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
      return true;
    }
    return false;
  }
  EventStateChange(state) {
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
      targets: this,
      duration: this.mDuration,
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
