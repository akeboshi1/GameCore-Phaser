var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Helpers } from "game-capsule";
import { FramesModel } from "baseGame";
export class Effect {
  constructor(game, mOwnerID, bindId) {
    this.game = game;
    this.mOwnerID = mOwnerID;
    __publicField(this, "mBindId");
    __publicField(this, "mId");
    __publicField(this, "mDisplayInfo");
    this.mBindId = bindId;
    this.mId = Helpers.genId();
  }
  updateDisplayInfo(frameModel) {
    this.displayInfo = frameModel;
  }
  destroy() {
    this.game.renderPeer.removeEffect(this.mOwnerID, this.mId);
  }
  get bindId() {
    return this.mBindId;
  }
  set displayInfo(display) {
    this.mDisplayInfo = display;
    if (display instanceof FramesModel) {
      this.game.renderPeer.addEffect(this.mOwnerID, this.mId, display);
    }
    this.game.emitter.emit("updateDisplayInfo", display);
  }
  get displayInfo() {
    return this.mDisplayInfo;
  }
}
