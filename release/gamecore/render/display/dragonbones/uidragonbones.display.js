var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { DragonbonesDisplay } from "./dragonbones.display";
export class UIDragonbonesDisplay extends DragonbonesDisplay {
  constructor() {
    super(...arguments);
    __publicField(this, "mInteractive", false);
    __publicField(this, "mComplHandler");
    __publicField(this, "AniAction");
    __publicField(this, "isBack", false);
  }
  play(val) {
    val.name = this.getAnimationName(val.name) + (this.isBack ? "_back" : "");
    super.play(val);
    if (this.mArmatureDisplay) {
      if (this.mArmatureDisplay.hasDBEventListener(dragonBones.EventObject.LOOP_COMPLETE)) {
        this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
      }
      if (val.times > 0) {
        this.mArmatureDisplay.addDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
      }
    }
  }
  setBack(back) {
    this.isBack = back;
  }
  setCompleteHandler(compl) {
    this.mComplHandler = compl;
  }
  setSuits(suits) {
    if (suits) {
      for (const suit of suits) {
        if (suit.suit_type === "weapon") {
          if (suit.tag) {
            this.AniAction = JSON.parse(suit.tag).action;
            return;
          }
        }
      }
    }
    this.AniAction = void 0;
  }
  getAnimationName(name) {
    if (this.AniAction) {
      if (name === "idle")
        return this.AniAction[0];
      else if (name === "walk")
        return this.AniAction[1];
    }
    return name;
  }
  get back() {
    return this.isBack;
  }
  displayCreated() {
    super.displayCreated();
    this.play({ name: "idle", flip: false });
  }
  onArmatureLoopComplete(event) {
    if (!this.mArmatureDisplay || !this.mAnimation) {
      return;
    }
    this.mArmatureDisplay.removeDBEventListener(dragonBones.EventObject.LOOP_COMPLETE, this.onArmatureLoopComplete, this);
    const queue = this.mAnimation.playingQueue;
    if (!queue || queue.name === void 0) {
      if (this.mComplHandler)
        this.mComplHandler.run();
    } else {
      const runAni = {
        name: queue.name,
        times: queue.playTimes,
        flip: this.mAnimation.flip
      };
      this.play(runAni);
    }
  }
}
