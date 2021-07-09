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
import { op_def, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Player } from "../room/player/player";
import { PlayerModel } from "../room/player/player.model";
import { AvatarSuitType, EventType, PlayerState, DirectionChecker, Logger, LogicPos } from "structure";
import { LayerEnum } from "game-capsule";
import { Tool } from "utils";
import { MoveControll } from "../collsion";
const wokerfps = 30;
const interval = wokerfps > 0 ? 1e3 / wokerfps : 1e3 / 30;
export class User extends Player {
  constructor() {
    super(void 0, void 0);
    __publicField(this, "stopBoxMove", false);
    __publicField(this, "mDebugPoint", false);
    __publicField(this, "mMoveStyle", MoveStyleEnum.Null);
    __publicField(this, "mSyncTime", 0);
    __publicField(this, "mSyncDirty", false);
    __publicField(this, "mInputMask");
    __publicField(this, "mSetPostionTime", 0);
    __publicField(this, "mPreTargetID", 0);
    __publicField(this, "holdTime", 0);
    __publicField(this, "holdDelay", 80);
    __publicField(this, "mNearEle");
    this.mBlockable = false;
  }
  get nearEle() {
    return this.mNearEle;
  }
  set debugPoint(val) {
    this.mDebugPoint = val;
  }
  get debugPoint() {
    return this.mDebugPoint;
  }
  load(displayInfo, isUser = false) {
    return super.load(displayInfo, true);
  }
  addPackListener() {
  }
  removePackListener() {
  }
  enterScene(room, actor) {
    Logger.getInstance().debug("enterScene");
    if (this.moveControll) {
      this.moveControll.destroy();
      this.moveControll = null;
    }
    if (!room || !actor) {
      return;
    }
    this.mId = actor.id;
    this.mRoomService = room;
    this.mElementManager = room.playerManager;
    if (this.mRoomService.game.avatarType === op_def.AvatarStyle.SuitType) {
      if (!AvatarSuitType.hasAvatarSuit(actor["attrs"])) {
        if (!actor.avatar)
          actor.avatar = AvatarSuitType.createBaseAvatar();
      }
    }
    this.moveControll = new MoveControll(actor.id, this.mRoomService);
    this.model = new PlayerModel(actor);
    this.mRoomService.playerManager.setMe(this);
    Logger.getInstance().debug("setCameraScroller");
    this.mRoomService.game.renderPeer.setCameraScroller(actor.x, actor.y);
  }
  update(time, delta) {
    if (this.mMoving === false)
      return;
    this._doMove(time, delta);
    this.mDirty = false;
    this.mRoomService.cameraService.syncDirty = true;
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
  findPath(targets, targetId, toReverse = false) {
    return __async(this, null, function* () {
      if (!targets) {
        return;
      }
      if (this.mRootMount) {
        yield this.mRootMount.removeMount(this, targets[0]);
      }
      const pos = this.mModel.pos;
      const miniSize = this.roomService.miniSize;
      for (const target of targets) {
        if (Tool.twoPointDistance(target, pos) <= miniSize.tileWidth / 2) {
          this.mMoveData = { targetId };
          this.stopMove();
          return;
        }
      }
      const findResult = this.roomService.findPath(pos, targets, toReverse);
      if (!findResult) {
        return;
      }
      const firstPos = targets[0];
      if (findResult.length < 1) {
        this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
        return;
      }
      const path = [];
      for (const p of findResult) {
        path.push({ pos: p });
      }
      this.moveStyle = MoveStyleEnum.Astar;
      this.mMoveData = { path, targetId };
      this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_REACHABLE_AREA);
      this.moveControll.setIgnoreCollsion(true);
      this.startMove();
      this.checkDirection();
    });
  }
  moveMotion(x, y) {
    if (this.mRootMount) {
      this.mRootMount.removeMount(this, { x, y });
    }
    this.mMoveData = { path: [{ pos: new LogicPos(x, y) }] };
    this.mSyncDirty = true;
    this.moveControll.setIgnoreCollsion(false);
    this.moveStyle = MoveStyleEnum.Motion;
    this.startMove();
  }
  unmount(targetPos) {
    const mountID = this.mRootMount.id;
    this.mRootMount = null;
    this.addBody();
    this.unmountSprite(mountID, targetPos);
    return Promise.resolve(this);
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
  startMove() {
    if (!this.mMoveData)
      return;
    const path = this.mMoveData.path;
    if (path.length < 1)
      return;
    this.changeState(PlayerState.WALK);
    this.mMoving = true;
    const pos = this.getPosition();
    const angle = Math.atan2(path[0].pos.y - pos.y, path[0].pos.x - pos.x);
    const speed = this.mModel.speed * interval;
    this.moveControll.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }
  stopMove(stopPos) {
    if (!this.mMovePoints)
      this.mMovePoints = [];
    this.changeState(PlayerState.IDLE);
    this.moveControll.setVelocity(0, 0);
    this.moveStyle = MoveStyleEnum.Null;
    if (this.mMoving) {
      const pos = stopPos ? stopPos : this.mModel.pos;
      const position = op_def.PBPoint3f.create();
      position.x = pos.x;
      position.y = pos.y;
      const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF);
      const ct = pkt.content;
      ct.position = pos;
      this.mElementManager.connection.send(pkt);
    }
    this.mMovePoints = [];
    this.mMoving = false;
    this.stopActiveSprite();
  }
  move(moveData) {
    if (!this.mDebugPoint) {
      this.mRoomService.game.renderPeer.hideServerPosition();
      return;
    }
    this.mRoomService.game.renderPeer.drawServerPosition(moveData[0].x, moveData[0].y);
  }
  setQueue(animations) {
    if (this.mMoving) {
      return;
    }
    super.setQueue(animations);
  }
  requestPushBox(targetId) {
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_CLIENT_HIT_SPRITE);
    const ct = pkt.content;
    ct.targetId = targetId;
    ct.timestamp = new Date().getTime();
    ct.dir = this.mModel.direction;
    this.mElementManager.connection.send(pkt);
  }
  setRenderable(isRenderable) {
    return Promise.resolve();
  }
  clear() {
    this.holdTime = 0;
    this.removePackListener();
    super.clear();
    this.destroy();
  }
  stopActiveSprite(pos) {
    if (!this.mMoveData)
      return;
    const targetId = this.mMoveData.targetId;
    if (!targetId) {
      return;
    }
    this.activeSprite(targetId, void 0, false);
    delete this.mMoveData.targetId;
  }
  tryActiveAction(targetId, param, needBroadcast) {
    this.activeSprite(targetId, param, needBroadcast);
    this.mRoomService.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.mRoomService.game.user.id, targetId, param);
  }
  updateModel(model) {
    if (model.hasOwnProperty("inputMask")) {
      this.mInputMask = model.inputMask;
      this.mRoomService.game.renderPeer.updateInput(this.mInputMask);
    }
    super.updateModel(model, this.mRoomService.game.avatarType);
  }
  destroy() {
    this.mSetPostionTime = 0;
    super.destroy();
  }
  setPosition(pos, syncPos = false) {
    super.setPosition(pos);
    const now = new Date().getTime();
    if (now - this.mSetPostionTime > 1e3) {
      this.mSetPostionTime = now;
      this.syncCameraPosition();
    }
    if (syncPos) {
      this.syncPosition();
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
  checkNearEle(pos) {
    const x = pos.x;
    const y = pos.y;
    const ids = this.mRoomService.getInteractiveEles(x, y);
    if (!ids)
      return;
    const len = ids.length;
    const elementManager = this.mRoomService.elementManager;
    let dis = Number.MAX_VALUE;
    let mNearEle;
    const basePos = this.getPosition();
    for (let i = 0; i < len; i++) {
      const tmpIds = ids[i];
      const tmpLen = tmpIds.length;
      for (let j = 0; j < tmpLen; j++) {
        const id = tmpIds[j];
        const ele = elementManager.get(id);
        if (!ele)
          continue;
        const elePos = ele.getPosition();
        const tmpDis = Tool.twoPointDistance(elePos, basePos);
        if (dis > tmpDis) {
          dis = tmpDis;
          mNearEle = ele;
        }
      }
    }
    return mNearEle;
  }
  activeSprite(targetId, param, needBroadcast) {
    return __async(this, null, function* () {
      if (!targetId) {
        this.mPreTargetID = 0;
        return;
      }
      const ele = this.mRoomService.getElement(targetId);
      if (ele) {
        if (ele.model && ele.model.sound) {
          const key = yield this.mRoomService.game.renderPeer.url.getSound(ele.model.sound);
          this.mRoomService.game.renderPeer.playSoundByKey(key);
        }
      }
      const now = new Date().getTime();
      if (this.mPreTargetID === targetId) {
        if (now - this.holdTime < this.holdDelay) {
          this.holdTime = now;
          const txt = yield this.mRoomService.game.renderPeer.i18nString("noticeTips.quickclick");
          const tempdata = {
            text: [{ text: txt, node: void 0 }]
          };
          return;
        }
      }
      this.mPreTargetID = targetId;
      const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_ACTIVE_SPRITE);
      const content = packet.content;
      content.spriteId = targetId;
      content.param = param ? JSON.stringify(param) : "";
      content.needBroadcast = needBroadcast;
      this.mRoomService.game.connection.send(packet);
    });
  }
  unmountSprite(id, pos) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UMOUNT_SPRITE);
    const content = packet.content;
    if (!pos)
      pos = this.getPosition();
    const pos3f = op_def.PBPoint3f.create();
    pos3f.x = pos.x;
    pos3f.y = pos.y;
    pos3f.z = pos.z;
    content.pos = pos;
    content.spriteId = id;
    this.mRoomService.game.connection.send(packet);
  }
  addToBlock() {
    return this.addDisplay();
  }
  addBody() {
    this.drawBody();
  }
  syncCameraPosition() {
    this.roomService.cameraFollowHandler();
  }
  checkDirection() {
    let posA = null;
    let posB = null;
    if (this.moveStyle === MoveStyleEnum.Motion) {
      if (!this.moveData || !this.moveData.path) {
        return;
      }
      posB = this.moveData.path[0].pos;
      posA = this.moveControll.position;
    } else {
      posB = this.moveControll.position;
      posA = this.moveControll.prePosition;
    }
    const dir = DirectionChecker.check(posA, posB);
    this.setDirection(dir);
  }
  set model(val) {
    if (!val) {
      return;
    }
    if (!this.mModel) {
      this.mModel = val;
    } else {
      Object.assign(this.mModel, val);
    }
    this.mModel.off("Animation_Change", this.animationChanged, this);
    this.mModel.on("Animation_Change", this.animationChanged, this);
    if (!this.mModel.layer) {
      this.mModel.layer = LayerEnum.Surface;
    }
    this.load(this.mModel.displayInfo, this.isUser);
    if (this.mModel.pos) {
      const obj = { id: val.id, pos: val.pos, nickname: this.model.nickname, alpha: val.alpha, titleMask: val.titleMask | 65536, hasInteractive: true };
      this.mRoomService.game.renderPeer.setModel(obj);
      this.setPosition(this.mModel.pos);
    }
    this.setDirection(this.mModel.direction);
  }
  get model() {
    return this.mModel;
  }
  get package() {
    return void 0;
  }
  set package(value) {
  }
  set moveStyle(val) {
    this.mMoveStyle = val;
  }
  get moveStyle() {
    return this.mMoveStyle;
  }
  addFillEffect(pos, status) {
    const scaleRatio = this.roomService.game.scaleRatio;
    this.roomService.game.renderPeer.addFillEffect(pos.x * scaleRatio, pos.y * scaleRatio, status);
  }
}
var MoveStyleEnum;
(function(MoveStyleEnum2) {
  MoveStyleEnum2[MoveStyleEnum2["Null"] = 0] = "Null";
  MoveStyleEnum2[MoveStyleEnum2["Astar"] = 1] = "Astar";
  MoveStyleEnum2[MoveStyleEnum2["Motion"] = 2] = "Motion";
})(MoveStyleEnum || (MoveStyleEnum = {}));
