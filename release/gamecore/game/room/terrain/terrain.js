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
import { op_def } from "pixelpai_proto";
import { Logger } from "structure";
import { LayerEnum } from "game-capsule";
export class Terrain extends BlockObject {
  constructor(sprite, mElementManager) {
    super(sprite.id, mElementManager.roomService);
    this.mElementManager = mElementManager;
    __publicField(this, "mId");
    __publicField(this, "mDisplayInfo");
    __publicField(this, "mModel");
    __publicField(this, "mCreatedDisplay", false);
    __publicField(this, "mMoveData");
    __publicField(this, "mState", false);
    this.mId = sprite.id;
    this.model = sprite;
  }
  get nodeType() {
    return op_def.NodeType.TerrainNodeType;
  }
  changeDisplayData(texturePath, dataPath) {
    this.mDisplayInfo.display.texturePath = texturePath;
    if (dataPath)
      this.mDisplayInfo.display.dataPath = dataPath;
    this.changeDisplay(this.mDisplayInfo);
  }
  get state() {
    return this.mState;
  }
  set state(val) {
    this.mState = val;
  }
  get moveData() {
    return this.mMoveData;
  }
  get moving() {
    return false;
  }
  startMove() {
  }
  stopMove() {
  }
  startFireMove(pos) {
  }
  addToMap() {
    this.addToWalkableMap();
    this.addToInteractiveMap();
  }
  removeFromMap() {
    this.removeFromWalkableMap();
    this.removeFromInteractiveMap();
  }
  addToInteractiveMap() {
  }
  removeFromInteractiveMap() {
  }
  addToWalkableMap() {
    this.addBody();
    if (this.model && this.mElementManager)
      this.mElementManager.roomService.addToWalkableMap(this.model, true);
  }
  removeFromWalkableMap() {
    this.removeBody();
    if (this.model && this.mElementManager)
      this.mElementManager.roomService.removeFromWalkableMap(this.model, true);
  }
  setModel(val) {
    return __async(this, null, function* () {
      this.mModel = val;
      if (!val) {
        return;
      }
      if (!this.mModel.layer) {
        this.mModel.layer = LayerEnum.Terrain;
      }
      const area = this.mModel.getCollisionArea();
      const obj = { id: this.mModel.id, pos: this.mModel.pos, nickname: this.mModel.nickname, alpha: this.mModel.alpha, titleMask: this.mModel.titleMask | 131072 };
      yield this.mElementManager.roomService.game.renderPeer.setModel(obj);
      const obj1 = {
        id: this.mModel.id,
        point3f: this.mModel.pos,
        currentAnimationName: this.mModel.currentAnimationName,
        direction: this.mModel.direction,
        mountSprites: this.mModel.mountSprites,
        speed: this.mModel.speed,
        displayInfo: this.mModel.displayInfo
      };
      this.removeFromWalkableMap();
      this.load(this.mModel.displayInfo);
      this.setPosition(this.mModel.pos);
      this.setRenderable(true);
      this.addToWalkableMap();
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
      Logger.getInstance().error(`${Terrain.name}: sprite is empty`);
      return;
    }
    if (this.mModel.currentAnimation.name !== animationName) {
      this.removeFromWalkableMap();
      this.mModel.setAnimationName(animationName);
      this.addToWalkableMap();
      this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
    }
  }
  setDirection(val) {
    if (this.mDisplayInfo && this.mDisplayInfo.avatarDir)
      this.mDisplayInfo.avatarDir = val;
  }
  getDirection() {
    return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
  }
  setPosition(p) {
    this.mModel.setPosition(p.x, p.y);
    if (this.moveControll)
      this.moveControll.setPosition(this.mModel.pos);
    this.mRoomService.game.peer.render.setPosition(this.id, p.x, p.y, p.z);
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
    return [];
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
      const frameModel = Object.assign({}, this.mDisplayInfo);
      frameModel.animationName = this.mModel.currentAnimation.name;
      yield this.mRoomService.game.peer.render.createTerrainDisplay(this.id, frameModel, this.mModel.layer);
      return this.addToBlock();
    });
  }
  addDisplay() {
    var __super = (key) => super[key];
    return __async(this, null, function* () {
      yield __super("addDisplay").call(this);
      const pos = this.mModel.pos;
      return this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
    });
  }
  setDepth() {
  }
  setPosition45(pos) {
    if (!this.roomService) {
      Logger.getInstance().error("roomService does not exist");
      return;
    }
    const point = this.roomService.transformTo90(pos);
    this.setPosition(point);
  }
  get id() {
    return this.mId;
  }
  get dir() {
    return this.mDisplayInfo.avatarDir !== void 0 ? this.mDisplayInfo.avatarDir : 3;
  }
  get roomService() {
    if (!this.mElementManager) {
      Logger.getInstance().error("element manager is undefined");
      return;
    }
    return this.mElementManager.roomService;
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
