var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Font } from "structure";
export class TopDisplay {
  constructor(scene, owner, sceneScale, uiRatio) {
    this.scene = scene;
    __publicField(this, "mFollows");
    __publicField(this, "mOwner");
    __publicField(this, "mSceneScale");
    __publicField(this, "mUIRatio");
    this.mFollows = new Map();
    this.mOwner = owner;
    this.mSceneScale = sceneScale;
    this.mUIRatio = uiRatio;
  }
  showNickname(name) {
    if (!this.mOwner) {
      return;
    }
    let follow = this.mFollows.get(FollowEnum.Nickname);
    let nickname = null;
    if (follow) {
      nickname = follow.object;
    } else {
      nickname = this.scene.make.text({
        style: {
          fontSize: 12 * this.mSceneScale + "px",
          fontFamily: Font.DEFULT_FONT
        }
      }).setOrigin(0.5).setStroke("#000000", 2 * this.mSceneScale);
      follow = new FollowObject(nickname, this.mOwner, this.mSceneScale);
      this.mFollows.set(FollowEnum.Nickname, follow);
    }
    nickname.text = name;
    if (!this.mOwner.topPoint)
      return;
    this.addToSceneUI(nickname);
    follow.setOffset(0, this.mOwner.topPoint.y);
    follow.update();
  }
  hideNickname() {
    this.removeFollowObject(FollowEnum.Nickname);
  }
  update() {
    if (this.mFollows) {
      this.mFollows.forEach((follow) => follow.update());
    }
  }
  addToSceneUI(obj) {
    throw new Error("");
  }
  removeFollowObject(key) {
    if (!this.mFollows)
      return;
    if (this.mFollows.has(key)) {
      const follow = this.mFollows.get(key);
      if (follow) {
        follow.destroy();
        this.mFollows.delete(key);
      }
    }
  }
}
export class FollowObject {
  constructor(object, target, dpr = 1) {
    __publicField(this, "mObject");
    __publicField(this, "mTarget");
    __publicField(this, "mDpr");
    __publicField(this, "mOffset");
    this.mDpr = dpr;
    this.mOffset = new Phaser.Geom.Point();
    this.mObject = object;
    this.mTarget = target;
  }
  setOffset(x, y) {
    this.mOffset.setTo(x, y);
    this.update();
  }
  update() {
    if (!this.mTarget || !this.mObject) {
      return;
    }
    const pos = this.mTarget.getPosition();
    this.mObject.x = Math.round((pos.x + this.mOffset.x) * this.mDpr);
    this.mObject.y = Math.round((pos.y + this.mOffset.y) * this.mDpr);
  }
  remove() {
    if (!this.mObject) {
      return;
    }
    const display = this.mObject;
    if (display.parentContainer)
      display.parentContainer.remove(display);
  }
  destroy() {
    if (this.mObject)
      this.mObject.destroy();
    this.mObject = void 0;
  }
  get object() {
    return this.mObject;
  }
}
export var FollowEnum;
(function(FollowEnum2) {
  FollowEnum2[FollowEnum2["Nickname"] = 1e3] = "Nickname";
  FollowEnum2[FollowEnum2["Image"] = 1001] = "Image";
  FollowEnum2[FollowEnum2["Sprite"] = 1002] = "Sprite";
})(FollowEnum || (FollowEnum = {}));
