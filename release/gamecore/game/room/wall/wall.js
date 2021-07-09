var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { BlockObject } from "../block/block.object";
import { Logger, LogicPos } from "structure";
export class Wall extends BlockObject {
  constructor(sprite, roomService) {
    super(sprite.id, roomService);
    __publicField(this, "mModel");
    __publicField(this, "mDisplayInfo");
    __publicField(this, "mId");
    this.mId = sprite.id;
    this.setModel(sprite);
  }
  startMove() {
  }
  stopMove() {
  }
  setModel(val) {
    return __async(this, null, function* () {
      this.mModel = val;
      if (!val) {
        return;
      }
      yield this.mRoomService.game.peer.render.setModel(val);
      this.load(this.mModel.displayInfo);
      this.setPosition(this.mModel.pos);
      this.setRenderable(true);
    });
  }
  updateModel(val) {
  }
  load(displayInfo) {
    this.mCreatedDisplay = false;
    this.mDisplayInfo = displayInfo;
    if (!this.mDisplayInfo) {
      return;
    }
    this.addDisplay();
  }
  play(animationName) {
    if (!this.mModel) {
      Logger.getInstance().error(`${Wall.name}: sprite is empty`);
      return;
    }
    if (this.mModel.currentAnimationName !== animationName) {
      this.mModel.currentAnimationName = animationName;
      this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
    }
  }
  setDirection(val) {
  }
  getDirection() {
    return 3;
  }
  setPosition(p) {
    const pos = this.mRoomService.transformTo90(new LogicPos(p.x, p.y, p.z));
    this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
    this.setDepth();
  }
  showNickname() {
  }
  hideNickname() {
  }
  showRefernceArea() {
  }
  hideRefernceArea() {
  }
  showEffected() {
  }
  turn() {
  }
  setAlpha(val) {
  }
  scaleTween() {
  }
  setQueue() {
  }
  completeAnimationQueue() {
  }
  update() {
  }
  mount() {
    return this;
  }
  unmount() {
    return __async(this, null, function* () {
      return this;
    });
  }
  addMount() {
    return this;
  }
  removeMount() {
    return Promise.resolve();
  }
  getInteractivePositionList() {
    return __async(this, null, function* () {
      return [];
    });
  }
  destroy() {
    this.removeDisplay();
    super.destroy();
  }
  createDisplay() {
    var __super = (key) => super[key];
    return __async(this, null, function* () {
      if (this.mCreatedDisplay)
        return;
      __super("createDisplay").call(this);
      if (!this.mDisplayInfo) {
        return;
      }
      yield this.mRoomService.game.peer.render.createTerrainDisplay(this.id, this.mDisplayInfo, this.mModel.layer);
      const currentAnimation = this.mModel.currentAnimation;
      if (currentAnimation) {
        yield this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
      }
      return this.addToBlock();
    });
  }
  addDisplay() {
    var __super = (key) => super[key];
    return __async(this, null, function* () {
      __super("addDisplay").call(this);
      const pos = this.mModel.pos;
      return this.setPosition(pos);
    });
  }
  removeDisplay() {
    this.mCreatedDisplay = false;
    return this.mRoomService.game.peer.render.removeBlockObject(this.id);
  }
  setDepth() {
  }
  get id() {
    return this.mId;
  }
  get dir() {
    return this.mDisplayInfo.avatarDir !== void 0 ? this.mDisplayInfo.avatarDir : 3;
  }
  get model() {
    return this.mModel;
  }
  set model(val) {
    this.setModel(val);
  }
  get currentAnimationName() {
    if (this.mModel) {
      return this.mModel.currentAnimationName;
    }
    return "";
  }
  get created() {
    return true;
  }
}
