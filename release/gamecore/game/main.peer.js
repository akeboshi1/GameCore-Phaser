var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
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
import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { Game } from "./game";
import { Logger, EventType, LogicPos } from "structure";
for (const key in protos) {
  PBpacket.addProtocol(protos[key]);
}
export class MainPeer extends RPCPeer {
  constructor(workerName) {
    super(workerName);
    __publicField(this, "mGame");
    __publicField(this, "mRenderParam");
    __publicField(this, "mMainPeerParam");
    __publicField(this, "gameState");
    __publicField(this, "stateTime", 0);
    __publicField(this, "mConfig");
    __publicField(this, "isReady", false);
    __publicField(this, "delayTime", 15e3);
    __publicField(this, "reConnectCount", 0);
    __publicField(this, "startDelay");
    __publicField(this, "isStartUpdateFps", false);
    __publicField(this, "startUpdateFps");
    this.game = new Game(this);
    this.stateTime = new Date().getTime();
  }
  get renderParam() {
    return this.mRenderParam;
  }
  get mainPeerParam() {
    return this.mMainPeerParam;
  }
  get render() {
    return this.remote[this.mRenderParam.key][this.mRenderParam.name];
  }
  get config() {
    return this.mConfig;
  }
  get game() {
    return this.mGame;
  }
  set game(val) {
    this.mGame = val;
  }
  get state() {
    return this.game.gameStateManager.curState;
  }
  set state(val) {
    const now = new Date().getTime();
    Logger.getInstance().log("gameState: ====>", val, "delayTime:=====>", now - this.stateTime);
    this.gameState = val;
    this.stateTime = now;
  }
  onConnected(isAuto) {
    this.game.onConnected(isAuto);
  }
  onDisConnected(isAuto) {
    this.render.onDisConnected();
    this.endBeat();
    this.game.onDisConnected(isAuto);
  }
  onConnectError(error) {
    this.render.onConnectError(error);
    this.endBeat();
    this.game.onError();
  }
  onData(buffer) {
    this.game.connection.onData(buffer);
  }
  workerEmitter(eventType, data) {
    this.render.workerEmitter(eventType, data);
  }
  updateFps() {
    if (this.isStartUpdateFps)
      return;
    this.isStartUpdateFps = true;
    this.startUpdateFps = setInterval(() => {
      this.render.updateFPS();
    }, 100);
  }
  endFps() {
    if (this.startUpdateFps) {
      clearInterval(this.startUpdateFps);
      this.startUpdateFps = null;
    }
    this.render.endFPS();
  }
  startBeat() {
    if (this.startDelay)
      return;
    this.startDelay = setInterval(() => {
      if (this.reConnectCount >= 8) {
        this.game.reconnect();
        return;
      }
      this.reConnectCount++;
      const pkt = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
      this.game.socket.send(pkt.Serialization());
    }, this.delayTime);
  }
  endBeat() {
    this.reConnectCount = 0;
    if (this.startDelay) {
      clearInterval(this.startDelay);
      this.startDelay = null;
    }
    Logger.getInstance().log("heartBeat end");
  }
  clearBeat() {
    this.reConnectCount = 0;
  }
  refrehActiveUIState(panel) {
    return this.game.uiManager.refrehActiveUIState(panel);
  }
  showMovePoint(val) {
    if (this.game && this.game.user)
      this.game.user.debugPoint = val;
  }
  createGame(config) {
    this.mConfig = config;
    this.game.init(config);
    Logger.getInstance().isDebug = config.debugLog || false;
  }
  getScaleRatio() {
    return this.game.scaleRatio;
  }
  updateMoss(moss) {
    if (this.game.elementStorage)
      this.game.elementStorage.updateMoss(moss);
  }
  updatePalette(palette) {
    if (this.game.elementStorage)
      this.game.elementStorage.updatePalette(palette);
  }
  removeElement(id) {
    if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.elementManager) {
      this.game.roomManager.currentRoom.elementManager.remove(id);
    }
  }
  refreshToken() {
    this.game.refreshToken();
  }
  changePlayerState(id, state, times) {
    const playser = this.game.roomManager.currentRoom.playerManager.get(id);
    if (playser)
      playser.changeState(state, times);
  }
  setDragonBonesQueue(id, animation) {
    const dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
    if (dragonbones)
      dragonbones.setQueue(animation);
  }
  loginEnterWorld() {
    Logger.getInstance().debug("game======loginEnterWorld");
    this.game.loginEnterWorld();
  }
  closeConnect(boo) {
    if (boo)
      this.terminate();
    this.game.connection.closeConnect();
  }
  reconnect(isAuto) {
    this.game.reconnect();
  }
  refreshConnect() {
    this.game.onRefreshConnect();
  }
  onFocus() {
    this.game.onFocus();
  }
  onBlur() {
    this.game.onBlur();
  }
  setSize(width, height) {
    this.game.setSize(width, height);
  }
  setGameConfig(configStr) {
    this.game.setGameConfig(configStr);
  }
  send(buffer) {
    this.game.socket.send(buffer);
  }
  destroyClock() {
    this.game.destroyClock();
  }
  clearGameComplete() {
    this.game.clearGameComplete();
  }
  initUI() {
    if (this.game.roomManager.currentRoom)
      this.game.roomManager.currentRoom.initUI();
  }
  getActiveUIData(str) {
    return this.game.uiManager.getUIStateData(str);
  }
  startRoomPlay() {
    Logger.getInstance().debug("peer startroom");
    if (this.game.roomManager && this.game.roomManager.currentRoom)
      this.game.roomManager.currentRoom.startPlay();
  }
  onVerifiedHandler(name, idcard) {
  }
  getRoomTransformTo90(p) {
    return this.game.roomManager.currentRoom.transformTo90(p);
  }
  getCurrentRoomSize() {
    return this.game.roomManager.currentRoom.roomSize;
  }
  getCurrentRoomMiniSize() {
    return this.game.roomManager.currentRoom.miniSize;
  }
  getPlayerName(id) {
    const player = this.game.roomManager.currentRoom.playerManager.get(id);
    return player.nickname;
  }
  getPlayerAvatar() {
    if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.playerManager && this.game.roomManager.currentRoom.playerManager.actor) {
      const avatar = this.game.roomManager.currentRoom.playerManager.actor.model.avatar;
      const suits = this.game.roomManager.currentRoom.playerManager.actor.model.suits;
      return { avatar, suits };
    }
    return null;
  }
  resetGameraSize(width, height) {
    if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService)
      this.game.roomManager.currentRoom.cameraService.resetCameraSize(width, height);
  }
  syncCameraScroll() {
    if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService) {
      Logger.getInstance().debug("mainpeer====synccamerascroll");
      this.game.roomManager.currentRoom.cameraService.syncCameraScroll();
    }
  }
  sendMouseEvent(id, mouseEvent, point3f) {
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
    const content = pkt.content;
    content.id = id;
    content.mouseEvent = mouseEvent;
    content.point3f = point3f;
    this.game.connection.send(pkt);
  }
  exitUser() {
    this.game.exitUser();
  }
  displayCompleteMove(id) {
    if (!this.game.roomManager.currentRoom)
      return;
    const element = this.game.roomManager.currentRoom.playerManager.get(id);
    if (element)
      element.completeMove();
  }
  syncPosition(targetPoint) {
    this.game.user.syncPosition();
  }
  syncElementPosition(id, targetPoint) {
    if (!this.game.roomManager || this.game.roomManager.currentRoom)
      return;
    const elementManager = this.game.roomManager.currentRoom.elementManager;
    if (!elementManager)
      return;
    const ele = elementManager.get(id);
    if (!ele)
      return;
  }
  setSyncDirty(boo) {
    if (!this.game.roomManager.currentRoom)
      return;
    this.game.roomManager.currentRoom.cameraService.syncDirty = boo;
  }
  elementDisplayReady(id) {
    if (!this.game)
      return;
    if (!this.game.roomManager)
      return;
    if (!this.game.roomManager.currentRoom)
      return;
    const elementManager = this.game.roomManager.currentRoom.elementManager;
    if (elementManager)
      elementManager.onDisplayReady(id);
  }
  elementDisplaySyncReady(id) {
    const elementManager = this.game.roomManager.currentRoom.elementManager;
    if (elementManager)
      elementManager.elementDisplaySyncReady(id);
  }
  now() {
    return this.game.roomManager.currentRoom.now();
  }
  setDirection(id, direction) {
    const element = this.game.roomManager.currentRoom.playerManager.get(id);
    if (element)
      element.setDirection(direction);
  }
  getMed(name) {
    return this.game.uiManager.getMed(name);
  }
  elementsShowReferenceArea() {
    const elementManager = this.game.roomManager.currentRoom.elementManager;
    if (elementManager)
      elementManager.showReferenceArea();
  }
  elementsHideReferenceArea() {
    const elementManager = this.game.roomManager.currentRoom.elementManager;
    if (elementManager)
      elementManager.hideReferenceArea();
  }
  pushMovePoints(id, points) {
    const elementManager = this.game.roomManager.currentRoom.elementManager;
    if (elementManager) {
      const ele = elementManager.get(id);
      if (ele)
        ele.startMove(points);
    }
  }
  onTapHandler(obj) {
  }
  getCurrentRoomType() {
    return this.game.roomManager.currentRoom.sceneType;
  }
  activePlayer(id) {
    const playermgr = this.game.roomManager.currentRoom.playerManager;
    if (playermgr.has(id)) {
      this.game.emitter.emit(EventType.SCENE_INTERACTION_ELEMENT, id);
    }
  }
  getInteractivePosition(id) {
    const room = this.game.roomManager.currentRoom;
    if (!room)
      return;
    const ele = room.getElement(id);
    if (!ele)
      return;
    return ele.getInteractivePositionList();
  }
  stopSelfMove() {
    this.game.user.stopMove();
  }
  stopGuide(id) {
    if (this.game.guideWorkerManager)
      this.game.guideWorkerManager.stopGuide(id);
  }
  findPath(targets, targetId, toReverse = false) {
    if (this.game.user)
      this.game.user.findPath(targets, targetId, toReverse);
  }
  startFireMove(pointer) {
    if (this.game.user)
      this.game.user.startFireMove(pointer);
  }
  syncClock(times) {
    this.game.syncClock(times);
  }
  clearClock() {
    this.game.clearClock();
  }
  requestCurTime() {
    return new Promise((resolve, reject) => {
      this.render.getCurTime(this.game.clock.unixTime).then((t) => {
        resolve(t);
      });
    });
  }
  httpClockEnable(enable) {
    this.game.httpClock.enable = enable;
  }
  showNoticeHandler(text) {
  }
  showPanelHandler(name, data) {
    this.game.showByName(name, data);
  }
  closePanelHandler(id) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CLOSE_UI);
    const content = packet.content;
    content.uiIds = [id];
    this.game.connection.send(packet);
  }
  showMediator(name, isShow, param) {
    if (name.length === 0)
      return;
    this.game.showMediator(name, isShow, param);
  }
  exportUimanager() {
    return new Promise((resolve) => {
      this.exportProperty(this.game.uiManager, this, "uiManager").onceReady(() => {
        resolve(true);
      });
    });
  }
  hideMediator(name) {
    this.game.hideMediator(name);
  }
  renderEmitter(eventType, data) {
    this.game.emitter.emit(eventType, data);
  }
  fetchProjectionSize(id) {
    const room = this.game.roomManager.currentRoom;
    if (!room) {
      return;
    }
    const ele = room.getElement(id);
    if (!ele) {
      return;
    }
    return ele.getProjectionSize();
  }
  getClockNow() {
    return this.game.clock.unixTime;
  }
  setPosition(id, updateBoo, x, y, z) {
    const ele = this.game.roomManager.currentRoom.getElement(id);
    if (ele) {
      ele.setPosition({ x, y, z }, updateBoo);
    }
  }
  selfStartMove() {
    const user = this.game.user;
    if (user) {
      user.startMove();
    }
  }
  tryStopMove(id, interactiveBoo, targetId, stopPos) {
    if (this.game.user) {
    }
  }
  tryStopElementMove(id, points) {
    const ele = this.game.roomManager.currentRoom.elementManager.get(id);
    if (!ele)
      return;
    ele.stopMove(points);
  }
  requestPushBox(id) {
    this.game.user.requestPushBox(id);
  }
  removeMount(id, mountID, stopPos) {
    return __async(this, null, function* () {
      const room = this.game.roomManager.currentRoom;
      if (!room) {
        return Logger.getInstance().error(`room not exist`);
      }
      const ele = room.getElement(id);
      const target = room.getElement(mountID);
      if (!ele || !target) {
        return Logger.getInstance().error(`target not exist`);
      }
      return ele.removeMount(target, stopPos);
    });
  }
  stopMove(x, y) {
    this.game.user.stopMove(new LogicPos(x, y));
  }
  uploadHeadImage(url) {
    this.game.httpService.uploadHeadImage(url).then(() => {
      this.game.emitter.emit("updateDetail");
    });
  }
  uploadDBTexture(key, url, json) {
    return this.game.httpService.uploadDBTexture(key, url, json);
  }
  completeDragonBonesAnimationQueue(id) {
    const dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
    if (dragonbones)
      dragonbones.completeAnimationQueue();
  }
  completeFrameAnimationQueue(id) {
    const frames = this.game.roomManager.currentRoom.elementManager.get(id);
    if (frames)
      frames.completeAnimationQueue();
  }
  setConfig(config) {
    this.mConfig = config;
    this.game.setConfig(config);
  }
  moveMotion(x, y) {
    this.game.user.moveMotion(x, y);
  }
  terminate() {
    self.close();
  }
  destroy() {
    if (this.game)
      this.game.isDestroy = true;
    super.destroy();
  }
  isPlatform_PC() {
    return this.mConfig && this.mConfig.platform && this.mConfig.platform === "pc";
  }
}
__decorateClass([
  Export()
], MainPeer.prototype, "mGame", 2);
__decorateClass([
  Export()
], MainPeer.prototype, "updateFps", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "endFps", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "clearBeat", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "refrehActiveUIState", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], MainPeer.prototype, "showMovePoint", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "createGame", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getScaleRatio", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "updateMoss", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "updatePalette", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "removeElement", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "refreshToken", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
], MainPeer.prototype, "changePlayerState", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "setDragonBonesQueue", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "loginEnterWorld", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], MainPeer.prototype, "closeConnect", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "reconnect", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "refreshConnect", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "onFocus", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "onBlur", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], MainPeer.prototype, "setSize", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "setGameConfig", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.unit8array])
], MainPeer.prototype, "send", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "destroyClock", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "clearGameComplete", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "initUI", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "getActiveUIData", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "startRoomPlay", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
], MainPeer.prototype, "onVerifiedHandler", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getRoomTransformTo90", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getCurrentRoomSize", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getCurrentRoomMiniSize", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "getPlayerName", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getPlayerAvatar", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], MainPeer.prototype, "resetGameraSize", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "syncCameraScroll", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "sendMouseEvent", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "exitUser", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "displayCompleteMove", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "syncPosition", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "syncElementPosition", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], MainPeer.prototype, "setSyncDirty", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "elementDisplayReady", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "elementDisplaySyncReady", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "now", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], MainPeer.prototype, "setDirection", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "getMed", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "elementsShowReferenceArea", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "elementsHideReferenceArea", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "pushMovePoints", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "onTapHandler", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getCurrentRoomType", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "activePlayer", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "getInteractivePosition", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "stopSelfMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "stopGuide", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "findPath", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "startFireMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "syncClock", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "clearClock", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "requestCurTime", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], MainPeer.prototype, "httpClockEnable", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "showNoticeHandler", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "showPanelHandler", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "closePanelHandler", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.boolean])
], MainPeer.prototype, "showMediator", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "exportUimanager", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "hideMediator", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "renderEmitter", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "fetchProjectionSize", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "getClockNow", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], MainPeer.prototype, "setPosition", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "selfStartMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
], MainPeer.prototype, "tryStopMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "tryStopElementMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "requestPushBox", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "removeMount", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], MainPeer.prototype, "stopMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], MainPeer.prototype, "uploadHeadImage", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
], MainPeer.prototype, "uploadDBTexture", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "completeDragonBonesAnimationQueue", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], MainPeer.prototype, "completeFrameAnimationQueue", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "setConfig", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], MainPeer.prototype, "moveMotion", 1);
__decorateClass([
  Export()
], MainPeer.prototype, "destroy", 1);
