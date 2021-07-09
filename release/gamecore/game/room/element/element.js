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
import { LayerEnum } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { op_def, op_virtual_world } from "pixelpai_proto";
import {
  AvatarSuitType,
  PlayerState,
  DirectionChecker,
  Logger,
  LogicPos
} from "structure";
import { Tool } from "utils";
import { BlockObject } from "../block/block.object";
import { BaseStateManager } from "../state";
import { InputEnable } from "./input.enable";
export class Element extends BlockObject {
  constructor(sprite, mElementManager) {
    super(sprite ? sprite.id : -1, mElementManager ? mElementManager.roomService : void 0);
    this.mElementManager = mElementManager;
    __publicField(this, "mId");
    __publicField(this, "mDisplayInfo");
    __publicField(this, "mAnimationName", "");
    __publicField(this, "mMoveData", {});
    __publicField(this, "mCurState", PlayerState.IDLE);
    __publicField(this, "mOffsetY");
    __publicField(this, "mQueueAnimations");
    __publicField(this, "mMoving", false);
    __publicField(this, "mRootMount");
    __publicField(this, "mMounts");
    __publicField(this, "mDirty", false);
    __publicField(this, "mCreatedDisplay", false);
    __publicField(this, "isUser", false);
    __publicField(this, "mStateManager");
    __publicField(this, "mTopDisplay");
    __publicField(this, "mMoveDelayTime", 400);
    __publicField(this, "mMoveTime", 0);
    __publicField(this, "mMoveSyncDelay", 200);
    __publicField(this, "mMoveSyncTime", 0);
    __publicField(this, "mMovePoints");
    __publicField(this, "mTarget");
    __publicField(this, "delayTime", 1e3 / 45);
    __publicField(this, "mState", false);
    if (!sprite) {
      return;
    }
    this.mId = sprite.id;
    this.model = sprite;
  }
  get state() {
    return this.mState;
  }
  set state(val) {
    this.mState = val;
  }
  get dir() {
    return this.mDisplayInfo && this.mDisplayInfo.avatarDir !== void 0 ? this.mDisplayInfo.avatarDir : 3;
  }
  get roomService() {
    return this.mRoomService;
  }
  get id() {
    return this.mId;
  }
  get model() {
    return this.mModel;
  }
  set model(val) {
    this.setModel(val);
  }
  get moveData() {
    return this.mMoveData;
  }
  get created() {
    return this.mCreatedDisplay;
  }
  get eleMgr() {
    if (this.mElementManager) {
      return this.mElementManager;
    }
  }
  get moving() {
    return this.mMoving;
  }
  get nodeType() {
    return op_def.NodeType.ElementNodeType;
  }
  showEffected(displayInfo) {
    throw new Error("Method not implemented.");
  }
  moveMotion(x, y) {
    if (this.mRootMount) {
      this.mRootMount.removeMount(this, { x, y });
    }
    this.mMoveData = { path: [{ pos: new LogicPos(x, y) }] };
    this.moveControll.setIgnoreCollsion(false);
    this.startMove();
  }
  load(displayInfo, isUser = false) {
    return __async(this, null, function* () {
      this.mDisplayInfo = displayInfo;
      this.isUser = isUser;
      if (!displayInfo)
        return Promise.reject(`element ${this.mModel.nickname} ${this.id} display does not exist`);
      yield this.loadDisplayInfo();
      return this.addToBlock();
    });
  }
  setModel(model) {
    return __async(this, null, function* () {
      if (!model) {
        return;
      }
      model.off("Animation_Change", this.animationChanged, this);
      model.on("Animation_Change", this.animationChanged, this);
      if (!model.layer) {
        model.layer = LayerEnum.Surface;
        Logger.getInstance().warn(`${Element.name}: sprite layer is empty`);
      }
      this.mModel = model;
      this.mQueueAnimations = void 0;
      if (this.mModel.pos) {
        this.setPosition(this.mModel.pos);
      }
      this.removeFromMap();
      const area = model.getCollisionArea();
      const obj = { id: model.id, pos: model.pos, nickname: model.nickname, nodeType: model.nodeType, sound: model.sound, alpha: model.alpha, titleMask: model.titleMask | 131072, hasInteractive: model.hasInteractive };
      this.addToMap();
      this.load(this.mModel.displayInfo).then(() => this.mElementManager.roomService.game.peer.render.setModel(obj)).then(() => {
        this.setDirection(this.mModel.direction);
        if (this.mInputEnable === InputEnable.Interactive) {
          this.setInputEnable(this.mInputEnable);
        }
        if (model.mountSprites && model.mountSprites.length > 0) {
          this.updateMounth(model.mountSprites);
        }
        return this.setRenderable(true);
      }).catch((error) => {
        Logger.getInstance().error(error);
        this.mRoomService.elementManager.onDisplayReady(this.mModel.id);
      });
    });
  }
  updateModel(model, avatarType) {
    if (this.mModel.id !== model.id) {
      return;
    }
    this.removeFromMap();
    if (model.hasOwnProperty("attrs")) {
      this.mModel.updateAttr(model.attrs);
    }
    let reload = false;
    if (avatarType === op_def.AvatarStyle.SuitType) {
      if (this.mModel.updateSuits) {
        this.mModel.updateAvatarSuits(this.mModel.suits);
        if (!this.mModel.avatar)
          this.mModel.avatar = AvatarSuitType.createBaseAvatar();
        this.mModel.updateAvatar(this.mModel.avatar);
        reload = true;
      }
    } else if (avatarType === op_def.AvatarStyle.OriginAvatar) {
      if (model.hasOwnProperty("avatar")) {
        this.mModel.updateAvatar(model.avatar);
        reload = true;
      }
    }
    if (model.display && model.animations) {
      this.mModel.updateDisplay(model.display, model.animations);
      reload = true;
    }
    if (model.hasOwnProperty("currentAnimationName")) {
      this.play(model.currentAnimationName);
      this.setInputEnable(this.mInputEnable);
      this.mModel.setAnimationQueue(void 0);
    }
    if (model.hasOwnProperty("direction")) {
      this.setDirection(model.direction);
    }
    if (model.hasOwnProperty("mountSprites")) {
      const mounts = model.mountSprites;
      this.mergeMounth(mounts);
      this.updateMounth(mounts);
    }
    if (model.hasOwnProperty("speed")) {
      this.mModel.speed = model.speed;
      if (this.mMoving)
        this.startMove();
    }
    if (model.hasOwnProperty("nickname")) {
      this.mModel.nickname = model.nickname;
      this.showNickname();
    }
    if (reload)
      this.load(this.mModel.displayInfo);
    this.addToMap();
  }
  play(animationName, times) {
    if (!this.mModel) {
      Logger.getInstance().error(`${Element.name}: sprite is empty`);
      return;
    }
    this.removeFromMap();
    this.mModel.setAnimationName(animationName, times);
    const hasInteractive = this.model.hasInteractive;
    if (this.mInputEnable)
      this.setInputEnable(this.mInputEnable);
    this.addToMap();
    if (this.mRoomService) {
      if (!this.mRootMount) {
        if (times === void 0) {
        } else {
        }
        this.addBody();
      }
      this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation, void 0, times);
      this.mRoomService.game.renderPeer.setHasInteractive(this.id, hasInteractive);
    }
  }
  setQueue(animations) {
    if (!this.mModel) {
      return;
    }
    const queue = [];
    for (const animation of animations) {
      const aq = {
        name: animation.animationName,
        playTimes: animation.times
      };
      queue.push(aq);
    }
    this.mModel.setAnimationQueue(queue);
    if (queue.length > 0) {
      this.play(animations[0].animationName, animations[0].times);
    }
  }
  completeAnimationQueue() {
    const anis = this.model.animationQueue;
    if (!anis || anis.length < 1)
      return;
    anis.shift();
    let aniName = PlayerState.IDLE;
    let playTiems;
    if (anis.length > 0) {
      aniName = anis[0].name;
      playTiems = anis[0].playTimes;
    }
    this.play(aniName, playTiems);
  }
  setDirection(val) {
    if (!this.mModel) {
      return;
    }
    if (this.mDisplayInfo) {
      this.mDisplayInfo.avatarDir = val;
    }
    if (this.mModel.direction === val) {
      return;
    }
    if (this.model && !this.model.currentAnimationName) {
      this.model.currentAnimationName = PlayerState.IDLE;
    }
    if (this.model) {
      this.model.setDirection(val);
    }
    if (this.mMounts) {
      for (const mount of this.mMounts) {
        mount.setDirection(val);
      }
    }
  }
  getDirection() {
    return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
  }
  changeState(val) {
    if (this.mCurState === val)
      return;
    if (!val) {
      val = PlayerState.IDLE;
    }
    this.mCurState = val;
    this.play(this.mCurState);
  }
  getState() {
    return this.mCurState;
  }
  getRenderable() {
    return this.mRenderable;
  }
  syncPosition() {
    const userPos = this.getPosition();
    const pos = op_def.PBPoint3f.create();
    pos.x = userPos.x;
    pos.y = userPos.y;
    const movePoint = op_def.MovePoint.create();
    movePoint.pos = pos;
    movePoint.timestamp = Date.now();
    if (!this.mMovePoints)
      this.mMovePoints = [];
    this.mMovePoints.push(movePoint);
  }
  update(time, delta) {
    if (this.mMoving === false)
      return;
    this._doMove(time, delta);
    this.mDirty = false;
    if (!this.mRoomService.playerManager.actor.stopBoxMove)
      return;
    const now = Date.now();
    this.mMoveSyncTime += delta;
    if (this.mMoveSyncTime >= this.mMoveSyncDelay) {
      this.mMoveSyncTime = 0;
      this.syncPosition();
    }
    if (!this.mMovePoints || this.mMovePoints.length < 1) {
      this.mMoveTime = now;
      return;
    }
    if (now - this.mMoveTime > this.mMoveDelayTime) {
      const movePath = op_def.MovePath.create();
      movePath.id = this.id;
      movePath.movePos = this.mMovePoints;
      const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
      const content = packet.content;
      content.movePath = movePath;
      this.mRoomService.game.connection.send(packet);
      this.mMovePoints.length = 0;
      this.mMovePoints = [];
      this.mMoveTime = now;
    }
  }
  fire(id, pos) {
    if (!this.mMounts)
      return;
    const len = this.mMounts.length;
    for (let i = 0; i < len; i++) {
      const mount = this.mMounts[i];
      if (mount && mount.id === id) {
        mount.startFireMove(pos);
        break;
      }
    }
  }
  startFireMove(pos) {
    return __async(this, null, function* () {
      if (this.mTarget) {
        yield this.removeMount(this.mTarget);
        this.mRoomService.game.renderPeer.startFireMove(this.mTarget.id, pos);
        this.mTarget = null;
      }
    });
  }
  move(path) {
    if (!this.mElementManager) {
      return;
    }
    this.mMoveData.path = path;
    this.startMove();
  }
  startMove(points) {
    if (points && this.mRoomService.playerManager.actor.stopBoxMove) {
      this._startMove(points);
      return;
    }
    if (!this.mMoveData) {
      return;
    }
    const path = this.mMoveData.path;
    if (!path || path.length < 1) {
      return;
    }
    this.mMoving = true;
    if (!this.moveControll) {
      return;
    }
    const pos = this.moveControll.position;
    const pathData = path[0];
    const pathPos = pathData.pos;
    const angle = Math.atan2(pathPos.y - pos.y, pathPos.x - pos.x);
    const speed = this.mModel.speed * this.delayTime;
    this.moveControll.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    const dir = DirectionChecker.check(pos, pathPos);
    this.setDirection(dir);
    this.changeState(PlayerState.WALK);
  }
  stopMove(stopPos) {
    if (!this.mMovePoints)
      this.mMovePoints = [];
    this.mMoving = false;
    this.moveControll.setVelocity(0, 0);
    this.changeState(PlayerState.IDLE);
    if (!this.mRoomService.playerManager.actor.stopBoxMove)
      return;
    Logger.getInstance().log("============>>>>> element stop: ", this.mModel.nickname, this.mModel.pos.x, this.mModel.pos.y);
    this.mMovePoints = [];
    this.mRoomService.playerManager.actor.stopBoxMove = false;
  }
  getPosition() {
    let pos;
    const p = super.getPosition();
    pos = new LogicPos(p.x, p.y, p.z);
    return pos;
  }
  setPosition(p, syncPos = false) {
    if (!this.mElementManager) {
      return;
    }
    if (p) {
      this.mModel.setPosition(p.x, p.y);
      if (this.moveControll)
        this.moveControll.setPosition(this.mModel.pos);
    }
  }
  getRootPosition() {
    return this.mModel.pos;
  }
  showBubble(text, setting) {
    this.mRoomService.game.renderPeer.showBubble(this.id, text, setting);
  }
  clearBubble() {
    this.mRoomService.game.renderPeer.clearBubble(this.id);
  }
  showNickname() {
    if (!this.mModel)
      return;
    this.mRoomService.game.renderPeer.showNickname(this.id, this.mModel.nickname);
  }
  hideNickname() {
  }
  showTopDisplay(data) {
    this.mTopDisplay = data;
    if (this.mCreatedDisplay)
      this.mRoomService.game.renderPeer.showTopDisplay(this.id, data);
  }
  removeTopDisplay() {
  }
  showRefernceArea(conflictMap) {
    const area = this.mModel.getCollisionArea();
    const origin = this.mModel.getOriginPoint();
    if (!area || !origin)
      return;
    this.mRoomService.game.renderPeer.showRefernceArea(this.id, area, origin, conflictMap);
  }
  hideRefernceArea() {
    this.mRoomService.game.renderPeer.hideRefernceArea(this.id);
  }
  getInteractivePositionList() {
    const interactives = this.mModel.getInteractive();
    if (!interactives || interactives.length < 1) {
      return;
    }
    const pos45 = this.mRoomService.transformToMini45(this.getPosition());
    const result = [];
    for (const interactive of interactives) {
      if (this.mRoomService.isWalkable(pos45.x + interactive.x, pos45.y + interactive.y)) {
        result.push(this.mRoomService.transformToMini90(new LogicPos(pos45.x + interactive.x, pos45.y + interactive.y)));
      }
    }
    return result;
  }
  get nickname() {
    return this.mModel.nickname;
  }
  turn() {
    if (!this.mModel) {
      return;
    }
    this.mModel.turn();
    this.play(this.model.currentAnimationName);
  }
  setAlpha(val) {
    this.roomService.game.renderPeer.changeAlpha(this.id, val);
  }
  mount(root) {
    this.mRootMount = root;
    if (this.mMoving) {
      this.stopMove();
    }
    this.mDirty = true;
    this.removeFromMap();
    this.removeBody();
    return this;
  }
  unmount() {
    return __async(this, null, function* () {
      if (this.mRootMount) {
        const pos = this.mRootMount.getPosition();
        this.mRootMount = null;
        this.setPosition(pos, true);
        this.addToMap();
        this.addBody();
        yield this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y);
        this.mDirty = true;
      }
      return this;
    });
  }
  addMount(ele, index) {
    if (!this.mMounts)
      this.mMounts = [];
    ele.mount(this);
    this.mRoomService.game.renderPeer.mount(this.id, ele.id, index);
    if (this.mMounts.indexOf(ele) === -1) {
      this.mMounts.push(ele);
    }
    return this;
  }
  removeMount(ele, targetPos) {
    return __async(this, null, function* () {
      const index = this.mMounts.indexOf(ele);
      if (index === -1) {
        return Promise.resolve();
      }
      this.mMounts.splice(index, 1);
      yield ele.unmount(targetPos);
      if (!this.mMounts)
        return Promise.resolve();
      this.mRoomService.game.renderPeer.unmount(this.id, ele.id, ele.getPosition());
      return Promise.resolve();
    });
  }
  getDepth() {
    let depth = 0;
    if (this.model && this.model.pos) {
      depth = this.model.pos.depth ? this.model.pos.depth : 0;
    }
    return depth;
  }
  asociate() {
    const model = this.mModel;
    if (model.mountSprites && model.mountSprites.length > 0) {
      this.updateMounth(model.mountSprites);
    }
  }
  addToMap() {
    this.addToWalkableMap();
    this.addToInteractiveMap();
  }
  removeFromMap() {
    this.removeFromWalkableMap();
    this.removeFromInteractiveMap();
  }
  addToWalkableMap() {
    if (this.mRootMount)
      return;
    if (this.model && this.mElementManager)
      this.mElementManager.roomService.addToWalkableMap(this.model);
  }
  removeFromWalkableMap() {
    if (this.model && this.mElementManager)
      this.mElementManager.roomService.removeFromWalkableMap(this.model);
  }
  addToInteractiveMap() {
    if (this.mRootMount)
      return;
    if (this.model && this.mElementManager)
      this.mElementManager.roomService.addToInteractiveMap(this.model);
  }
  removeFromInteractiveMap() {
    if (this.model && this.mElementManager)
      this.mElementManager.roomService.removeFromInteractiveMap(this.model);
  }
  setState(stateGroup) {
    if (!this.mStateManager)
      this.mStateManager = new BaseStateManager(this.mRoomService);
    this.mStateManager.setState(stateGroup);
  }
  destroy() {
    this.mCreatedDisplay = false;
    if (this.mMoveData && this.mMoveData.path) {
      this.mMoveData.path.length = 0;
      this.mMoveData.path = [];
      this.mMoveData = null;
    }
    if (this.mStateManager) {
      this.mStateManager.destroy();
      this.mStateManager = null;
    }
    this.removeDisplay();
    super.destroy();
  }
  _doMove(time, delta) {
    this.moveControll.update(time, delta);
    const pos = this.moveControll.position;
    this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y);
    if (!this.mMoveData)
      return;
    const path = this.mMoveData.path;
    if (!path || !path[0])
      return;
    const pathData = path[0];
    if (!pathData)
      return;
    const pathPos = pathData.pos;
    const speed = this.mModel.speed * delta * 1.5;
    if (Tool.twoPointDistance(pos, pathPos) <= speed) {
      if (path.length > 1) {
        path.shift();
        this.startMove();
      } else {
        this.stopMove();
      }
    } else {
      this.checkDirection();
    }
  }
  createDisplay() {
    var __super = (key) => super[key];
    return __async(this, null, function* () {
      if (this.mCreatedDisplay) {
        Logger.getInstance().debug("mCreatedDisplay", this.id);
        return;
      }
      __super("createDisplay").call(this);
      if (!this.mDisplayInfo || !this.mElementManager) {
        Logger.getInstance().debug("no displayInfo", this);
        return;
      }
      let createPromise = null;
      if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
        if (this.isUser) {
          createPromise = this.mElementManager.roomService.game.peer.render.createUserDragonBones(this.mDisplayInfo, this.mModel.layer);
        } else {
          createPromise = this.mElementManager.roomService.game.peer.render.createDragonBones(this.id, this.mDisplayInfo, this.mModel.layer, this.mModel.nodeType);
        }
      } else {
        createPromise = this.mElementManager.roomService.game.peer.render.createFramesDisplay(this.id, this.mDisplayInfo, this.mModel.layer);
      }
      this.mElementManager.roomService.game.renderPeer.editorModeDebugger.getIsDebug().then((isDebug) => {
        if (isDebug)
          this.showRefernceArea();
      });
      createPromise.then(() => {
        const pos = this.mModel.pos;
        this.mElementManager.roomService.game.peer.render.setPosition(this.id, pos.x, pos.y);
        if (currentAnimation)
          this.mElementManager.roomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
      }).catch((error) => {
        Logger.getInstance().error("promise error ====>", error);
      });
      const currentAnimation = this.mModel.currentAnimation;
      if (this.mInputEnable)
        this.setInputEnable(this.mInputEnable);
      if (this.mTopDisplay)
        this.showTopDisplay(this.mTopDisplay);
      this.addBody();
      this.roomService.game.emitter.emit("ElementCreated", this.id);
      return Promise.resolve();
    });
  }
  loadDisplayInfo() {
    this.mRoomService.game.emitter.once("dragonBones_initialized", this.onDisplayReady, this);
    const id = this.mDisplayInfo.id || this.mModel.displayInfo.id;
    const discriminator = this.mDisplayInfo.discriminator || this.mModel.displayInfo.discriminator;
    const eventName = this.mDisplayInfo.eventName || this.mModel.displayInfo.eventName;
    const avatarDir = this.mDisplayInfo.avatarDir || this.mModel.displayInfo.avatarDir;
    const animationName = this.mDisplayInfo.animationName || this.mModel.displayInfo.animationName;
    const sound = this.mDisplayInfo.sound || void 0;
    const obj = {
      discriminator,
      id,
      eventName,
      avatarDir,
      animationName,
      avatar: void 0,
      gene: void 0,
      type: "",
      sound,
      display: null,
      animations: void 0
    };
    if (discriminator === "DragonbonesModel") {
      obj.avatar = this.mDisplayInfo.avatar || this.mModel.displayInfo.avatar;
    } else {
      obj.gene = this.mDisplayInfo.type || this.mModel.displayInfo.gene;
      obj.type = this.mDisplayInfo.type || this.mModel.displayInfo.type;
      obj.display = this.mDisplayInfo.display || this.mModel.displayInfo.avatar;
      obj.animations = this.mDisplayInfo.animations || this.mModel.displayInfo.animations;
    }
    return this.mRoomService.game.renderPeer.updateModel(this.id, obj);
  }
  onDisplayReady() {
    if (this.mModel.mountSprites && this.mModel.mountSprites.length > 0) {
      this.updateMounth(this.mModel.mountSprites);
    }
    let depth = 0;
    if (this.model && this.model.pos) {
      depth = this.model.pos.depth ? this.model.pos.depth : 0;
    }
  }
  addDisplay() {
    var __super = (key) => super[key];
    return __async(this, null, function* () {
      if (this.mCreatedDisplay)
        return;
      __super("addDisplay").call(this);
      let depth = 0;
      if (this.model && this.model.pos) {
        depth = this.model.pos.depth ? this.model.pos.depth : 0;
      }
      return Promise.resolve();
    });
  }
  removeDisplay() {
    var __super = (key) => super[key];
    return __async(this, null, function* () {
      __super("removeDisplay").call(this);
      return Promise.resolve();
    });
  }
  setDepth(depth) {
    if (!this.mElementManager)
      return;
    this.mElementManager.roomService.game.peer.render.setLayerDepth(true);
  }
  get offsetY() {
    if (this.mOffsetY === void 0) {
      if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
        return 0;
      }
      this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
    }
    return 0;
  }
  addToBlock() {
    if (!this.mDisplayInfo)
      return Promise.resolve();
    return super.addToBlock();
  }
  checkDirection() {
  }
  calculateDirectionByAngle(angle) {
    let direction = -1;
    if (angle > 90) {
      direction = 3;
    } else if (angle >= 0) {
      direction = 5;
    } else if (angle >= -90) {
      direction = 7;
    } else {
      direction = 1;
    }
    return direction;
  }
  mergeMounth(mounts) {
    const oldMounts = this.mModel.mountSprites || [];
    const room = this.mRoomService;
    for (const id of oldMounts) {
      if (mounts.indexOf(id) === -1) {
        const ele = room.getElement(id);
        if (ele) {
          this.removeMount(ele, this.mModel.pos);
        }
      }
    }
  }
  updateMounth(mounts) {
    const room = this.mRoomService;
    if (mounts.length > 0) {
      for (let i = 0; i < mounts.length; i++) {
        const ele = room.getElement(mounts[i]);
        if (ele) {
          this.addMount(ele, i);
        }
      }
    }
    this.mModel.mountSprites = mounts;
  }
  animationChanged(data) {
    this.mElementManager.roomService.game.renderPeer.displayAnimationChange(data);
  }
  drawBody() {
    if (this.mRootMount) {
      this.moveControll.removePolygon();
      return;
    }
    super.drawBody();
  }
  _startMove(points) {
    const _points = [];
    points.forEach((pos) => {
      const movePoint = op_def.MovePoint.create();
      const tmpPos = op_def.PBPoint3f.create();
      tmpPos.x = pos.x;
      tmpPos.y = pos.y;
      movePoint.pos = tmpPos;
      movePoint.timestamp = new Date().getTime();
      _points.push(movePoint);
    });
    const movePath = op_def.MovePath.create();
    movePath.id = this.id;
    movePath.movePos = _points;
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
    const content = packet.content;
    content.movePath = movePath;
    this.mRoomService.game.connection.send(packet);
  }
}
