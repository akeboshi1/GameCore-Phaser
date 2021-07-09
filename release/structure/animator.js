var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PlayerState } from "./game.state";
export class Animator {
  constructor(suits) {
    __publicField(this, "AniAction");
    if (suits) {
      this.setSuits(suits);
    }
  }
  setSuits(suits) {
    if (suits) {
      this.AniAction = null;
      for (const suit of suits) {
        if (suit.suit_type === "weapon") {
          if (suit.tag) {
            this.AniAction = JSON.parse(suit.tag).action;
          }
        }
      }
    }
  }
  getAnimationName(name) {
    if (this.AniAction) {
      if (name === PlayerState.IDLE)
        return this.AniAction[0];
      else if (name === PlayerState.WALK)
        return this.AniAction[1];
    }
    return name;
  }
}
