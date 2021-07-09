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
import { Game } from "tooqingphaser";
import { Export, RPCPeer, webworker_rpc } from "webworker-rpc";
import { UiUtils, Url } from "utils";
import { Account } from "./account";
import { SceneManager } from "./scenes/scene.manager";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { PlayScene } from "./scenes/play.scene";
import { CamerasRenderManager } from "./cameras/cameras.render.manager";
import {
  MessageType,
  SceneName,
  PlatFormType,
  i18n,
  Logger,
  LogicPos,
  Pos,
  ValueResolver
} from "structure";
import { DisplayManager } from "./managers/display.manager";
import { InputManager } from "./input/input.manager";
import { EditorCanvasManager } from "./managers/editor.canvas.manager";
import { AstarDebugger } from "./display/debugs/astar";
import { EditorModeDebugger } from "./display/debugs/editor.mode.debugger";
import { GridsDebugger } from "./display/debugs/grids";
import { SortDebugger } from "./display/debugs/sort.debugger";
import { UiManager } from "./ui";
import { GuideManager } from "./guide";
import { MouseManager } from "./input/mouse.manager";
import { SoundManager } from "./managers";
var MoveStyle;
(function(MoveStyle2) {
  MoveStyle2[MoveStyle2["DIRECTION_MOVE_STYLE"] = 1] = "DIRECTION_MOVE_STYLE";
  MoveStyle2[MoveStyle2["FOLLOW_MOUSE_MOVE_STYLE"] = 2] = "FOLLOW_MOUSE_MOVE_STYLE";
  MoveStyle2[MoveStyle2["PATH_MOVE_STYLE"] = 3] = "PATH_MOVE_STYLE";
})(MoveStyle || (MoveStyle = {}));
const _Render = class extends RPCPeer {
  constructor(config, callBack) {
    super(config.renderPeerKey);
    __publicField(this, "isConnect", false);
    __publicField(this, "sceneCreated", false);
    __publicField(this, "emitter");
    __publicField(this, "gridsDebugger");
    __publicField(this, "astarDebugger");
    __publicField(this, "sortDebugger");
    __publicField(this, "editorModeDebugger");
    __publicField(this, "mMainPeer");
    __publicField(this, "DEFAULT_WIDTH", 360);
    __publicField(this, "DEFAULT_HEIGHT", 640);
    __publicField(this, "resUrl");
    __publicField(this, "mGuideManager");
    __publicField(this, "mSceneManager");
    __publicField(this, "mCameraManager");
    __publicField(this, "mInputManager");
    __publicField(this, "mSoundManager");
    __publicField(this, "mConfig");
    __publicField(this, "mUiManager");
    __publicField(this, "mDisplayManager");
    __publicField(this, "mLocalStorageManager");
    __publicField(this, "mEditorCanvasManager");
    __publicField(this, "mRenderParam");
    __publicField(this, "mMainPeerParam");
    __publicField(this, "mAccount");
    __publicField(this, "mGame");
    __publicField(this, "mScaleRatio");
    __publicField(this, "mCallBack");
    __publicField(this, "_moveStyle", 0);
    __publicField(this, "_curTime");
    __publicField(this, "gameConfig");
    __publicField(this, "mUIRatio");
    __publicField(this, "mUIScale");
    __publicField(this, "mRoomSize");
    __publicField(this, "mRoomMiniSize");
    __publicField(this, "isPause", false);
    __publicField(this, "mConnectFailFunc");
    __publicField(this, "mGameCreatedFunc");
    __publicField(this, "mGameLoadedFunc");
    __publicField(this, "mWorkerDestroyMap", new Map());
    __publicField(this, "mCacheTarget");
    __publicField(this, "hiddenDelay", 6e4);
    __publicField(this, "mHiddenTime");
    this.emitter = new Phaser.Events.EventEmitter();
    this.mConfig = config;
    this.mCallBack = callBack;
    this.gridsDebugger = new GridsDebugger(this);
    this.astarDebugger = new AstarDebugger(this);
    this.sortDebugger = new SortDebugger(this);
    this.editorModeDebugger = new EditorModeDebugger(this);
    this.mConnectFailFunc = this.mConfig.connectFail;
    this.mGameCreatedFunc = this.mConfig.game_created;
    this.mGameLoadedFunc = this.mConfig.gameLoaded;
    this.mConfig.hasConnectFail = this.mConnectFailFunc ? true : false;
    this.mConfig.hasCloseGame = this.mConfig.closeGame ? true : false;
    this.mConfig.hasGameCreated = this.mConfig.game_created ? true : false;
    this.mConfig.hasReload = this.mConfig.reload ? true : false;
    this.mConfig.hasGameLoaded = this.mConfig.gameLoaded ? true : false;
    Logger.getInstance().isDebug = this.mConfig.debugLog || false;
    if (this.mConfig.devicePixelRatio)
      this.mConfig.devicePixelRatio = Math.floor(this.mConfig.devicePixelRatio);
    if (this.mConfig.width)
      this.mConfig.width = Math.floor(this.mConfig.width);
    if (this.mConfig.height)
      this.mConfig.height = Math.floor(this.mConfig.height);
    delete this.mConfig.connectFail;
    delete this.mConfig.game_created;
    delete this.mConfig.closeGame;
    delete this.mConfig.gameLoaded;
    Logger.getInstance().log("config ====>", config);
    this.initConfig();
    Logger.getInstance().log("Render version ====>:", `v${this.mConfig.version}`);
  }
  get renderParam() {
    return this.mRenderParam;
  }
  get mainPeerParam() {
    return this.mMainPeerParam;
  }
  setKeyBoardHeight(height) {
    throw new Error("Method not implemented.");
  }
  get config() {
    return this.mConfig;
  }
  get uiRatio() {
    return this.mUIRatio;
  }
  get devicePixelRatio() {
    return this.mConfig.devicePixelRatio;
  }
  get uiScale() {
    return this.mUIScale;
  }
  get scaleRatio() {
    return this.mScaleRatio;
  }
  get roomSize() {
    return this.mRoomSize;
  }
  get roomMiniSize() {
    return this.mRoomMiniSize;
  }
  get account() {
    return this.mAccount;
  }
  get uiManager() {
    return this.mUiManager;
  }
  get sceneManager() {
    return this.mSceneManager;
  }
  get guideManager() {
    return this.mGuideManager;
  }
  get camerasManager() {
    return this.mCameraManager;
  }
  get displayManager() {
    return this.mDisplayManager;
  }
  get soundManager() {
    return this.mSoundManager;
  }
  get localStorageManager() {
    return this.mLocalStorageManager;
  }
  get editorCanvasManager() {
    return this.mEditorCanvasManager;
  }
  get game() {
    return this.mGame;
  }
  get url() {
    return this.resUrl;
  }
  getSize() {
    if (!this.mGame)
      return;
    return this.mGame.scale.gameSize;
  }
  createGame() {
    this.newGame().then(() => {
      this.createManager();
      this.mMainPeer.createGame(this.mConfig);
    });
  }
  createManager() {
    if (!this.mUiManager)
      this.mUiManager = new UiManager(this);
    if (!this.mCameraManager)
      this.mCameraManager = new CamerasRenderManager(this);
    if (!this.mLocalStorageManager)
      this.mLocalStorageManager = new LocalStorageManager();
    if (!this.mSceneManager)
      this.mSceneManager = new SceneManager(this);
    if (!this.mGuideManager)
      this.mGuideManager = new GuideManager(this);
    if (!this.mInputManager)
      this.mInputManager = new InputManager(this);
    if (!this.mSoundManager)
      this.mSoundManager = new SoundManager(this);
    if (!this.mDisplayManager)
      this.mDisplayManager = new DisplayManager(this);
    if (!this.mEditorCanvasManager)
      this.mEditorCanvasManager = new EditorCanvasManager(this);
  }
  destroyManager() {
    if (this.mUiManager) {
      this.mUiManager.destroy();
      this.mUiManager = void 0;
    }
    if (this.mCameraManager) {
      this.mCameraManager.destroy();
      this.mCameraManager = void 0;
    }
    if (this.mSoundManager) {
      this.mSoundManager.destroy();
      this.mSoundManager = void 0;
    }
    if (this.mGuideManager) {
      this.mGuideManager.destroy();
      this.mGuideManager = void 0;
    }
    if (this.mInputManager) {
      this.mInputManager.destroy();
      this.mInputManager = void 0;
    }
    if (this.mDisplayManager) {
      this.mDisplayManager.destroy();
      this.mDisplayManager = void 0;
    }
    if (this.mEditorCanvasManager) {
      this.mEditorCanvasManager.destroy();
      this.mEditorCanvasManager = void 0;
    }
    if (this.mSceneManager) {
      this.mSceneManager.destroy();
      this.mSceneManager = void 0;
    }
  }
  clearManager() {
    this.sceneCreated = false;
    this.emitter.emit(_Render.SCENE_DESTROY);
    if (this.mUiManager)
      this.mUiManager.destroy();
    if (this.mCameraManager)
      this.mCameraManager.destroy();
    if (this.mSoundManager)
      this.mSoundManager.destroy();
    if (this.mInputManager)
      this.mInputManager.destroy();
    if (this.mDisplayManager)
      this.mDisplayManager.destroy();
    if (this.mSceneManager)
      this.mSceneManager.destroy();
  }
  enterGame() {
    this.mMainPeer.loginEnterWorld();
    this.mGame.scene.remove(SceneName.LOGIN_SCENE);
  }
  resize(width, height) {
    if (width * 0.65 > height) {
      this.dealTipsScene(SceneName.BLACK_SCENE, true);
    } else {
      const blackScene = this.mGame.scene.getScene(SceneName.BLACK_SCENE);
      if (blackScene && blackScene.scene.isActive()) {
        this.dealTipsScene(SceneName.BLACK_SCENE, false);
      }
    }
    if (this.mConfig) {
      this.mConfig.width = width;
      this.mConfig.height = height;
    }
    const w = width * this.mConfig.devicePixelRatio;
    const h = height * this.mConfig.devicePixelRatio;
    this.initRatio();
    if (this.mGame) {
      this.mGame.scale.zoom = 1 / this.mConfig.devicePixelRatio;
      this.mGame.scale.resize(w, h);
      const scenes = this.mGame.scene.scenes;
      for (const scene of scenes) {
        const camera = scene.cameras.main;
        if (camera && camera.setPixelRatio)
          camera.setPixelRatio(this.mScaleRatio);
      }
    }
    if (this.mUiManager) {
      this.mUiManager.resize(w, h);
    }
    if (this.mInputManager) {
      this.mInputManager.resize(w, h);
    }
    if (this.mDisplayManager) {
      this.mDisplayManager.resize(w, h);
    }
    if (this.mCameraManager) {
      this.mCameraManager.resize(width, height);
    }
  }
  onOrientationChange(oriation, newWidth, newHeight) {
  }
  scaleChange(scale) {
  }
  enableClick() {
    const playScene = this.sceneManager.getMainScene();
    if (playScene)
      playScene.input.enabled = true;
    const uiScene = this.game.scene.getScene("MainUIScene");
    if (uiScene)
      uiScene.input.enabled = true;
  }
  disableClick() {
    if (!this.sceneManager)
      return;
    const playScene = this.sceneManager.getMainScene();
    if (playScene)
      playScene.input.enabled = false;
    const uiScene = this.game.scene.getScene("MainUIScene");
    if (uiScene)
      uiScene.input.enabled = false;
  }
  keyboardDidShow(keyboardHeight) {
  }
  keyboardDidHide() {
  }
  visibilitychange(state) {
    if (state === "hidden") {
      this.mHiddenTime = setTimeout(() => {
        clearTimeout(this.mHiddenTime);
        this.hidden();
      }, this.hiddenDelay);
    } else {
      clearTimeout(this.mHiddenTime);
    }
  }
  showErrorMsg(msg) {
    this.uiManager.showErrorMsg(msg);
  }
  hidden() {
    const loginScene = this.sceneManager.getSceneByName(SceneName.LOGIN_SCENE);
    if (loginScene && loginScene.scene.isActive()) {
      return;
    }
    this.destroy(false).then(() => {
      this.initWorker();
    });
  }
  getSound(key) {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.getSound(key));
    });
  }
  setResourecRoot(root) {
    this.resUrl.RESOURCE_ROOT = root;
  }
  getUIPath(dpr, res) {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.getUIRes(dpr, res));
    });
  }
  getResPath() {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.RES_PATH);
    });
  }
  getOsdPath() {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.OSD_PATH);
    });
  }
  getResourceRoot(url) {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.getResRoot(url));
    });
  }
  getResUIPath() {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.RESUI_PATH);
    });
  }
  getNormalUIPath(res) {
    return new Promise((resolve, reject) => {
      resolve(this.resUrl.getNormalUIRes(res));
    });
  }
  startFullscreen() {
  }
  stopFullscreen() {
  }
  setGameConfig(config) {
  }
  updatePalette(palette) {
    this.mainPeer.updatePalette(palette);
  }
  updateMoss(moss) {
    this.mainPeer.updateMoss(moss);
  }
  restart(config, callBack) {
  }
  initUI() {
    this.mainPeer.initUI();
  }
  startRoomPlay() {
    this.sceneCreated = true;
    this.emitter.emit(_Render.SCENE_CREATED);
    this.mainPeer.startRoomPlay();
  }
  updateRoom(time, delta) {
    if (this.mInputManager)
      this.mInputManager.update(time, delta);
    if (this.mDisplayManager)
      this.mDisplayManager.update(time, delta);
  }
  destroyWorker(workers) {
    const arr = [];
    for (const w of workers) {
      const valuePromse = new ValueResolver();
      const p = valuePromse.promise(() => {
        const worker = this.remote[w];
        for (const key in worker) {
          if (Object.prototype.hasOwnProperty.call(worker, key)) {
            const element = worker[key];
            element.destroy();
          }
        }
      });
      arr.push(p);
      this.mWorkerDestroyMap.set(w, valuePromse);
    }
    return Promise.all(arr);
  }
  destroy(destroyPeer = true) {
    return new Promise((resolve, reject) => {
      this.destroyWorker([this.mMainPeerParam.key]).then(() => {
        if (this.mGame) {
          this.destroyManager();
          this.mGame.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
          this.mGame.events.off(Phaser.Core.Events.BLUR, this.onBlur, this);
          this.mGame.scale.off("enterfullscreen", this.onFullScreenChange, this);
          this.mGame.scale.off("leavefullscreen", this.onFullScreenChange, this);
          this.mGame.scale.off("orientationchange", this.onOrientationChange, this);
          this.mGame.plugins.removeGlobalPlugin("rexButton");
          this.mGame.plugins.removeGlobalPlugin("rexNinePatchPlugin");
          this.mGame.plugins.removeGlobalPlugin("rexInputText");
          this.mGame.plugins.removeGlobalPlugin("rexBBCodeTextPlugin");
          this.mGame.plugins.removeGlobalPlugin("rexMoveTo");
          this.mGame.plugins.removeScenePlugin("DragonBones");
          this.mGame.events.once(Phaser.Core.Events.DESTROY, () => {
            this.mGame = void 0;
            if (destroyPeer)
              super.destroy();
            resolve();
          });
          this.mGame.destroy(true);
        } else {
          if (destroyPeer)
            super.destroy();
          resolve();
        }
      });
    });
  }
  get curTime() {
    return this._curTime;
  }
  get moveStyle() {
    return this._moveStyle;
  }
  initGameConfig(config) {
    this.mainPeer.initGameConfig(JSON.stringify(config));
  }
  newGame() {
    return new Promise((resolve, reject) => {
      if (this.mGame) {
        resolve(true);
      }
      this.gameConfig = {
        type: Phaser.AUTO,
        parent: this.mConfig.parent,
        loader: {
          timeout: 1e4
        },
        disableContextMenu: true,
        transparent: false,
        backgroundColor: 0,
        fps: {
          target: 30,
          forceSetTimeOut: true
        },
        dom: {
          createContainer: true
        },
        plugins: {
          scene: [
            {
              key: "DragonBones",
              plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
              mapping: "dragonbone"
            }
          ]
        },
        render: {
          pixelArt: true,
          roundPixels: true
        },
        scale: {
          mode: Phaser.Scale.NONE,
          width: this.mConfig.baseWidth * this.devicePixelRatio,
          height: this.mConfig.baseHeight * this.devicePixelRatio,
          zoom: 1 / this.devicePixelRatio
        }
      };
      Object.assign(this.gameConfig, this.mConfig);
      this.mGame = new Game(this.gameConfig);
      if (this.mGame.device.os.desktop) {
        this.mUIScale = 1;
        this.mConfig.platform = PlatFormType.PC;
      }
      resolve(true);
    });
  }
  closeConnect(boo) {
    this.mainPeer.closeConnect(boo);
  }
  send(packet) {
    this.mainPeer.send(packet.Serialization);
  }
  terminate() {
    this.mainPeer.terminate();
  }
  changeScene(scene) {
    if (this.mInputManager)
      this.mInputManager.setScene(scene);
    if (this.mSoundManager)
      this.mSoundManager.setScene(scene);
  }
  onFocus() {
  }
  onBlur() {
  }
  syncClock(times) {
    this.mainPeer.syncClock(times);
  }
  clearClock() {
    this.mainPeer.clearClock();
  }
  destroyClock() {
    this.mainPeer.destroyClock();
  }
  exitUser() {
    this.mainPeer.exitUser();
  }
  requestCurTime() {
    this.mainPeer.requestCurTime();
  }
  setDirection(id, direction) {
    this.mainPeer.setDirection(id, direction);
  }
  onLoginErrorHanlerCallBack(name, idcard) {
  }
  onShowErrorHandlerCallBack(error, okText) {
  }
  getCurrentRoomSize() {
    return this.mainPeer.getCurrentRoomSize();
  }
  getCurrentRoomMiniSize() {
    return this.mainPeer.getCurrentRoomMiniSize();
  }
  syncCameraScroll() {
    if (this.mMainPeer)
      this.mMainPeer.syncCameraScroll();
  }
  renderEmitter(eventType, data) {
    if (this.mMainPeer)
      this.mMainPeer.renderEmitter(eventType, data);
  }
  showMediator(name, isShow) {
    if (this.mMainPeer)
      this.mMainPeer.showMediator(name, isShow);
  }
  getMainScene() {
    return this.mSceneManager.getMainScene();
  }
  updateGateway() {
    const accountData = this.account.accountData;
    if (accountData && accountData.gateway) {
      if (!this.mConfig.server_addr) {
        this.mConfig.server_addr = accountData.gateway;
      } else {
        const server_addr = this.mConfig.server_addr;
        if (!server_addr.host) {
          server_addr.host = accountData.gateway.host;
        }
        if (!server_addr.port) {
          server_addr.port = accountData.gateway.port;
        }
      }
      if (this.mConfig.server_addr.secure === void 0)
        this.mConfig.server_addr.secure = true;
      this.mainPeer.setConfig(this.mConfig);
    }
  }
  destroyAccount() {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        if (this.mAccount) {
          this.mAccount.destroy();
        }
        resolve();
      });
    });
  }
  reconnect() {
    this.createGame();
  }
  showLogin() {
    const data = { dpr: this.uiRatio, render: this };
    if (this.sceneManager)
      this.mSceneManager.startScene(SceneName.LOGIN_SCENE, data);
  }
  hideLogin() {
    if (this.sceneManager)
      this.sceneManager.stopScene(SceneName.LOGIN_SCENE);
  }
  checkContains(id, x, y) {
    return new Promise((resolve, reject) => {
      const boo = this.mCameraManager.checkContains(new Pos(x, y));
      resolve(boo);
    });
  }
  showCreateRolePanel(data) {
    return new Promise((resolve, reject) => {
      if (this.mUiManager.scene && this.mUiManager.scene.scene.key === SceneName.CREATE_ROLE_SCENE) {
        resolve(true);
      } else {
        this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, {
          callBack: () => {
            resolve(true);
          }
        });
      }
    });
  }
  showTipsAlert(str) {
    this.mUiManager.showTipsAlert({ text: [{ text: str, node: void 0 }] });
  }
  updateModel(id, displayInfo) {
    if (this.displayManager)
      this.displayManager.updateModel(id, displayInfo);
  }
  getIndexInLayer(id) {
    if (!this.displayManager)
      return -1;
    const display = this.displayManager.getDisplay(id);
    if (!display)
      return -1;
    return display.parentContainer.getIndex(display);
  }
  changeLayer(id, layerName) {
    if (!this.displayManager)
      return;
    const display = this.displayManager.getDisplay(id);
    if (!display)
      return;
    display.parentContainer.remove(display);
    this.displayManager.addToLayer(layerName, display);
  }
  showCreateRole(params) {
    if (this.mSceneManager)
      this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, { render: this, params });
  }
  hideCreateRole() {
    if (this.mSceneManager)
      this.mSceneManager.stopScene(SceneName.CREATE_ROLE_SCENE);
  }
  showPlay(params) {
    if (this.mSceneManager)
      this.mSceneManager.startScene(SceneName.PLAY_SCENE, { render: this, params });
  }
  updateFPS() {
    if (!this.game)
      return;
    const scene = this.game.scene.getScene(SceneName.MAINUI_SCENE);
    if (!scene || !scene.scene.isVisible || !scene.scene.isActive || !scene.scene.isPaused)
      return;
    scene.updateFPS();
  }
  endFPS() {
  }
  hidePlay() {
    if (this.mSceneManager)
      this.mSceneManager.stopScene(SceneName.PLAY_SCENE);
  }
  showPanel(panelName, params) {
    return new Promise((resolve, reject) => {
      if (!this.mUiManager) {
        reject(false);
        return;
      }
      this.mUiManager.showPanel(panelName, params).then((panel) => {
        if (!panel) {
          reject(false);
          return;
        }
        panel.addExportListener(() => {
          resolve(true);
        });
      });
    });
  }
  hidePanel(type) {
    if (this.mUiManager)
      this.mUiManager.hidePanel(type);
  }
  showBatchPanel(type, data) {
    if (this.mUiManager)
      this.mUiManager.showBatchPanel(type, data);
  }
  hideBatchPanel(type) {
    if (this.mUiManager)
      this.mUiManager.hideBatchPanel(type);
  }
  reload() {
    Logger.getInstance().log("game relaod =====>");
  }
  showJoystick() {
    if (this.mInputManager)
      this.mInputManager.showJoystick();
  }
  setInputVisible(allow) {
  }
  onShowErrorHandler(error, okText) {
    this.onShowErrorHandlerCallBack(error, okText);
  }
  onLoginErrorHanler(name, idcard) {
    this.onLoginErrorHanlerCallBack(name, idcard);
  }
  updateCharacterPackage() {
    if (this.emitter)
      this.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
  }
  displayReady(id, animation) {
    const display = this.mDisplayManager.getDisplay(id);
    if (!display || !animation)
      return;
    display.play(animation);
    display.showNickname();
  }
  soundChangeRoom(roomID) {
  }
  playSoundByKey(key) {
    if (this.mSoundManager)
      this.mSoundManager.playSound({ soundKey: key });
  }
  playOsdSound(content) {
    if (this.mSoundManager)
      this.mSoundManager.playOsdSound(content);
  }
  playSound(content) {
    if (this.mSoundManager)
      this.mSoundManager.playSound(content);
  }
  stopAllSound() {
    if (this.mSoundManager)
      this.mSoundManager.stopAll();
  }
  pauseAll() {
    if (this.mSoundManager)
      this.mSoundManager.pauseAll();
  }
  startFireMove(id, pos) {
    if (this.mDisplayManager)
      this.mDisplayManager.startFireMove(id, pos);
  }
  resume() {
    if (this.mSoundManager)
      this.mSoundManager.resume();
  }
  onConnected() {
    this.isConnect = true;
  }
  onDisConnected() {
    this.isConnect = false;
  }
  onConnectError(error) {
    this.isConnect = false;
  }
  connectFail() {
    this.isConnect = false;
    if (this.mConnectFailFunc)
      this.mConnectFailFunc();
  }
  updateUIState(panelName, ui) {
    if (this.uiManager)
      this.uiManager.updateUIState(panelName, ui);
  }
  setMoveStyle(moveStyle) {
    this._moveStyle = moveStyle;
  }
  onEnterRoom(scene) {
  }
  scaleTween(id, type) {
  }
  getRenderPosition(id, type) {
    return [];
  }
  createAccount(gameID, worldID, sceneID, loc, spawnPointId) {
    return new Promise((resolve, reject) => {
      if (!this.mAccount) {
        this.mAccount = new Account();
      }
      resolve(true);
    });
  }
  refreshAccount(account) {
    this.account.refreshToken(account);
    this.updateGateway();
  }
  getAccount() {
    return this.mAccount;
  }
  setAccount(val) {
    this.mAccount.setAccount(val);
    this.updateGateway();
  }
  clearAccount() {
    this.mAccount.clear();
  }
  getWorldView() {
    if (!this.sceneManager)
      return;
    return new Promise((resolve, reject) => {
      const playScene = this.sceneManager.getMainScene();
      if (playScene) {
        const camera = playScene.cameras.main;
        const rect = camera.worldView;
        const blockWidth = 300;
        const blockHeight = 150;
        const { x, y } = rect;
        const obj = {
          x: x - blockWidth * 2,
          y: y - blockHeight * 2,
          width: camera.width + blockWidth * 4,
          height: camera.height + blockHeight * 4,
          zoom: camera.zoom,
          scrollX: camera.scrollX,
          scrollY: camera.scrollY
        };
        resolve(obj);
      }
    });
  }
  onClockReady() {
  }
  i18nString(val) {
    return i18n.t(val);
  }
  showAlert(text, ok, needI18n) {
    if (ok === void 0)
      ok = true;
    if (needI18n === void 0)
      needI18n = true;
    return new Promise((resolve, reject) => {
      if (this.uiManager) {
        if (needI18n)
          text = i18n.t(text);
        this.uiManager.showAlertView(text, ok, void 0, () => {
          resolve(null);
        });
      }
    });
  }
  showAlertReconnect(text) {
    if (this.uiManager)
      this.uiManager.showAlertView(text, true, false, () => {
        this.mainPeer.reconnect();
      });
  }
  showLoading(data) {
    if (!this.mSceneManager) {
      return;
    }
    if (data === void 0) {
      data = {};
    }
    data.callBack = () => {
      if (data.sceneName)
        this.mSceneManager.startScene(data.sceneName);
      return new Promise((resolve, reject) => {
        resolve(null);
      });
    };
    data.dpr = this.uiRatio;
    data.version = this.mConfig.version;
    this.mSceneManager.startScene(SceneName.LOADING_SCENE, data);
  }
  updateProgress(progress) {
    if (progress > 1)
      progress = 1;
    progress.toFixed(2);
    if (this.mSceneManager)
      this.mSceneManager.showProgress(progress);
  }
  hideLoading() {
    if (!this.mSceneManager) {
      return Logger.getInstance().error(`HideLoading failed. SceneManager does not exist.`);
    }
    this.mSceneManager.sleepScene(SceneName.LOADING_SCENE);
  }
  loadStart(str, scene) {
  }
  roomPause(roomID) {
  }
  roomResume(roomID) {
  }
  removeScene(sceneName) {
    if (this.sceneManager)
      this.sceneManager.remove(sceneName);
  }
  showCreatePanelError(content) {
  }
  createSetNickName(name) {
  }
  createAnotherGame(gameId, virtualWorldId, sceneId, px, py, pz, spawnPointId, worldId) {
    Logger.getInstance().debug("gotoanothergame ====>");
    this.account.enterGame(gameId, virtualWorldId, sceneId, { x: px, y: py, z: pz }, spawnPointId, worldId);
  }
  setCamerasBounds(x, y, width, height) {
    if (this.mCameraManager)
      this.mCameraManager.setBounds(x, y, width, height);
  }
  getCameraMidPos() {
    if (!this.mCameraManager)
      return new LogicPos(0, 0);
    const rect = this.mCameraManager.camera.worldView;
    return new LogicPos((rect.x + rect.width / 2) / this.scaleRatio, (rect.y + rect.height / 2) / this.scaleRatio);
  }
  setCamerasScroll(x, y, effect) {
    if (!this.mCameraManager) {
      return;
    }
    this.mCameraManager.scrollTargetPoint(x, y, effect);
  }
  setInteractive(id, type) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.setInteractive();
  }
  disableInteractive(id, type) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.disableInteractive();
  }
  fadeIn(id, type) {
  }
  fadeOut(id, type) {
  }
  fadeAlpha(id, type, alpha) {
  }
  getCurTime(curTime) {
    return this._curTime = curTime;
  }
  gameLoadedCallBack() {
    if (this.mGameLoadedFunc)
      this.mGameLoadedFunc.call(this);
  }
  createGameCallBack(keyEvents) {
    this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
    this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
    this.resize(this.mConfig.width, this.mConfig.height);
    if (this.mGameCreatedFunc) {
      Logger.getInstance().log("render game_created");
      this.mGameCreatedFunc.call(this);
    }
    this.gameCreated(keyEvents);
  }
  addFillEffect(posX, posY, status) {
    if (this.displayManager)
      this.displayManager.addFillEffect(posX, posY, status);
  }
  clearRoom() {
    this.clearManager();
  }
  clearGame(boo) {
    return new Promise((resolve, reject) => {
      if (this.mGame) {
        Logger.getInstance().log("====================>>>>>>>> clear game");
        this.mGame.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.off(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.mGame.scale.off("enterfullscreen", this.onFullScreenChange, this);
        this.mGame.scale.off("leavefullscreen", this.onFullScreenChange, this);
        this.mGame.scale.off("orientationchange", this.onOrientationChange, this);
        this.mGame.plugins.removeGlobalPlugin("rexButton");
        this.mGame.plugins.removeGlobalPlugin("rexNinePatchPlugin");
        this.mGame.plugins.removeGlobalPlugin("rexInputText");
        this.mGame.plugins.removeGlobalPlugin("rexBBCodeTextPlugin");
        this.mGame.plugins.removeGlobalPlugin("rexMoveTo");
        this.mGame.plugins.removeScenePlugin("DragonBones");
        this.destroyManager();
        this.mGame.events.once(Phaser.Core.Events.DESTROY, () => {
          this.mGame = void 0;
          if (boo) {
            this.newGame().then(() => {
              this.createManager();
              resolve();
            });
            return;
          }
          resolve();
        });
        this.mGame.destroy(true);
      } else {
        resolve();
      }
    });
  }
  getMessage(val) {
    return i18n.t(val);
  }
  setLocalStorage(key, value) {
    if (this.localStorageManager)
      this.localStorageManager.setItem(key, value);
  }
  getLocalStorage(key) {
    return this.localStorageManager ? this.localStorageManager.getItem(key) : "";
  }
  removeLocalStorage(key) {
    if (this.localStorageManager)
      this.localStorageManager.removeItem(key);
  }
  createPanel(name, key) {
    return new Promise((resolve, reject) => {
      if (!this.uiManager) {
        reject("uiManager not found");
        return;
      }
      const panel = this.uiManager.showPanel(name);
      this.exportProperty(panel, this, key).onceReady(() => {
        resolve(true);
      });
    });
  }
  roomstartPlay() {
    if (!this.mSceneManager || !this.mCameraManager)
      return;
    const scene = this.mSceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    this.mCameraManager.camera = scene.cameras.main;
  }
  roomReady() {
    if (!this.mSceneManager || !this.mCameraManager)
      return;
    const scene = this.mSceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    if (scene instanceof PlayScene)
      scene.onRoomCreated();
  }
  playAnimation(id, animation, field, times) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.play(animation);
  }
  setHasInteractive(id, hasInteractive) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.hasInteractive = hasInteractive;
  }
  setCameraScroller(actorX, actorY) {
    if (!this.mSceneManager || !this.mCameraManager)
      return;
    const scene = this.mSceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    const sceneScrale = scene.scale;
    this.mCameraManager.setScroll(actorX * this.scaleRatio - sceneScrale.width / 2, actorY * this.scaleRatio - sceneScrale.height / 2);
    this.syncCameraScroll();
  }
  createDragonBones(id, displayInfo, layer, nodeType) {
    if (this.mDisplayManager)
      this.mDisplayManager.addDragonbonesDisplay(id, displayInfo, layer, nodeType);
  }
  createUserDragonBones(displayInfo, layer) {
    if (this.mDisplayManager)
      this.mDisplayManager.addUserDragonbonesDisplay(displayInfo, true, layer);
  }
  createFramesDisplay(id, displayInfo, layer) {
    if (this.mDisplayManager)
      this.mDisplayManager.addFramesDisplay(id, displayInfo, layer);
    else
      Logger.getInstance().debug("no displayManager ====>");
  }
  createTerrainDisplay(id, displayInfo, layer) {
    if (this.mDisplayManager)
      this.mDisplayManager.addTerrainDisplay(id, displayInfo, layer);
  }
  setModel(sprite) {
    if (this.mDisplayManager)
      this.mDisplayManager.setModel(sprite);
  }
  setPlayerModel(sprite) {
    if (this.mDisplayManager)
      this.mDisplayManager.setModel(sprite);
  }
  addSkybox(scenery) {
    if (this.mDisplayManager)
      this.mDisplayManager.addSkybox(scenery);
  }
  removeSkybox(id) {
    if (this.mDisplayManager)
      this.mDisplayManager.removeSkybox(id);
  }
  showMatterDebug(vertices) {
    if (this.mDisplayManager)
      this.mDisplayManager.showMatterDebug(vertices);
  }
  hideMatterDebug() {
    if (this.mDisplayManager)
      this.mDisplayManager.hideMatterDebug();
  }
  drawServerPosition(x, y) {
    if (this.mDisplayManager)
      this.mDisplayManager.drawServerPosition(x, y);
  }
  hideServerPosition() {
    if (this.mDisplayManager)
      this.mDisplayManager.hideServerPosition();
  }
  changeAlpha(id, alpha) {
    if (this.mDisplayManager)
      this.mDisplayManager.changeAlpha(id, alpha);
  }
  removeBlockObject(id) {
    if (this.mDisplayManager)
      this.mDisplayManager.removeDisplay(id);
  }
  setPosition(id, x, y, z) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.setPosition(x, y, z);
  }
  showBubble(id, text, setting) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.showBubble(text, setting);
  }
  clearBubble(id) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      display.clearBubble();
  }
  startFollow(id) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display)
      this.mCameraManager.startFollow(display);
  }
  stopFollow() {
    if (this.mCameraManager)
      this.mCameraManager.stopFollow();
  }
  cameraFollow(id, effect) {
    return __async(this, null, function* () {
      if (!this.mDisplayManager || !this.mCameraManager)
        return;
      const target = this.mDisplayManager.getDisplay(id);
      if (target) {
        if (effect === "liner") {
          const position = target.getPosition();
          this.mCameraManager.stopFollow();
          this.mCameraManager.pan(position.x, position.y, 300).then(() => {
            this.mCameraManager.startFollow(target);
          });
        } else {
          this.mCameraManager.startFollow(target);
        }
      } else {
        this.mCameraManager.stopFollow();
      }
    });
  }
  cameraPan(id) {
    if (!this.mDisplayManager)
      return;
    const display = this.mDisplayManager.getDisplay(id);
    if (display) {
      this.mCameraManager.pan(display.x, display.y, 300);
    }
  }
  updateSkyboxState(state) {
    if (this.mDisplayManager)
      this.mDisplayManager.updateSkyboxState(state);
  }
  setLayerDepth(val) {
    if (!this.mSceneManager)
      return;
    const scene = this.mSceneManager.getMainScene();
    if (!scene) {
      Logger.getInstance().fatal(`scene does not exist`);
      return;
    }
    scene.layerManager.depthSurfaceDirty = val;
  }
  doMove(id, moveData) {
    if (this.mDisplayManager)
      this.mDisplayManager.displayDoMove(id, moveData);
  }
  showNickname(id, name) {
    if (this.mDisplayManager)
      this.mDisplayManager.showNickname(id, name);
  }
  showTopDisplay(id, state) {
    if (this.mDisplayManager)
      this.mDisplayManager.showTopDisplay(id, state);
  }
  SetDisplayVisible(id, visible) {
    if (!this.mDisplayManager)
      return;
    const display = this.displayManager.getDisplay(id);
    if (!display)
      return;
    display.setVisible(visible);
  }
  showRefernceArea(id, area, origin, conflictMap) {
    if (!this.mDisplayManager)
      return;
    const ele = this.mDisplayManager.getDisplay(id);
    if (!ele)
      return;
    ele.showRefernceArea(area, origin, conflictMap);
  }
  hideRefernceArea(id) {
    if (!this.mDisplayManager)
      return;
    const ele = this.mDisplayManager.getDisplay(id);
    if (!ele)
      return;
    ele.hideRefernceArea();
  }
  displayAnimationChange(data) {
    if (!this.mDisplayManager)
      return;
    const id = data.id;
    const direction = data.direction;
    const display = this.mDisplayManager.getDisplay(id);
    if (display) {
      display.direction = direction;
      display.play(data.animation);
    }
  }
  workerEmitter(eventType, data) {
    if (!this.emitter)
      return;
    this.emitter.emit(eventType, data);
  }
  mount(id, targetID, targetIndex) {
    if (this.mDisplayManager)
      this.mDisplayManager.mount(id, targetID, targetIndex);
  }
  unmount(id, targetID) {
    if (this.mDisplayManager)
      this.mDisplayManager.unmount(id, targetID);
  }
  updateInput(val) {
    if (this.sceneManager)
      this.sceneManager.updateInput(val);
  }
  addEffect(target, effectID, display) {
    if (this.mDisplayManager)
      this.mDisplayManager.addEffect(target, effectID, display);
  }
  removeEffect(target, effectID) {
    if (this.mDisplayManager)
      this.mDisplayManager.removeEffect(target, effectID);
  }
  switchBaseMouseManager() {
    if (!this.mInputManager)
      return;
    this.mInputManager.changeMouseManager(new MouseManager(this));
    const playScene = this.mGame.scene.getScene(SceneName.PLAY_SCENE);
    if (playScene) {
      playScene.resumeMotion();
      playScene.enableCameraMove();
    }
  }
  liftItem(id, display, animation) {
    if (!this.mDisplayManager)
      return;
    this.mDisplayManager.liftItem(id, display, animation);
  }
  clearMount(id) {
    if (!this.mDisplayManager)
      return;
    this.mDisplayManager.clearMount(id);
  }
  throwElement(userid, target, display, animation) {
    if (!this.mDisplayManager)
      return;
    this.mDisplayManager.throwElement(userid, target, display, animation);
  }
  switchDecorateMouseManager() {
  }
  setRoomSize(size, miniSize) {
    this.mRoomSize = size;
    this.mRoomMiniSize = miniSize;
  }
  isCordove() {
    const pktGlobal = window["pktGlobal"];
    return pktGlobal && pktGlobal.envPlatform === "Cordova";
  }
  onWorkerUnlinked(worker) {
    if (!this.mWorkerDestroyMap.has(worker))
      return;
    this.mWorkerDestroyMap.get(worker).resolve(null);
    this.mWorkerDestroyMap.delete(worker);
  }
  initConfig() {
    if (!this.mConfig.devicePixelRatio) {
      this.mConfig.devicePixelRatio = window.devicePixelRatio || 2;
    }
    if (this.mConfig.width === void 0) {
      this.mConfig.width = window.innerWidth;
    }
    if (this.mConfig.height === void 0) {
      this.mConfig.height = window.innerHeight;
    }
    this.resUrl = new Url();
    this.resUrl.init({ osd: this.mConfig.osd, res: `resources/`, resUI: `resources/ui/` });
    this.initRatio();
  }
  initRatio() {
    this.mScaleRatio = Math.ceil(this.mConfig.devicePixelRatio || UiUtils.baseDpr);
    this.mConfig.scale_ratio = this.mScaleRatio;
    this.mUIRatio = Math.round(this.mConfig.devicePixelRatio || UiUtils.baseDpr);
    if (this.mUIRatio > UiUtils.MaxDpr) {
      this.mUIRatio = UiUtils.MaxDpr;
    }
    const scaleW = this.mConfig.width / this.DEFAULT_WIDTH * (this.mConfig.devicePixelRatio / this.mUIRatio);
    let desktop = false;
    if (this.game)
      desktop = this.game.device.os.desktop;
    this.mUIScale = desktop ? UiUtils.baseScale : scaleW;
  }
  initWorker() {
    Logger.getInstance().log("startLink mainpeer", this.mMainPeerParam.key, this.mMainPeerParam.url);
    const key = this.mMainPeerParam.key;
    const peerName = this.mMainPeerParam.name;
    this.attach(this.mMainPeerParam.key, this.mMainPeerParam.url).onceReady(() => {
      this.mMainPeer = this.remote[key][peerName];
      this.mMainPeer.updateFps();
      this.createGame();
      Logger.getInstance().debug("worker onReady");
    });
  }
  dealTipsScene(sceneName, show) {
    if (!this.mGame.scene.getScene(sceneName)) {
      const sceneClass = this.sceneManager.getSceneClass(sceneName);
      this.mGame.scene.add(sceneName, sceneClass);
    }
    const pauseScene = this.mGame.scene.getScene(SceneName.GAMEPAUSE_SCENE);
    const playScene = this.mGame.scene.getScene(SceneName.PLAY_SCENE);
    const uiScene = this.mGame.scene.getScene(SceneName.MAINUI_SCENE);
    const loginScene = this.mGame.scene.getScene(SceneName.LOGIN_SCENE);
    if (show) {
      this.mGame.scene.start(sceneName, { render: this });
      if (sceneName !== SceneName.GAMEPAUSE_SCENE) {
        if (pauseScene)
          pauseScene.scene.pause();
      }
      if (playScene)
        playScene.scene.pause();
      if (uiScene) {
        uiScene.scene.pause();
        uiScene.scene.setVisible(false);
      }
      if (loginScene && loginScene.scene.isActive())
        loginScene.scene.setVisible(false);
    } else {
      this.mGame.scene.stop(sceneName);
      if (sceneName !== SceneName.GAMEPAUSE_SCENE) {
        if (pauseScene)
          pauseScene.scene.resume();
      }
      if (playScene)
        playScene.scene.resume();
      if (uiScene) {
        uiScene.scene.resume();
        uiScene.scene.setVisible(true);
      }
      if (loginScene && loginScene.scene.isActive())
        loginScene.scene.setVisible(true);
    }
  }
  onFullScreenChange() {
    this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
  }
  gameCreated(keyEvents) {
    if (this.mCallBack) {
      this.mCallBack();
    }
    if (this.mConfig.game_created) {
      this.mConfig.game_created();
    }
    this.mGame.scale.on("enterfullscreen", this.onFullScreenChange, this);
    this.mGame.scale.on("leavefullscreen", this.onFullScreenChange, this);
  }
  resumeScene() {
    const type = this.mConfig.platform;
    switch (type) {
      case PlatFormType.APP:
        this.mainPeer.reconnect();
        break;
      case PlatFormType.PC:
      case PlatFormType.NOPC:
        Logger.getInstance().debug(`#BlackSceneFromBackground; world.resumeScene(); isPause:${this.isPause}; mGame:${this.mGame}`);
        if (!this.isPause) {
          return;
        }
        this.isPause = false;
        if (this.mGame) {
          if (this.sceneManager.currentScene)
            this.sceneManager.currentScene.scene.resume();
          this.mainPeer.onFocus();
          this.dealTipsScene(SceneName.GAMEPAUSE_SCENE, false);
        }
        break;
    }
  }
  pauseScene() {
    Logger.getInstance().debug(`#BlackSceneFromBackground; world.pauseScene(); isPause:${this.isPause}; mGame:${this.mGame}`);
    if (this.isPause) {
      return;
    }
    this.isPause = true;
    if (this.mGame) {
      if (this.sceneManager.currentScene)
        this.sceneManager.currentScene.scene.pause();
      this.mainPeer.onBlur();
      this.dealTipsScene(SceneName.GAMEPAUSE_SCENE, true);
    }
  }
  get mainPeer() {
    if (!this.mMainPeer) {
      throw new Error("can't find main worker");
    }
    return this.mMainPeer;
  }
};
export let Render = _Render;
__publicField(Render, "SCENE_CREATED", "SCENE_CREATED");
__publicField(Render, "SCENE_DESTROY", "SCENE_DESTROY");
__decorateClass([
  Export()
], Render.prototype, "gridsDebugger", 2);
__decorateClass([
  Export()
], Render.prototype, "astarDebugger", 2);
__decorateClass([
  Export()
], Render.prototype, "sortDebugger", 2);
__decorateClass([
  Export()
], Render.prototype, "editorModeDebugger", 2);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "showErrorMsg", 1);
__decorateClass([
  Export()
], Render.prototype, "hidden", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "getSound", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "setResourecRoot", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
], Render.prototype, "getUIPath", 1);
__decorateClass([
  Export()
], Render.prototype, "getResPath", 1);
__decorateClass([
  Export()
], Render.prototype, "getOsdPath", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "getResourceRoot", 1);
__decorateClass([
  Export()
], Render.prototype, "getResUIPath", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "getNormalUIPath", 1);
__decorateClass([
  Export()
], Render.prototype, "destroyAccount", 1);
__decorateClass([
  Export()
], Render.prototype, "reconnect", 1);
__decorateClass([
  Export()
], Render.prototype, "showLogin", 1);
__decorateClass([
  Export()
], Render.prototype, "hideLogin", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "checkContains", 1);
__decorateClass([
  Export()
], Render.prototype, "showCreateRolePanel", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "showTipsAlert", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "updateModel", 1);
__decorateClass([
  Export()
], Render.prototype, "getIndexInLayer", 1);
__decorateClass([
  Export()
], Render.prototype, "changeLayer", 1);
__decorateClass([
  Export()
], Render.prototype, "showCreateRole", 1);
__decorateClass([
  Export()
], Render.prototype, "hideCreateRole", 1);
__decorateClass([
  Export()
], Render.prototype, "showPlay", 1);
__decorateClass([
  Export()
], Render.prototype, "updateFPS", 1);
__decorateClass([
  Export()
], Render.prototype, "endFPS", 1);
__decorateClass([
  Export()
], Render.prototype, "hidePlay", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "showPanel", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "hidePanel", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "showBatchPanel", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "hideBatchPanel", 1);
__decorateClass([
  Export()
], Render.prototype, "reload", 1);
__decorateClass([
  Export()
], Render.prototype, "showJoystick", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], Render.prototype, "setInputVisible", 1);
__decorateClass([
  Export()
], Render.prototype, "onShowErrorHandler", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "onLoginErrorHanler", 1);
__decorateClass([
  Export()
], Render.prototype, "updateCharacterPackage", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "displayReady", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "soundChangeRoom", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "playSoundByKey", 1);
__decorateClass([
  Export()
], Render.prototype, "playOsdSound", 1);
__decorateClass([
  Export()
], Render.prototype, "playSound", 1);
__decorateClass([
  Export()
], Render.prototype, "stopAllSound", 1);
__decorateClass([
  Export()
], Render.prototype, "pauseAll", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "startFireMove", 1);
__decorateClass([
  Export()
], Render.prototype, "resume", 1);
__decorateClass([
  Export()
], Render.prototype, "onConnected", 1);
__decorateClass([
  Export()
], Render.prototype, "onDisConnected", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "onConnectError", 1);
__decorateClass([
  Export()
], Render.prototype, "connectFail", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "updateUIState", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "setMoveStyle", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.unit8array])
], Render.prototype, "onEnterRoom", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "scaleTween", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "getRenderPosition", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
], Render.prototype, "createAccount", 1);
__decorateClass([
  Export()
], Render.prototype, "refreshAccount", 1);
__decorateClass([
  Export()
], Render.prototype, "getAccount", 1);
__decorateClass([
  Export()
], Render.prototype, "setAccount", 1);
__decorateClass([
  Export()
], Render.prototype, "clearAccount", 1);
__decorateClass([
  Export()
], Render.prototype, "getWorldView", 1);
__decorateClass([
  Export()
], Render.prototype, "onClockReady", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "i18nString", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "showAlert", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "showAlertReconnect", 1);
__decorateClass([
  Export()
], Render.prototype, "showLoading", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "updateProgress", 1);
__decorateClass([
  Export()
], Render.prototype, "hideLoading", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
], Render.prototype, "loadStart", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "roomPause", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "roomResume", 1);
__decorateClass([
  Export()
], Render.prototype, "removeScene", 1);
__decorateClass([
  Export()
], Render.prototype, "showCreatePanelError", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "createSetNickName", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
], Render.prototype, "createAnotherGame", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "setCamerasBounds", 1);
__decorateClass([
  Export()
], Render.prototype, "getCameraMidPos", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "setCamerasScroll", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "setInteractive", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "disableInteractive", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "fadeIn", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "fadeOut", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "fadeAlpha", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "getCurTime", 1);
__decorateClass([
  Export()
], Render.prototype, "gameLoadedCallBack", 1);
__decorateClass([
  Export()
], Render.prototype, "createGameCallBack", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "addFillEffect", 1);
__decorateClass([
  Export()
], Render.prototype, "clearRoom", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], Render.prototype, "clearGame", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "getMessage", 1);
__decorateClass([
  Export()
], Render.prototype, "setLocalStorage", 1);
__decorateClass([
  Export()
], Render.prototype, "getLocalStorage", 1);
__decorateClass([
  Export()
], Render.prototype, "removeLocalStorage", 1);
__decorateClass([
  Export()
], Render.prototype, "createPanel", 1);
__decorateClass([
  Export()
], Render.prototype, "roomstartPlay", 1);
__decorateClass([
  Export()
], Render.prototype, "roomReady", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "playAnimation", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
], Render.prototype, "setHasInteractive", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "setCameraScroller", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "createDragonBones", 1);
__decorateClass([
  Export()
], Render.prototype, "createUserDragonBones", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "createFramesDisplay", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "createTerrainDisplay", 1);
__decorateClass([
  Export()
], Render.prototype, "setModel", 1);
__decorateClass([
  Export()
], Render.prototype, "setPlayerModel", 1);
__decorateClass([
  Export()
], Render.prototype, "addSkybox", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "removeSkybox", 1);
__decorateClass([
  Export()
], Render.prototype, "showMatterDebug", 1);
__decorateClass([
  Export()
], Render.prototype, "hideMatterDebug", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "drawServerPosition", 1);
__decorateClass([
  Export()
], Render.prototype, "hideServerPosition", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "changeAlpha", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "removeBlockObject", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "setPosition", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
], Render.prototype, "showBubble", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "clearBubble", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "startFollow", 1);
__decorateClass([
  Export()
], Render.prototype, "stopFollow", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "cameraFollow", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "cameraPan", 1);
__decorateClass([
  Export()
], Render.prototype, "updateSkyboxState", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.boolean])
], Render.prototype, "setLayerDepth", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "doMove", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
], Render.prototype, "showNickname", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "showTopDisplay", 1);
__decorateClass([
  Export()
], Render.prototype, "SetDisplayVisible", 1);
__decorateClass([
  Export()
], Render.prototype, "showRefernceArea", 1);
__decorateClass([
  Export()
], Render.prototype, "hideRefernceArea", 1);
__decorateClass([
  Export()
], Render.prototype, "displayAnimationChange", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.str])
], Render.prototype, "workerEmitter", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "mount", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
], Render.prototype, "unmount", 1);
__decorateClass([
  Export([webworker_rpc.ParamType.num])
], Render.prototype, "updateInput", 1);
__decorateClass([
  Export()
], Render.prototype, "addEffect", 1);
__decorateClass([
  Export()
], Render.prototype, "removeEffect", 1);
__decorateClass([
  Export()
], Render.prototype, "switchBaseMouseManager", 1);
__decorateClass([
  Export()
], Render.prototype, "liftItem", 1);
__decorateClass([
  Export()
], Render.prototype, "clearMount", 1);
__decorateClass([
  Export()
], Render.prototype, "throwElement", 1);
__decorateClass([
  Export()
], Render.prototype, "switchDecorateMouseManager", 1);
__decorateClass([
  Export()
], Render.prototype, "setRoomSize", 1);
__decorateClass([
  Export()
], Render.prototype, "isCordove", 1);
