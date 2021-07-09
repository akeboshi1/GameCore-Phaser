var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class TweenCompent {
  constructor(scene, gameobject, config) {
    __publicField(this, "mTweening", false);
    __publicField(this, "mScale", 1);
    __publicField(this, "mX");
    __publicField(this, "mY");
    __publicField(this, "mTween");
    __publicField(this, "mScene");
    __publicField(this, "mTarget");
    __publicField(this, "mPingpang", false);
    __publicField(this, "mTempPing", false);
    __publicField(this, "tempData");
    __publicField(this, "mOnce");
    this.mScene = scene;
    this.mTarget = gameobject;
    this.mScale = config.scale || gameobject.scale;
    this.mX = config.x === void 0 ? gameobject.x : config.x;
    this.mY = config.y === void 0 ? gameobject.y : config.y;
    this.mPingpang = config.pingpang || false;
    this.mOnce = config.once || false;
    this.tempData = { scale: gameobject.scale, x: gameobject.x, y: gameobject.y };
  }
  setObject(obj) {
    this.mTarget = obj;
  }
  zoomIn() {
    this.mTempPing = false;
    this.tween();
  }
  zoomOut(once) {
    this.mOnce = once || false;
    this.mTempPing = true;
    this.tween();
  }
  tween() {
    this.mTweening = true;
    if (this.mTween) {
      this.mTween.stop();
      this.mTween.remove();
      this.mTween = void 0;
    }
    const tempScale = this.mTempPing ? this.tempData.scale : this.mScale;
    const tempX = this.mTempPing ? this.tempData.x : this.mX;
    const tempY = this.mTempPing ? this.tempData.y : this.mY;
    this.mTween = this.mScene.tweens.add({
      targets: this.mTarget,
      x: { value: tempX, duration: 45, ease: "Bounce.easeOut" },
      y: { value: tempY, duration: 45, ease: "Bounce.easeOut" },
      scaleX: { value: tempScale, duration: 45, ease: "Bounce.easeOut" },
      scaleY: { value: tempScale, duration: 45, ease: "Bounce.easeOut" },
      onComplete: () => {
        this.tweenComplete();
      },
      onCompleteParams: [this.mTarget]
    });
  }
  tweenComplete() {
    this.mTweening = false;
    if (this.mPingpang && !this.mTempPing) {
      this.mTempPing = true;
      this.tween();
    } else {
      if (this.mTween) {
        this.mTween.stop();
        this.mTween.remove();
        this.mTween = void 0;
      }
      this.mTempPing = false;
      if (this.mOnce) {
        this.mTarget = void 0;
        this.tempData = void 0;
      }
    }
  }
}
