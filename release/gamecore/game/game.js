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
import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_def, op_client, op_virtual_world, op_gateway } from "pixelpai_proto";
import { Capsule } from "game-capsule";
import { load, HttpLoadManager } from "utils";
const IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT = op_gateway.IOP_CLIENT_REQ_VIRTUAL_WORLD_PLAYER_INIT;
import { Connection } from "./net/connection";
import { Clock } from "./loop/clock/clock";
import { HttpService } from "./loop/httpClock/http.service";
import { LoadingManager } from "./loading/loading.manager";
import { GameState, LoadState, Logger } from "structure";
import { RoomManager } from "./room/room.manager";
import { User } from "./actor/user";
import { NetworkManager } from "./command";
import { ConfigPath } from "./config/config/config";
import { ElementStorage } from "baseGame";
import { BaseDataControlManager } from "./config";
import { GuideWorkerManager } from "./guide.manager";
import { SoundWorkerManager } from "./sound.manager";
import { GameStateManager } from "./state/game.state.manager";
export const fps = 30;
export const interval = fps > 0 ? 1e3 / fps : 1e3 / 30;
export class Game extends PacketHandler {
  constructor(peer) {
    super();
    __publicField(this, "isDestroy", false);
    __publicField(this, "isAuto", true);
    __publicField(this, "mainPeer");
    __publicField(this, "connect");
    __publicField(this, "mUser");
    __publicField(this, "mSize");
    __publicField(this, "mClock");
    __publicField(this, "mHttpClock");
    __publicField(this, "mHttpService");
    __publicField(this, "mConfig");
    __publicField(this, "mDataControlManager");
    __publicField(this, "mGuideWorkerManager");
    __publicField(this, "mRoomManager");
    __publicField(this, "mElementStorage");
    __publicField(this, "mUIManager");
    __publicField(this, "mSoundManager");
    __publicField(this, "mLoadingManager");
    __publicField(this, "mNetWorkManager");
    __publicField(this, "mHttpLoadManager");
    __publicField(this, "mGameStateManager");
    __publicField(this, "mGameConfigUrls", new Map());
    __publicField(this, "mGameConfigUrl");
    __publicField(this, "mGameConfigState", new Map());
    __publicField(this, "isPause", false);
    __publicField(this, "mDebugReconnect", true);
    __publicField(this, "mMoveStyle");
    __publicField(this, "mReconnect", 0);
    __publicField(this, "hasClear", false);
    __publicField(this, "currentTime", 0);
    __publicField(this, "mHeartBeat");
    __publicField(this, "mHeartBeatDelay", 1e3);
    __publicField(this, "mAvatarType");
    __publicField(this, "mRunning", true);
    __publicField(this, "remoteIndex", 0);
    __publicField(this, "isSyncPackage", false);
    __publicField(this, "mConfigPath");
    this.mainPeer = peer;
    this.boot();
  }
  setConfigPath(path) {
    this.mConfigPath = {
      notice_url: path.notice_url
    };
  }
  init(config) {
    this.mGameStateManager.state = GameState.Init;
    this.mGameStateManager.startRun(config);
  }
  login() {
    this.mGameStateManager.state = GameState.Login;
    this.mGameStateManager.startRun();
  }
  startConnect() {
    this.mGameStateManager.refreshStateTime();
    this.mGameStateManager.state = GameState.Connecting;
    this.mGameStateManager.startRun();
  }
  onConnected(isAuto) {
    this.mGameStateManager.update(isAuto);
  }
  loginEnterWorld() {
    return __async(this, null, function* () {
      this.mGameStateManager.state = GameState.EnterWorld;
      this.mGameStateManager.startRun();
    });
  }
  v() {
    this.debugReconnect = true;
  }
  q() {
    this.debugReconnect = false;
  }
  addPacketListener() {
    if (this.connect)
      this.connect.addPacketListener(this);
  }
  removePacketListener() {
    if (this.connect)
      this.connect.removePacketListener(this);
  }
  createGame(config) {
    return __async(this, null, function* () {
      this.setConfig(config);
      yield this.initWorld();
      this.hasClear = false;
    });
  }
  setConfig(config) {
    this.mConfig = config;
    if (config.config_root) {
      ConfigPath.ROOT_PATH = config.config_root;
      this.debugReconnect = config.debugReconnect;
    }
  }
  showLoading(data) {
    this.mainPeer.render.showLoading(data);
  }
  onDisConnected(isAuto) {
    if (!this.debugReconnect)
      return;
    const stateKey = this.peer.state.key;
    if (stateKey === GameState.ChangeGame || stateKey === GameState.OffLine)
      return;
    Logger.getInstance().debug("app connectFail=====");
    this.isAuto = isAuto;
    if (!this.isAuto)
      return;
    if (this.mConfig.hasConnectFail) {
      return this.mainPeer.render.connectFail();
    } else {
      this.renderPeer.showAlert("\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5", true, false).then(() => {
        this.renderPeer.hidden();
      });
    }
  }
  onRefreshConnect(isAuto) {
    this.isAuto = isAuto;
    if (!this.isAuto)
      return;
    Logger.getInstance().debug("game onrefreshconnect");
    if (this.mConfig.hasConnectFail) {
      Logger.getInstance().debug("app connectfail");
      this.onError();
    } else {
      this.clearGame().then(() => {
        Logger.getInstance().debug("clearGame");
        this.createGame(this.mConfig);
      });
    }
  }
  onError() {
    if (!this.isAuto)
      return;
    Logger.getInstance().debug("socket error");
    if (this.mReconnect > 2) {
      return;
    }
    if (!this.connect.connect) {
      if (this.mConfig.hasConnectFail) {
        Logger.getInstance().debug("app connectFail");
        return this.mainPeer.render.connectFail();
      } else {
        Logger.getInstance().debug("reconnect");
        this.reconnect();
      }
    }
  }
  reconnect() {
    return __async(this, null, function* () {
      if (!this.isAuto)
        return;
      this.manualReconnect();
    });
  }
  manualReconnect() {
    return __async(this, null, function* () {
      if (!this.debugReconnect)
        return;
      Logger.getInstance().debug("game reconnect");
      if (this.mConfig.hasConnectFail)
        return this.mainPeer.render.connectFail();
      let gameID = this.mConfig.game_id;
      let virtualWorldId = this.mConfig.virtual_world_id;
      const worldId = this.mConfig.world_id;
      const account = yield this.mainPeer.render.getAccount();
      if (account.gameID && account.virtualWorldId) {
        gameID = account.gameID;
        virtualWorldId = account.virtualWorldId;
      }
      this._createAnotherGame(gameID, virtualWorldId, null, null, null, worldId);
    });
  }
  exitUser() {
    this.mConfig.token_expire = this.mConfig.token_fingerprint = this.mConfig.user_id = this.mConfig.auth_token = null;
    this.renderPeer.destroyAccount().then(() => {
      this._createAnotherGame(this.mConfig.game_id, this.mConfig.virtual_world_id, null, null);
    });
  }
  onClientErrorHandler(packet) {
    const content = packet.content;
    switch (content.responseStatus) {
      case op_def.ResponseStatus.REQUEST_UNAUTHORIZED:
        this.renderPeer.showAlert("\u767B\u9646\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u9646", true, false).then(() => {
          this.renderPeer.hidden();
        });
        break;
    }
    const errorLevel = content.errorLevel;
    const msg = content.msg;
    if (errorLevel >= op_def.ErrorLevel.SERVICE_GATEWAY_ERROR && this.debugReconnect) {
      let str = msg;
      if (msg.length > 100)
        str = msg.slice(0, 99);
      this.renderPeer.showAlert(str, true, false).then(() => {
      });
    } else {
    }
    Logger.getInstance().log(`Remote Trace[${content.responseStatus}]: ${msg}`);
  }
  destroyClock() {
    if (this.mClock) {
      this.mClock.destroy();
      this.mClock = null;
    }
  }
  loadTotalSceneConfig() {
    if (!this.gameConfigUrls)
      return;
    this.gameConfigUrls.forEach((remotePath) => {
      if (!this.mGameConfigState.get(remotePath)) {
        const url = ConfigPath.getSceneConfigUrl(remotePath);
        return load(url, "arraybuffer").then((req) => {
          Logger.getInstance().debug("start decodeConfig");
        }, (reason) => {
          Logger.getInstance().error("reload res ====>", reason, "reload count ====>", this.remoteIndex);
        });
      }
    });
  }
  clearGameComplete() {
    this.initWorld();
  }
  setSize(width, height) {
    this.mSize = {
      width,
      height
    };
  }
  getSize() {
    return this.mSize;
  }
  setGameConfig(config) {
    this.mConfig = config;
  }
  getGameConfig() {
    return this.mConfig;
  }
  getDataMgr(type) {
    return !this.dataControlManager ? null : this.dataControlManager.getDataMgr(type);
  }
  clearClock() {
    if (this.mClock) {
      this.mClock.destroy();
      this.mClock = null;
    }
    this.mClock = new Clock(this.connect, this.mainPeer, this);
  }
  roomResume(roomID) {
    this.mainPeer.render.roomResume(roomID);
  }
  roomPause(roomID) {
    this.mainPeer.render.roomPause(roomID);
  }
  setCamerasBounds(x, y, width, height) {
    this.mainPeer.render.setCamerasBounds(x, y, width, height);
  }
  getConfigUrl(sceneId) {
    return this.gameConfigUrls.get(sceneId);
  }
  onClockReady() {
    this.mainPeer.render.onClockReady();
  }
  syncClock(times = 1) {
    this.mClock.sync(times);
  }
  set moveStyle(moveStyle) {
    this.mMoveStyle = moveStyle;
    this.mainPeer.render.setMoveStyle(moveStyle);
  }
  get moveStyle() {
    return this.mMoveStyle;
  }
  get scaleRatio() {
    return this.mConfig.scale_ratio;
  }
  get debugReconnect() {
    return this.mDebugReconnect;
  }
  set debugReconnect(val) {
    this.mDebugReconnect = val;
  }
  get httpService() {
    return this.mHttpService;
  }
  get peer() {
    return this.mainPeer;
  }
  get connection() {
    return this.connect;
  }
  get socket() {
    return this.connect.socket;
  }
  get uiManager() {
    return this.mUIManager;
  }
  get soundManager() {
    return this.mSoundManager;
  }
  get clock() {
    return this.mClock;
  }
  set clock(val) {
    this.mClock = val;
  }
  get httpClock() {
    return this.mHttpClock;
  }
  set httpClock(val) {
    this.mHttpClock = val;
  }
  get elementStorage() {
    return this.mElementStorage;
  }
  get roomManager() {
    return this.mRoomManager;
  }
  get guideWorkerManager() {
    return this.mGuideWorkerManager;
  }
  get loadingManager() {
    return this.mLoadingManager;
  }
  get dataControlManager() {
    return this.mDataControlManager;
  }
  get gameConfigUrl() {
    return this.mGameConfigUrl;
  }
  set gameConfigUrl(val) {
    this.mGameConfigUrl = val;
  }
  get gameConfigUrls() {
    return this.mGameConfigUrls;
  }
  get gameConfigState() {
    return this.mGameConfigState;
  }
  get httpLoaderManager() {
    return this.mHttpLoadManager;
  }
  get emitter() {
    if (!this.mDataControlManager)
      return void 0;
    return this.mDataControlManager.emitter;
  }
  get user() {
    return this.mUser;
  }
  get renderPeer() {
    const render = this.peer.render;
    if (!render) {
      throw new Error("can't find render");
    }
    return render;
  }
  get gameStateManager() {
    return this.mGameStateManager;
  }
  get avatarType() {
    return this.mAvatarType;
  }
  onFocus() {
    this.mRunning = true;
    this.connect.onFocus();
    if (this.connection) {
      if (!this.connection.connect) {
        if (this.mConfig.hasConnectFail) {
          return this.mainPeer.render.connectFail();
        } else {
          return this.onDisConnected();
        }
      }
      const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
      const context = pkt.content;
      context.gameStatus = op_def.GameStatus.Focus;
      this.connection.send(pkt);
      this.mClock.sync(-1);
    } else {
      Logger.getInstance().error("connection is undefined");
      return this.onDisConnected();
    }
  }
  onBlur() {
    this.currentTime = 0;
    this.mRunning = false;
    this.connect.onBlur();
    Logger.getInstance().debug("#BlackSceneFromBackground; world.onBlur()");
    if (this.connection) {
      const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
      const context = pkt.content;
      context.gameStatus = op_def.GameStatus.Blur;
      this.connection.send(pkt);
    } else {
      Logger.getInstance().error("connection is undefined");
    }
  }
  refreshToken() {
    return __async(this, null, function* () {
      const token = yield this.peer.render.getLocalStorage("token");
      const account = token ? JSON.parse(token) : null;
      if (!account || !account.accessToken) {
        this.login();
        return;
      }
      this.httpService.refreshToekn(account.refreshToken, account.accessToken).then((response) => {
        if (response.code === 200) {
          this.peer.render.refreshAccount(response);
          this.loginEnterWorld();
        } else {
          this.login();
        }
      }).catch((error) => {
        Logger.getInstance().error("refreshToken:", error);
        this.login();
      });
    });
  }
  leaveRoom(room) {
  }
  showByName(name, data) {
  }
  showMediator(name, isShow, param) {
    if (!this.mUIManager)
      return;
    if (isShow) {
      this.mUIManager.showMed(name, param);
    } else {
      this.mUIManager.hideMed(name);
    }
  }
  hideMediator(name) {
    if (!this.mUIManager)
      return;
    this.mUIManager.hideMed(name);
  }
  loadJson() {
    this.mLoadingManager.start(LoadState.LOADJSON);
  }
  preloadGameConfig() {
    return void 0;
  }
  initWorld() {
    return __async(this, null, function* () {
      this.createUser();
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PING, this.onClientPingHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GAME_MODE, this.onAvatarGameModeHandler);
      this.createManager();
      const gameID = this.mConfig.game_id;
      const worldId = this.mConfig.virtual_world_id;
      if (typeof gameID !== "string") {
        Logger.getInstance().error("gameID is not string");
      }
      if (typeof worldId !== "string") {
        Logger.getInstance().error("worldId is not string");
      }
      yield this.mainPeer.render.createAccount(this.mConfig.game_id + "", this.mConfig.virtual_world_id + "");
    });
  }
  createUser() {
    this.mUser = new User();
  }
  createManager() {
    return __async(this, null, function* () {
      if (!this.mRoomManager)
        this.mRoomManager = new RoomManager(this);
      if (!this.mGuideWorkerManager)
        this.mGuideWorkerManager = new GuideWorkerManager(this);
      if (!this.mUIManager)
        this.mUIManager = new UIManager(this);
      if (!this.mHttpService)
        this.mHttpService = new HttpService(this);
      if (!this.mSoundManager)
        this.mSoundManager = new SoundWorkerManager(this);
      if (!this.mLoadingManager)
        this.mLoadingManager = new LoadingManager(this);
      if (!this.mDataControlManager)
        this.mDataControlManager = new BaseDataControlManager(this);
      if (!this.mNetWorkManager)
        this.mNetWorkManager = new NetworkManager(this);
      if (!this.mHttpLoadManager)
        this.mHttpLoadManager = new HttpLoadManager();
      this.mUIManager.addPackListener();
      this.mRoomManager.addPackListener();
      this.mGuideWorkerManager.addPackListener();
      this.user.addPackListener();
      this.mSoundManager.addPackListener();
      const resPath = yield this.renderPeer.getResPath();
      const osdPath = yield this.renderPeer.getOsdPath();
      this.mElementStorage = new ElementStorage({ resPath, osdPath });
    });
  }
  onClearGame() {
  }
  boot() {
    this.connect = new Connection(this.peer);
    this.addPacketListener();
    if (!this.mGameStateManager)
      this.mGameStateManager = new GameStateManager(this.peer);
    this.update(new Date().getTime());
  }
  onSelectCharacter() {
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
    this.mainPeer.send(pkt.Serialization());
    const i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
    const content = i18Packet.content;
    content.localeCode = "zh-CN";
    this.mainPeer.send(i18Packet.Serialization());
  }
  onGotoAnotherGame(packet) {
    const content = packet.content;
    this._onGotoAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc, content.spawnPointId, content.worldId);
  }
  onAvatarGameModeHandler(packet) {
    const content = packet.content;
    this.mAvatarType = content.avatarStyle;
  }
  update(current = 0, delta = 0) {
    if (this.isDestroy)
      return;
    this._run(current, delta);
    const now = new Date().getTime();
    const run_time = now - current;
    if (run_time >= interval) {
      Logger.getInstance().info(`Update late.  run_time: ${run_time} `);
      this.update(now, run_time);
    } else {
      setTimeout(() => {
        const when = new Date().getTime();
        this.update(when, when - now);
      }, interval - run_time);
    }
  }
  clearGame(bool = false) {
    return new Promise((resolve, reject) => {
      this.renderPeer.clearGame(bool).then(() => {
        this.isAuto = true;
        if (this.mClock) {
          this.mClock.destroy();
          this.mClock = null;
        }
        if (this.mRoomManager) {
          this.mRoomManager.destroy();
          this.mRoomManager = null;
        }
        if (this.mGuideWorkerManager) {
          this.mGuideWorkerManager.destroy();
          this.mGuideWorkerManager = null;
        }
        if (this.mUIManager) {
          this.mUIManager.destroy();
          this.mUIManager = null;
        }
        if (this.mElementStorage) {
          this.mElementStorage.destroy();
          this.mElementStorage = null;
        }
        if (this.mLoadingManager) {
          this.mLoadingManager.destroy();
          this.mLoadingManager = null;
        }
        if (this.mNetWorkManager) {
          this.mNetWorkManager.destory();
          this.mNetWorkManager = null;
        }
        if (this.mHttpLoadManager) {
          this.mHttpLoadManager.destroy();
          this.mHttpLoadManager = null;
        }
        if (this.mDataControlManager) {
          this.mDataControlManager.clear();
          this.mDataControlManager = null;
        }
        if (this.mSoundManager) {
          this.mSoundManager.destroy();
          this.mSoundManager = null;
        }
        if (this.user)
          this.user.removePackListener();
        this.hasClear = true;
        this.onClearGame();
        resolve();
      });
    });
  }
  _createAnotherGame(gameId, virtualworldId, sceneId, loc, spawnPointId, worldId) {
    this.mGameStateManager.startState(GameState.ChangeGame);
    this.clearGame(true).then(() => {
      this.isPause = false;
      if (this.mUser) {
        this.mUser.clear();
      }
      if (this.connect) {
        this.removePacketListener();
        this.connect.closeConnect();
      }
      if (this.mClock) {
        this.mClock.destroy();
        this.mClock = null;
      }
      this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
      this.createManager();
      this.addPacketListener();
      this.startConnect();
      this.mClock = new Clock(this.connect, this.peer);
      this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
    });
  }
  _onGotoAnotherGame(gameId, virtualworldId, sceneId, loc, spawnPointId, worldId) {
    this.mGameStateManager.startState(GameState.ChangeGame);
    this.clearGame(true).then(() => {
      this.isPause = false;
      if (this.connect) {
        this.connect.closeConnect();
      }
      if (this.mClock) {
        this.mClock.destroy();
        this.mClock = null;
      }
      this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
      this.createManager();
      this.removePacketListener();
      this.addPacketListener();
      this.startConnect();
      this.mClock = new Clock(this.connect, this.peer);
      this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
    });
  }
  decodeConfigs(req) {
    return new Promise((resolve, reject) => {
      const arraybuffer = req.response;
      if (arraybuffer) {
        try {
          const gameConfig = new Capsule();
          gameConfig.deserialize(new Uint8Array(arraybuffer));
          Logger.getInstance().debug("TCL: World -> gameConfig", gameConfig);
          resolve(gameConfig);
        } catch (error) {
          Logger.getInstance().error("catch error", error);
          reject(error);
        }
      } else {
        Logger.getInstance().error("reject error");
        reject("error");
      }
    });
  }
  onClientPingHandler(packet) {
    this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_PONG));
  }
  _run(current, delta) {
    if (!this.mRunning)
      return;
    if (this.connect)
      this.connect.update();
    if (this.mRoomManager)
      this.mRoomManager.update(current, delta);
    if (this.mHttpLoadManager)
      this.mHttpLoadManager.update(current, delta);
  }
}
