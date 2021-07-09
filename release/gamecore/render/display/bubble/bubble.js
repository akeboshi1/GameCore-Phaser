var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { DynamicNinepatch } from "../../ui/components/dynamic.ninepatch";
import { BBCodeText } from "apowophaserui";
import { Font } from "structure";
export class Bubble extends Phaser.GameObjects.Container {
  constructor(scene, scale, url) {
    super(scene);
    this.url = url;
    __publicField(this, "mChatContent");
    __publicField(this, "mBubbleBg");
    __publicField(this, "mMinWidth", 0);
    __publicField(this, "mMinHeight", 0);
    __publicField(this, "mToY");
    __publicField(this, "mTweenCompleteCallback");
    __publicField(this, "mTweenCallContext");
    __publicField(this, "mRemoveDelay");
    __publicField(this, "mScale");
    this.mScale = scale;
  }
  show(text, bubble) {
    this.mChatContent = new BBCodeText(this.scene, 0, 0, text, {
      fontFamily: Font.DEFULT_FONT,
      fontSize: 14 * this.mScale,
      color: "#000000",
      origin: { x: 0, y: 0 },
      wrap: { width: 200 * this.mScale, mode: "character" }
    }).setOrigin(0.5, 0.5);
    this.add(this.mChatContent);
    const _minH = 50 * this.mScale;
    const _minW = 100 * this.mScale;
    this.mMinHeight = this.mChatContent.height + 30 * this.mScale;
    this.mMinHeight = this.mMinHeight < _minH ? _minH : this.mMinHeight;
    this.mMinWidth = this.mChatContent.width + 30 * this.mScale;
    this.mMinWidth = this.mMinWidth < _minW ? _minW : this.mMinWidth;
    this.y = this.mMinHeight;
    this.mBubbleBg = new DynamicNinepatch(this.scene, this);
    const path_back = bubble.bubbleResource || "platformitem/thumbnail/bubble_01.png";
    const res = this.url.getOsdRes(path_back);
    this.mBubbleBg.load(res, {
      width: this.mMinWidth / this.mScale,
      height: this.mMinHeight / this.mScale,
      key: res,
      scale: 1,
      config: {
        left: 20,
        top: 28,
        right: 20,
        bottom: 10
      }
    }, this.onComplete, this);
  }
  tweenTo(toY) {
    toY += this.mMinHeight;
    this.mToY = toY;
    this.scene.tweens.add({
      targets: this,
      y: toY,
      alpha: 1,
      duration: 200
    });
  }
  durationRemove(duration, callback, callbackContext) {
    this.mTweenCompleteCallback = callback;
    this.mTweenCallContext = callbackContext;
    this.mRemoveDelay = setTimeout(() => {
      this.removeTween();
    }, duration);
  }
  removeTween() {
    const endY = this.mToY - 30;
    const tween = this.scene.tweens.add({
      targets: this,
      y: endY,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        if (this.mTweenCompleteCallback) {
          this.mTweenCompleteCallback.call(this.mTweenCallContext, this);
        }
      }
    });
  }
  destroy() {
    this.mMinWidth = 0;
    this.mMinHeight = 0;
    this.mToY = 0;
    this.mTweenCompleteCallback = null;
    this.mTweenCallContext = null;
    if (this.mRemoveDelay) {
      clearTimeout(this.mRemoveDelay);
    }
    super.destroy(true);
  }
  onComplete(img) {
    if (img && this.scene) {
      img.scale = this.mScale;
      this.addAt(img, 0);
      img.y = -img.displayHeight >> 1;
      this.mChatContent.y = -(img.displayHeight >> 1) + 8 * this.mScale;
    }
  }
  get minWidth() {
    return this.mMinWidth;
  }
  get minHeight() {
    return this.mMinHeight;
  }
}
