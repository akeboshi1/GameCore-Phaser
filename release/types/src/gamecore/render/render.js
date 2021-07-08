var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Game } from "tooqingphaser";
import { Export, RPCPeer, webworker_rpc } from "webworker-rpc";
import { UiUtils, Url } from "utils";
import { Account } from "./account";
import { SceneManager } from "./scenes/scene.manager";
import { LocalStorageManager } from "./managers/local.storage.manager";
import { PlayScene } from "./scenes/play.scene";
import { CamerasRenderManager } from "./cameras/cameras.render.manager";
import { MessageType, SceneName, PlatFormType, i18n, Logger, LogicPos, Pos, ValueResolver } from "structure";
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
(function (MoveStyle) {
    MoveStyle[MoveStyle["DIRECTION_MOVE_STYLE"] = 1] = "DIRECTION_MOVE_STYLE";
    MoveStyle[MoveStyle["FOLLOW_MOUSE_MOVE_STYLE"] = 2] = "FOLLOW_MOUSE_MOVE_STYLE";
    MoveStyle[MoveStyle["PATH_MOVE_STYLE"] = 3] = "PATH_MOVE_STYLE";
})(MoveStyle || (MoveStyle = {}));
var Render = /** @class */ (function (_super) {
    __extends_1(Render, _super);
    function Render(config, callBack) {
        var _this = _super.call(this, config.renderPeerKey) || this;
        _this.isConnect = false;
        _this.sceneCreated = false;
        // protected mPhysicalPeer: any;
        _this.DEFAULT_WIDTH = 360;
        _this.DEFAULT_HEIGHT = 640;
        _this._moveStyle = 0;
        _this.isPause = false;
        _this.mWorkerDestroyMap = new Map();
        _this.hiddenDelay = 60000;
        _this.emitter = new Phaser.Events.EventEmitter();
        _this.mConfig = config;
        _this.mCallBack = callBack;
        _this.gridsDebugger = new GridsDebugger(_this);
        _this.astarDebugger = new AstarDebugger(_this);
        _this.sortDebugger = new SortDebugger(_this);
        _this.editorModeDebugger = new EditorModeDebugger(_this);
        _this.mConnectFailFunc = _this.mConfig.connectFail;
        _this.mGameCreatedFunc = _this.mConfig.game_created;
        _this.mGameLoadedFunc = _this.mConfig.gameLoaded;
        _this.mConfig.hasConnectFail = _this.mConnectFailFunc ? true : false;
        _this.mConfig.hasCloseGame = _this.mConfig.closeGame ? true : false;
        _this.mConfig.hasGameCreated = _this.mConfig.game_created ? true : false;
        _this.mConfig.hasReload = _this.mConfig.reload ? true : false;
        _this.mConfig.hasGameLoaded = _this.mConfig.gameLoaded ? true : false;
        Logger.getInstance().isDebug = _this.mConfig.debugLog || false;
        if (_this.mConfig.devicePixelRatio)
            _this.mConfig.devicePixelRatio = Math.floor(_this.mConfig.devicePixelRatio);
        if (_this.mConfig.width)
            _this.mConfig.width = Math.floor(_this.mConfig.width);
        if (_this.mConfig.height)
            _this.mConfig.height = Math.floor(_this.mConfig.height);
        // rpc不传送方法
        delete _this.mConfig.connectFail;
        delete _this.mConfig.game_created;
        delete _this.mConfig.closeGame;
        delete _this.mConfig.gameLoaded;
        Logger.getInstance().log("config ====>", config);
        // Logger.getInstance().debug("connectfail===>", this.mConnectFailFunc, this.mConfig);
        _this.initConfig();
        Logger.getInstance().log("Render version ====>:", "v" + _this.mConfig.version);
        return _this;
        // const len = 3;
        // const statList = [];
        // for (let i = 0; i < len; i++) {
        //     const stats = new Stats();
        //     // stats.dom.style.position = 'relative';
        //     stats.dom.style.left = 80 * i + "px";
        //     stats.showPanel(i); // 0: fps, 1: ms, 2: mb, 3+: custom
        //     document.body.appendChild(stats.dom);
        //     statList.push(stats);
        // }
        // function animate() {
        //     for (let i = 0, tmpLen = statList.length; i < tmpLen; i++) {
        //         const stats = statList[i];
        //         stats.begin();
        //         stats.end();
        //     }
        //     requestAnimationFrame(animate);
        // }
        // requestAnimationFrame(animate);
    }
    Object.defineProperty(Render.prototype, "renderParam", {
        get: function () {
            return this.mRenderParam;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "mainPeerParam", {
        get: function () {
            return this.mMainPeerParam;
        },
        enumerable: true,
        configurable: true
    });
    Render.prototype.setKeyBoardHeight = function (height) {
        throw new Error("Method not implemented.");
    };
    Object.defineProperty(Render.prototype, "config", {
        get: function () {
            return this.mConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "uiRatio", {
        get: function () {
            return this.mUIRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "devicePixelRatio", {
        get: function () {
            return this.mConfig.devicePixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "uiScale", {
        get: function () {
            return this.mUIScale;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "scaleRatio", {
        get: function () {
            return this.mScaleRatio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "roomSize", {
        get: function () {
            return this.mRoomSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "roomMiniSize", {
        get: function () {
            return this.mRoomMiniSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "account", {
        get: function () {
            return this.mAccount;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "uiManager", {
        get: function () {
            return this.mUiManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "sceneManager", {
        get: function () {
            return this.mSceneManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "guideManager", {
        get: function () {
            return this.mGuideManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "camerasManager", {
        get: function () {
            return this.mCameraManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "displayManager", {
        get: function () {
            return this.mDisplayManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "soundManager", {
        get: function () {
            return this.mSoundManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "localStorageManager", {
        get: function () {
            return this.mLocalStorageManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "editorCanvasManager", {
        get: function () {
            return this.mEditorCanvasManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "game", {
        get: function () {
            return this.mGame;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "url", {
        get: function () {
            return this.resUrl;
        },
        enumerable: true,
        configurable: true
    });
    Render.prototype.getSize = function () {
        if (!this.mGame)
            return;
        return this.mGame.scale.gameSize;
    };
    Render.prototype.createGame = function () {
        var _this = this;
        this.newGame().then(function () {
            _this.createManager();
            _this.mMainPeer.createGame(_this.mConfig);
        });
    };
    Render.prototype.createManager = function () {
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
    };
    // 切游戏的时候销毁各个manmager
    Render.prototype.destroyManager = function () {
        if (this.mUiManager) {
            this.mUiManager.destroy();
            this.mUiManager = undefined;
        }
        if (this.mCameraManager) {
            this.mCameraManager.destroy();
            this.mCameraManager = undefined;
        }
        // if (this.mLocalStorageManager) {
        //     this.mLocalStorageManager.destroy();
        //     this.mLocalStorageManager = undefined;
        // }
        if (this.mSoundManager) {
            this.mSoundManager.destroy();
            this.mSoundManager = undefined;
        }
        if (this.mGuideManager) {
            this.mGuideManager.destroy();
            this.mGuideManager = undefined;
        }
        if (this.mInputManager) {
            this.mInputManager.destroy();
            this.mInputManager = undefined;
        }
        if (this.mDisplayManager) {
            this.mDisplayManager.destroy();
            this.mDisplayManager = undefined;
        }
        if (this.mEditorCanvasManager) {
            this.mEditorCanvasManager.destroy();
            this.mEditorCanvasManager = undefined;
        }
        if (this.mSceneManager) {
            this.mSceneManager.destroy();
            this.mSceneManager = undefined;
        }
    };
    // 切换scene时，清除各个manager缓存
    Render.prototype.clearManager = function () {
        this.sceneCreated = false;
        this.emitter.emit(Render.SCENE_DESTROY);
        if (this.mUiManager)
            this.mUiManager.destroy();
        if (this.mCameraManager)
            this.mCameraManager.destroy();
        // if (this.mLocalStorageManager)
        //     this.mLocalStorageManager.destroy();
        if (this.mSoundManager)
            this.mSoundManager.destroy();
        if (this.mInputManager)
            this.mInputManager.destroy();
        if (this.mDisplayManager)
            this.mDisplayManager.destroy();
        if (this.mSceneManager)
            this.mSceneManager.destroy();
        // if (this.mEditorCanvasManager)
        //     this.mEditorCanvasManager.destroy();
    };
    Render.prototype.enterGame = function () {
        this.mMainPeer.loginEnterWorld();
        this.mGame.scene.remove(SceneName.LOGIN_SCENE);
    };
    Render.prototype.resize = function (width, height) {
        if (width * .65 > height) {
            this.dealTipsScene(SceneName.BLACK_SCENE, true);
        }
        else {
            var blackScene = this.mGame.scene.getScene(SceneName.BLACK_SCENE);
            if (blackScene && blackScene.scene.isActive()) {
                this.dealTipsScene(SceneName.BLACK_SCENE, false);
            }
        }
        // Logger.getInstance().debug("input: ", input);
        if (this.mConfig) {
            this.mConfig.width = width;
            this.mConfig.height = height;
        }
        var w = width * this.mConfig.devicePixelRatio;
        var h = height * this.mConfig.devicePixelRatio;
        this.initRatio();
        if (this.mGame) {
            this.mGame.scale.zoom = 1 / this.mConfig.devicePixelRatio;
            this.mGame.scale.resize(w, h);
            var scenes = this.mGame.scene.scenes;
            for (var _i = 0, scenes_1 = scenes; _i < scenes_1.length; _i++) {
                var scene = scenes_1[_i];
                // 自定义相机
                var camera = scene.cameras.main;
                if (camera && camera.setPixelRatio)
                    camera.setPixelRatio(this.mScaleRatio);
                // scene.setViewPort(camera.x, camera.y, w, h);
                // scene.cameras.main.setViewport(0, 0, w, h);
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
    };
    Render.prototype.onOrientationChange = function (oriation, newWidth, newHeight) {
    };
    Render.prototype.scaleChange = function (scale) {
    };
    Render.prototype.enableClick = function () {
        var playScene = this.sceneManager.getMainScene();
        if (playScene)
            playScene.input.enabled = true;
        var uiScene = this.game.scene.getScene("MainUIScene");
        if (uiScene)
            uiScene.input.enabled = true;
    };
    Render.prototype.disableClick = function () {
        if (!this.sceneManager)
            return;
        var playScene = this.sceneManager.getMainScene();
        if (playScene)
            playScene.input.enabled = false;
        var uiScene = this.game.scene.getScene("MainUIScene");
        if (uiScene)
            uiScene.input.enabled = false;
    };
    Render.prototype.keyboardDidShow = function (keyboardHeight) {
    };
    Render.prototype.keyboardDidHide = function () {
    };
    Render.prototype.visibilitychange = function (state) {
        var _this = this;
        if (state === "hidden") {
            this.mHiddenTime = setTimeout(function () {
                clearTimeout(_this.mHiddenTime);
                _this.hidden();
            }, this.hiddenDelay);
        }
        else {
            clearTimeout(this.mHiddenTime);
        }
    };
    Render.prototype.showErrorMsg = function (msg) {
        this.uiManager.showErrorMsg(msg);
    };
    Render.prototype.hidden = function () {
        var _this = this;
        var loginScene = this.sceneManager.getSceneByName(SceneName.LOGIN_SCENE);
        if (loginScene && loginScene.scene.isActive()) {
            return;
        }
        this.destroy(false).then(function () {
            _this.initWorker();
        });
    };
    Render.prototype.getSound = function (key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.getSound(key));
        });
    };
    Render.prototype.setResourecRoot = function (root) {
        this.resUrl.RESOURCE_ROOT = root;
    };
    Render.prototype.getUIPath = function (dpr, res) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.getUIRes(dpr, res));
        });
    };
    Render.prototype.getResPath = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.RES_PATH);
        });
    };
    Render.prototype.getOsdPath = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.OSD_PATH);
        });
    };
    Render.prototype.getResourceRoot = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.getResRoot(url));
        });
    };
    Render.prototype.getResUIPath = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.RESUI_PATH);
        });
    };
    Render.prototype.getNormalUIPath = function (res) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.resUrl.getNormalUIRes(res));
        });
    };
    Render.prototype.startFullscreen = function () {
    };
    Render.prototype.stopFullscreen = function () {
    };
    Render.prototype.setGameConfig = function (config) {
    };
    Render.prototype.updatePalette = function (palette) {
        this.mainPeer.updatePalette(palette);
    };
    Render.prototype.updateMoss = function (moss) {
        this.mainPeer.updateMoss(moss);
    };
    Render.prototype.restart = function (config, callBack) {
    };
    Render.prototype.initUI = function () {
        this.mainPeer.initUI();
    };
    Render.prototype.startRoomPlay = function () {
        this.sceneCreated = true;
        this.emitter.emit(Render.SCENE_CREATED);
        this.mainPeer.startRoomPlay();
    };
    Render.prototype.updateRoom = function (time, delta) {
        // this.mainPeer.updateRoom(time, delta);
        if (this.mInputManager)
            this.mInputManager.update(time, delta);
        if (this.mDisplayManager)
            this.mDisplayManager.update(time, delta);
    };
    Render.prototype.destroyWorker = function (workers) {
        var _this = this;
        var arr = [];
        var _loop_1 = function (w) {
            var valuePromse = new ValueResolver();
            var p = valuePromse.promise(function () {
                // if (this.remote[w]) this.remote[w].destroy();
                var worker = _this.remote[w];
                for (var key in worker) {
                    if (Object.prototype.hasOwnProperty.call(worker, key)) {
                        var element = worker[key];
                        element.destroy();
                    }
                }
            });
            arr.push(p);
            this_1.mWorkerDestroyMap.set(w, valuePromse);
        };
        var this_1 = this;
        for (var _i = 0, workers_1 = workers; _i < workers_1.length; _i++) {
            var w = workers_1[_i];
            _loop_1(w);
        }
        return Promise.all(arr);
    };
    Render.prototype.destroy = function (destroyPeer) {
        var _this = this;
        if (destroyPeer === void 0) { destroyPeer = true; }
        return new Promise(function (resolve, reject) {
            _this.destroyWorker([_this.mMainPeerParam.key]).then(function () {
                if (_this.mGame) {
                    _this.destroyManager();
                    _this.mGame.events.off(Phaser.Core.Events.FOCUS, _this.onFocus, _this);
                    _this.mGame.events.off(Phaser.Core.Events.BLUR, _this.onBlur, _this);
                    _this.mGame.scale.off("enterfullscreen", _this.onFullScreenChange, _this);
                    _this.mGame.scale.off("leavefullscreen", _this.onFullScreenChange, _this);
                    _this.mGame.scale.off("orientationchange", _this.onOrientationChange, _this);
                    _this.mGame.plugins.removeGlobalPlugin("rexButton");
                    _this.mGame.plugins.removeGlobalPlugin("rexNinePatchPlugin");
                    _this.mGame.plugins.removeGlobalPlugin("rexInputText");
                    _this.mGame.plugins.removeGlobalPlugin("rexBBCodeTextPlugin");
                    _this.mGame.plugins.removeGlobalPlugin("rexMoveTo");
                    _this.mGame.plugins.removeScenePlugin("DragonBones");
                    _this.mGame.events.once(Phaser.Core.Events.DESTROY, function () {
                        _this.mGame = undefined;
                        if (destroyPeer)
                            _super.prototype.destroy.call(_this);
                        resolve();
                    });
                    _this.mGame.destroy(true);
                }
                else {
                    if (destroyPeer)
                        _super.prototype.destroy.call(_this);
                    resolve();
                }
            });
        });
    };
    Object.defineProperty(Render.prototype, "curTime", {
        get: function () {
            return this._curTime;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Render.prototype, "moveStyle", {
        get: function () {
            return this._moveStyle;
        },
        enumerable: true,
        configurable: true
    });
    Render.prototype.initGameConfig = function (config) {
        this.mainPeer.initGameConfig(JSON.stringify(config));
    };
    // public startConnect(gateway: ServerAddress) {
    //     this.mainPeer.startConnect(gateway.host, gateway.port, gateway.secure);
    // }
    Render.prototype.newGame = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.mGame) {
                resolve(true);
            }
            // Logger.getInstance().debug("dragonbones: ", dragonBones);
            _this.gameConfig = {
                type: Phaser.AUTO,
                parent: _this.mConfig.parent,
                loader: {
                    timeout: 10000,
                },
                disableContextMenu: true,
                transparent: false,
                backgroundColor: 0x0,
                fps: {
                    target: 30,
                    forceSetTimeOut: true
                },
                dom: {
                    createContainer: true,
                },
                plugins: {
                    scene: [
                        {
                            key: "DragonBones",
                            plugin: dragonBones.phaser.plugin.DragonBonesScenePlugin,
                            mapping: "dragonbone",
                        },
                    ],
                },
                render: {
                    pixelArt: true,
                    roundPixels: true,
                },
                scale: {
                    mode: Phaser.Scale.NONE,
                    width: _this.mConfig.baseWidth * _this.devicePixelRatio,
                    height: _this.mConfig.baseHeight * _this.devicePixelRatio,
                    zoom: 1 / _this.devicePixelRatio,
                },
            };
            Object.assign(_this.gameConfig, _this.mConfig);
            _this.mGame = new Game(_this.gameConfig);
            if (_this.mGame.device.os.desktop) {
                _this.mUIScale = 1;
                _this.mConfig.platform = PlatFormType.PC;
            }
            resolve(true);
        });
    };
    Render.prototype.closeConnect = function (boo) {
        this.mainPeer.closeConnect(boo);
    };
    Render.prototype.send = function (packet) {
        this.mainPeer.send(packet.Serialization);
    };
    Render.prototype.terminate = function () {
        this.mainPeer.terminate();
    };
    Render.prototype.changeScene = function (scene) {
        if (this.mInputManager)
            this.mInputManager.setScene(scene);
        if (this.mSoundManager)
            this.mSoundManager.setScene(scene);
    };
    Render.prototype.onFocus = function () {
        // this.resumeScene();
    };
    Render.prototype.onBlur = function () {
        // this.pauseScene();
    };
    Render.prototype.syncClock = function (times) {
        this.mainPeer.syncClock(times);
    };
    Render.prototype.clearClock = function () {
        this.mainPeer.clearClock();
    };
    Render.prototype.destroyClock = function () {
        this.mainPeer.destroyClock();
    };
    Render.prototype.exitUser = function () {
        this.mainPeer.exitUser();
    };
    Render.prototype.requestCurTime = function () {
        this.mainPeer.requestCurTime();
    };
    Render.prototype.setDirection = function (id, direction) {
        this.mainPeer.setDirection(id, direction);
    };
    Render.prototype.onLoginErrorHanlerCallBack = function (name, idcard) {
    };
    Render.prototype.onShowErrorHandlerCallBack = function (error, okText) {
    };
    Render.prototype.getCurrentRoomSize = function () {
        return this.mainPeer.getCurrentRoomSize();
    };
    Render.prototype.getCurrentRoomMiniSize = function () {
        return this.mainPeer.getCurrentRoomMiniSize();
    };
    Render.prototype.syncCameraScroll = function () {
        if (this.mMainPeer)
            this.mMainPeer.syncCameraScroll();
    };
    Render.prototype.renderEmitter = function (eventType, data) {
        if (this.mMainPeer)
            this.mMainPeer.renderEmitter(eventType, data);
    };
    Render.prototype.showMediator = function (name, isShow) {
        if (this.mMainPeer)
            this.mMainPeer.showMediator(name, isShow);
    };
    Render.prototype.getMainScene = function () {
        return this.mSceneManager.getMainScene();
    };
    Render.prototype.updateGateway = function () {
        var accountData = this.account.accountData;
        if (accountData && accountData.gateway) {
            if (!this.mConfig.server_addr) {
                this.mConfig.server_addr = accountData.gateway;
            }
            else {
                var server_addr = this.mConfig.server_addr;
                if (!server_addr.host) {
                    server_addr.host = accountData.gateway.host;
                }
                if (!server_addr.port) {
                    server_addr.port = accountData.gateway.port;
                }
            }
            if (this.mConfig.server_addr.secure === undefined)
                this.mConfig.server_addr.secure = true;
            this.mainPeer.setConfig(this.mConfig);
        }
    };
    Render.prototype.destroyAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.mAccount) {
                            _this.mAccount.destroy();
                        }
                        resolve();
                    })];
            });
        });
    };
    Render.prototype.reconnect = function () {
        this.createGame();
    };
    Render.prototype.showLogin = function () {
        var data = { dpr: this.uiRatio, render: this };
        if (this.sceneManager)
            this.mSceneManager.startScene(SceneName.LOGIN_SCENE, data);
    };
    Render.prototype.hideLogin = function () {
        if (this.sceneManager)
            this.sceneManager.stopScene(SceneName.LOGIN_SCENE);
    };
    Render.prototype.checkContains = function (id, x, y) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var boo = _this.mCameraManager.checkContains(new Pos(x, y));
            resolve(boo);
        });
    };
    Render.prototype.showCreateRolePanel = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // const createPanel = () => {
            //     this.mUiManager.showPanel(ModuleName.PICACREATEROLE_NAME, data).then((panel) => {
            //         if (!panel) {
            //             reject(false);
            //             return;
            //         }
            //         panel.addExportListener(() => {
            //             resolve(true);
            //         });
            //     });
            // };
            if (_this.mUiManager.scene && _this.mUiManager.scene.scene.key === SceneName.CREATE_ROLE_SCENE) {
                // createPanel();
                resolve(true);
            }
            else {
                _this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, {
                    callBack: function () {
                        resolve(true);
                        // createPanel();
                    }
                });
            }
        });
    };
    Render.prototype.showTipsAlert = function (str) {
        this.mUiManager.showTipsAlert({ text: [{ text: str, node: undefined }] });
    };
    Render.prototype.updateModel = function (id, displayInfo) {
        if (this.displayManager)
            this.displayManager.updateModel(id, displayInfo);
    };
    Render.prototype.getIndexInLayer = function (id) {
        if (!this.displayManager)
            return -1;
        var display = this.displayManager.getDisplay(id);
        if (!display)
            return -1;
        return display.parentContainer.getIndex(display);
    };
    Render.prototype.changeLayer = function (id, layerName) {
        if (!this.displayManager)
            return;
        var display = this.displayManager.getDisplay(id);
        if (!display)
            return;
        display.parentContainer.remove(display);
        this.displayManager.addToLayer(layerName, display);
    };
    Render.prototype.showCreateRole = function (params) {
        if (this.mSceneManager)
            this.mSceneManager.startScene(SceneName.CREATE_ROLE_SCENE, { render: this, params: params });
    };
    Render.prototype.hideCreateRole = function () {
        if (this.mSceneManager)
            this.mSceneManager.stopScene(SceneName.CREATE_ROLE_SCENE);
    };
    Render.prototype.showPlay = function (params) {
        if (this.mSceneManager)
            this.mSceneManager.startScene(SceneName.PLAY_SCENE, { render: this, params: params });
    };
    Render.prototype.updateFPS = function () {
        if (!this.game)
            return;
        var scene = this.game.scene.getScene(SceneName.MAINUI_SCENE);
        if (!scene || !scene.scene.isVisible || !scene.scene.isActive || !scene.scene.isPaused)
            return;
        scene.updateFPS();
    };
    Render.prototype.endFPS = function () {
    };
    Render.prototype.hidePlay = function () {
        if (this.mSceneManager)
            this.mSceneManager.stopScene(SceneName.PLAY_SCENE);
    };
    Render.prototype.showPanel = function (panelName, params) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mUiManager) {
                reject(false);
                return;
            }
            _this.mUiManager.showPanel(panelName, params).then(function (panel) {
                if (!panel) {
                    reject(false);
                    return;
                }
                panel.addExportListener(function () {
                    resolve(true);
                });
            });
        });
    };
    Render.prototype.hidePanel = function (type) {
        if (this.mUiManager)
            this.mUiManager.hidePanel(type);
    };
    Render.prototype.showBatchPanel = function (type, data) {
        if (this.mUiManager)
            this.mUiManager.showBatchPanel(type, data);
    };
    Render.prototype.hideBatchPanel = function (type) {
        if (this.mUiManager)
            this.mUiManager.hideBatchPanel(type);
    };
    Render.prototype.reload = function () {
        Logger.getInstance().log("game relaod =====>");
        // window.location.reload();
    };
    Render.prototype.showJoystick = function () {
        if (this.mInputManager)
            this.mInputManager.showJoystick();
    };
    Render.prototype.setInputVisible = function (allow) {
    };
    Render.prototype.onShowErrorHandler = function (error, okText) {
        this.onShowErrorHandlerCallBack(error, okText);
    };
    Render.prototype.onLoginErrorHanler = function (name, idcard) {
        this.onLoginErrorHanlerCallBack(name, idcard);
    };
    Render.prototype.updateCharacterPackage = function () {
        if (this.emitter)
            this.emitter.emit(MessageType.UPDATED_CHARACTER_PACKAGE);
    };
    Render.prototype.displayReady = function (id, animation) {
        var display = this.mDisplayManager.getDisplay(id);
        if (!display || !animation)
            return;
        display.play(animation);
        display.showNickname();
    };
    Render.prototype.soundChangeRoom = function (roomID) {
    };
    Render.prototype.playSoundByKey = function (key) {
        if (this.mSoundManager)
            this.mSoundManager.playSound({ soundKey: key });
    };
    Render.prototype.playOsdSound = function (content) {
        if (this.mSoundManager)
            this.mSoundManager.playOsdSound(content);
    };
    Render.prototype.playSound = function (content) {
        if (this.mSoundManager)
            this.mSoundManager.playSound(content);
    };
    Render.prototype.stopAllSound = function () {
        if (this.mSoundManager)
            this.mSoundManager.stopAll();
    };
    Render.prototype.pauseAll = function () {
        if (this.mSoundManager)
            this.mSoundManager.pauseAll();
    };
    Render.prototype.startFireMove = function (id, pos) {
        if (this.mDisplayManager)
            this.mDisplayManager.startFireMove(id, pos);
    };
    Render.prototype.resume = function () {
        if (this.mSoundManager)
            this.mSoundManager.resume();
    };
    Render.prototype.onConnected = function () {
        this.isConnect = true;
    };
    Render.prototype.onDisConnected = function () {
        this.isConnect = false;
    };
    Render.prototype.onConnectError = function (error) {
        this.isConnect = false;
    };
    Render.prototype.connectFail = function () {
        this.isConnect = false;
        if (this.mConnectFailFunc)
            this.mConnectFailFunc();
        // this.mWorld.connectFail();
    };
    Render.prototype.updateUIState = function (panelName, ui) {
        if (this.uiManager)
            this.uiManager.updateUIState(panelName, ui);
    };
    Render.prototype.setMoveStyle = function (moveStyle) {
        this._moveStyle = moveStyle;
    };
    Render.prototype.onEnterRoom = function (scene) {
    };
    Render.prototype.scaleTween = function (id, type) {
    };
    Render.prototype.getRenderPosition = function (id, type) {
        // todo
        return [];
    };
    Render.prototype.createAccount = function (gameID, worldID, sceneID, loc, spawnPointId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mAccount) {
                _this.mAccount = new Account();
            }
            resolve(true);
        });
    };
    Render.prototype.refreshAccount = function (account) {
        this.account.refreshToken(account);
        this.updateGateway();
    };
    Render.prototype.getAccount = function () {
        return this.mAccount;
    };
    Render.prototype.setAccount = function (val) {
        this.mAccount.setAccount(val);
        this.updateGateway();
    };
    Render.prototype.clearAccount = function () {
        this.mAccount.clear();
    };
    Render.prototype.getWorldView = function () {
        var _this = this;
        if (!this.sceneManager)
            return;
        return new Promise(function (resolve, reject) {
            var playScene = _this.sceneManager.getMainScene();
            if (playScene) {
                var camera = playScene.cameras.main;
                var rect = camera.worldView;
                var blockWidth = 300;
                var blockHeight = 150;
                var x = rect.x, y = rect.y;
                var obj = {
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
    };
    Render.prototype.onClockReady = function () {
        // this.mWorld.onClockReady();
    };
    Render.prototype.i18nString = function (val) {
        return i18n.t(val);
    };
    Render.prototype.showAlert = function (text, ok, needI18n) {
        var _this = this;
        // 告诉render显示警告框
        if (ok === undefined)
            ok = true;
        if (needI18n === undefined)
            needI18n = true;
        return new Promise(function (resolve, reject) {
            if (_this.uiManager) {
                if (needI18n)
                    text = i18n.t(text);
                _this.uiManager.showAlertView(text, ok, undefined, function () {
                    resolve(null);
                });
            }
        });
    };
    Render.prototype.showAlertReconnect = function (text) {
        var _this = this;
        // 告诉render显示警告框
        if (this.uiManager)
            this.uiManager.showAlertView(text, true, false, function () {
                _this.mainPeer.reconnect();
            });
    };
    Render.prototype.showLoading = function (data) {
        var _this = this;
        if (!this.mSceneManager) {
            return;
        }
        if (data === undefined) {
            data = {};
        }
        data.callBack = function () {
            if (data.sceneName)
                _this.mSceneManager.startScene(data.sceneName);
            return new Promise(function (resolve, reject) {
                resolve(null);
            });
        };
        data.dpr = this.uiRatio;
        data.version = this.mConfig.version;
        this.mSceneManager.startScene(SceneName.LOADING_SCENE, data);
    };
    Render.prototype.updateProgress = function (progress) {
        if (progress > 1)
            progress = 1;
        progress.toFixed(2);
        if (this.mSceneManager)
            this.mSceneManager.showProgress(progress);
    };
    Render.prototype.hideLoading = function () {
        if (!this.mSceneManager) {
            return Logger.getInstance().error("HideLoading failed. SceneManager does not exist.");
        }
        this.mSceneManager.sleepScene(SceneName.LOADING_SCENE);
    };
    Render.prototype.loadStart = function (str, scene) {
    };
    Render.prototype.roomPause = function (roomID) {
    };
    Render.prototype.roomResume = function (roomID) {
    };
    Render.prototype.removeScene = function (sceneName) {
        if (this.sceneManager)
            this.sceneManager.remove(sceneName);
    };
    Render.prototype.showCreatePanelError = function (content) {
    };
    Render.prototype.createSetNickName = function (name) {
    };
    Render.prototype.createAnotherGame = function (gameId, virtualWorldId, sceneId, px, py, pz, spawnPointId, worldId) {
        // this.newGame().then(() => {
        //     // todo sceneManager loginScene.name
        // });
        Logger.getInstance().debug("gotoanothergame ====>");
        this.account.enterGame(gameId, virtualWorldId, sceneId, { x: px, y: py, z: pz }, spawnPointId, worldId);
    };
    Render.prototype.setCamerasBounds = function (x, y, width, height) {
        if (this.mCameraManager)
            this.mCameraManager.setBounds(x, y, width, height);
    };
    // 获取当前主摄像机注视中心点位置(世界坐标)
    Render.prototype.getCameraMidPos = function () {
        if (!this.mCameraManager)
            return new LogicPos(0, 0);
        var rect = this.mCameraManager.camera.worldView;
        return new LogicPos((rect.x + rect.width / 2) / this.scaleRatio, (rect.y + rect.height / 2) / this.scaleRatio);
    };
    Render.prototype.setCamerasScroll = function (x, y, effect) {
        if (!this.mCameraManager) {
            return;
        }
        this.mCameraManager.scrollTargetPoint(x, y, effect);
    };
    Render.prototype.setInteractive = function (id, type) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.setInteractive();
    };
    Render.prototype.disableInteractive = function (id, type) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.disableInteractive();
    };
    Render.prototype.fadeIn = function (id, type) {
    };
    Render.prototype.fadeOut = function (id, type) {
    };
    Render.prototype.fadeAlpha = function (id, type, alpha) {
    };
    Render.prototype.getCurTime = function (curTime) {
        return this._curTime = curTime;
    };
    Render.prototype.gameLoadedCallBack = function () {
        if (this.mGameLoadedFunc)
            this.mGameLoadedFunc.call(this);
    };
    Render.prototype.createGameCallBack = function (keyEvents) {
        this.mGame.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.mGame.events.on(Phaser.Core.Events.BLUR, this.onBlur, this);
        this.resize(this.mConfig.width, this.mConfig.height);
        if (this.mGameCreatedFunc) {
            Logger.getInstance().log("render game_created");
            this.mGameCreatedFunc.call(this);
        }
        this.gameCreated(keyEvents);
    };
    Render.prototype.addFillEffect = function (posX, posY, status) {
        if (this.displayManager)
            this.displayManager.addFillEffect(posX, posY, status);
    };
    Render.prototype.clearRoom = function () {
        this.clearManager();
    };
    Render.prototype.clearGame = function (boo) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.mGame) {
                Logger.getInstance().log("====================>>>>>>>> clear game");
                _this.mGame.events.off(Phaser.Core.Events.FOCUS, _this.onFocus, _this);
                _this.mGame.events.off(Phaser.Core.Events.BLUR, _this.onBlur, _this);
                _this.mGame.scale.off("enterfullscreen", _this.onFullScreenChange, _this);
                _this.mGame.scale.off("leavefullscreen", _this.onFullScreenChange, _this);
                _this.mGame.scale.off("orientationchange", _this.onOrientationChange, _this);
                _this.mGame.plugins.removeGlobalPlugin("rexButton");
                _this.mGame.plugins.removeGlobalPlugin("rexNinePatchPlugin");
                _this.mGame.plugins.removeGlobalPlugin("rexInputText");
                _this.mGame.plugins.removeGlobalPlugin("rexBBCodeTextPlugin");
                _this.mGame.plugins.removeGlobalPlugin("rexMoveTo");
                _this.mGame.plugins.removeScenePlugin("DragonBones");
                _this.destroyManager();
                _this.mGame.events.once(Phaser.Core.Events.DESTROY, function () {
                    _this.mGame = undefined;
                    if (boo) {
                        _this.newGame().then(function () {
                            _this.createManager();
                            resolve();
                        });
                        return;
                    }
                    resolve();
                });
                _this.mGame.destroy(true);
            }
            else {
                resolve();
            }
        });
    };
    Render.prototype.getMessage = function (val) {
        return i18n.t(val);
    };
    Render.prototype.setLocalStorage = function (key, value) {
        if (this.localStorageManager)
            this.localStorageManager.setItem(key, value);
    };
    Render.prototype.getLocalStorage = function (key) {
        return this.localStorageManager ? this.localStorageManager.getItem(key) : "";
    };
    Render.prototype.removeLocalStorage = function (key) {
        if (this.localStorageManager)
            this.localStorageManager.removeItem(key);
    };
    Render.prototype.createPanel = function (name, key) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.uiManager) {
                reject("uiManager not found");
                return;
            }
            var panel = _this.uiManager.showPanel(name);
            _this.exportProperty(panel, _this, key).onceReady(function () {
                resolve(true);
            });
        });
    };
    Render.prototype.roomstartPlay = function () {
        if (!this.mSceneManager || !this.mCameraManager)
            return;
        var scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        this.mCameraManager.camera = scene.cameras.main;
    };
    Render.prototype.roomReady = function () {
        if (!this.mSceneManager || !this.mCameraManager)
            return;
        var scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        if (scene instanceof PlayScene)
            scene.onRoomCreated();
    };
    Render.prototype.playAnimation = function (id, animation, field, times) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.play(animation);
    };
    Render.prototype.setHasInteractive = function (id, hasInteractive) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.hasInteractive = hasInteractive;
    };
    Render.prototype.setCameraScroller = function (actorX, actorY) {
        // Logger.getInstance().debug("syncCameraScroll");
        if (!this.mSceneManager || !this.mCameraManager)
            return;
        var scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        var sceneScrale = scene.scale;
        this.mCameraManager.setScroll(actorX * this.scaleRatio - sceneScrale.width / 2, actorY * this.scaleRatio - sceneScrale.height / 2);
        this.syncCameraScroll();
    };
    Render.prototype.createDragonBones = function (id, displayInfo, layer, nodeType) {
        if (this.mDisplayManager)
            this.mDisplayManager.addDragonbonesDisplay(id, displayInfo, layer, nodeType);
    };
    Render.prototype.createUserDragonBones = function (displayInfo, layer) {
        if (this.mDisplayManager)
            this.mDisplayManager.addUserDragonbonesDisplay(displayInfo, true, layer);
    };
    Render.prototype.createFramesDisplay = function (id, displayInfo, layer) {
        if (this.mDisplayManager)
            this.mDisplayManager.addFramesDisplay(id, displayInfo, layer);
        else
            Logger.getInstance().debug("no displayManager ====>");
    };
    Render.prototype.createTerrainDisplay = function (id, displayInfo, layer) {
        if (this.mDisplayManager)
            this.mDisplayManager.addTerrainDisplay(id, displayInfo, layer);
    };
    Render.prototype.setModel = function (sprite) {
        if (this.mDisplayManager)
            this.mDisplayManager.setModel(sprite);
    };
    Render.prototype.setPlayerModel = function (sprite) {
        if (this.mDisplayManager)
            this.mDisplayManager.setModel(sprite);
    };
    Render.prototype.addSkybox = function (scenery) {
        if (this.mDisplayManager)
            this.mDisplayManager.addSkybox(scenery);
    };
    Render.prototype.removeSkybox = function (id) {
        if (this.mDisplayManager)
            this.mDisplayManager.removeSkybox(id);
    };
    Render.prototype.showMatterDebug = function (vertices) {
        if (this.mDisplayManager)
            this.mDisplayManager.showMatterDebug(vertices);
    };
    Render.prototype.hideMatterDebug = function () {
        if (this.mDisplayManager)
            this.mDisplayManager.hideMatterDebug();
    };
    Render.prototype.drawServerPosition = function (x, y) {
        if (this.mDisplayManager)
            this.mDisplayManager.drawServerPosition(x, y);
    };
    Render.prototype.hideServerPosition = function () {
        if (this.mDisplayManager)
            this.mDisplayManager.hideServerPosition();
    };
    Render.prototype.changeAlpha = function (id, alpha) {
        if (this.mDisplayManager)
            this.mDisplayManager.changeAlpha(id, alpha);
    };
    Render.prototype.removeBlockObject = function (id) {
        if (this.mDisplayManager)
            this.mDisplayManager.removeDisplay(id);
    };
    Render.prototype.setPosition = function (id, x, y, z) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.setPosition(x, y, z);
    };
    Render.prototype.showBubble = function (id, text, setting) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.showBubble(text, setting);
    };
    Render.prototype.clearBubble = function (id) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            display.clearBubble();
    };
    Render.prototype.startFollow = function (id) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display)
            this.mCameraManager.startFollow(display);
    };
    Render.prototype.stopFollow = function () {
        if (this.mCameraManager)
            this.mCameraManager.stopFollow();
    };
    Render.prototype.cameraFollow = function (id, effect) {
        return __awaiter(this, void 0, void 0, function () {
            var target, position;
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.mDisplayManager || !this.mCameraManager)
                    return [2 /*return*/];
                target = this.mDisplayManager.getDisplay(id);
                if (target) {
                    if (effect === "liner") {
                        position = target.getPosition();
                        // 取消follow，避免pan结束镜头回到原来target
                        this.mCameraManager.stopFollow();
                        this.mCameraManager.pan(position.x, position.y, 300).then(function () {
                            _this.mCameraManager.startFollow(target);
                        });
                    }
                    else {
                        this.mCameraManager.startFollow(target);
                    }
                }
                else {
                    this.mCameraManager.stopFollow();
                }
                return [2 /*return*/];
            });
        });
    };
    Render.prototype.cameraPan = function (id) {
        if (!this.mDisplayManager)
            return;
        var display = this.mDisplayManager.getDisplay(id);
        if (display) {
            this.mCameraManager.pan(display.x, display.y, 300);
        }
    };
    Render.prototype.updateSkyboxState = function (state) {
        if (this.mDisplayManager)
            this.mDisplayManager.updateSkyboxState(state);
    };
    Render.prototype.setLayerDepth = function (val) {
        if (!this.mSceneManager)
            return;
        var scene = this.mSceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal("scene does not exist");
            return;
        }
        scene.layerManager.depthSurfaceDirty = val;
    };
    Render.prototype.doMove = function (id, moveData) {
        if (this.mDisplayManager)
            this.mDisplayManager.displayDoMove(id, moveData);
    };
    Render.prototype.showNickname = function (id, name) {
        if (this.mDisplayManager)
            this.mDisplayManager.showNickname(id, name);
    };
    Render.prototype.showTopDisplay = function (id, state) {
        if (this.mDisplayManager)
            this.mDisplayManager.showTopDisplay(id, state);
    };
    Render.prototype.SetDisplayVisible = function (id, visible) {
        if (!this.mDisplayManager)
            return;
        var display = this.displayManager.getDisplay(id);
        if (!display)
            return;
        display.setVisible(visible);
    };
    Render.prototype.showRefernceArea = function (id, area, origin, conflictMap) {
        if (!this.mDisplayManager)
            return;
        var ele = this.mDisplayManager.getDisplay(id);
        if (!ele)
            return;
        ele.showRefernceArea(area, origin, conflictMap);
    };
    Render.prototype.hideRefernceArea = function (id) {
        if (!this.mDisplayManager)
            return;
        var ele = this.mDisplayManager.getDisplay(id);
        if (!ele)
            return;
        ele.hideRefernceArea();
    };
    Render.prototype.displayAnimationChange = function (data) {
        if (!this.mDisplayManager)
            return;
        var id = data.id;
        var direction = data.direction;
        var display = this.mDisplayManager.getDisplay(id);
        if (display) {
            display.direction = direction;
            display.play(data.animation);
        }
    };
    Render.prototype.workerEmitter = function (eventType, data) {
        if (!this.emitter)
            return;
        this.emitter.emit(eventType, data);
    };
    Render.prototype.mount = function (id, targetID, targetIndex) {
        if (this.mDisplayManager)
            this.mDisplayManager.mount(id, targetID, targetIndex);
    };
    Render.prototype.unmount = function (id, targetID) {
        if (this.mDisplayManager)
            this.mDisplayManager.unmount(id, targetID);
    };
    Render.prototype.updateInput = function (val) {
        if (this.sceneManager)
            this.sceneManager.updateInput(val);
    };
    Render.prototype.addEffect = function (target, effectID, display) {
        if (this.mDisplayManager)
            this.mDisplayManager.addEffect(target, effectID, display);
    };
    Render.prototype.removeEffect = function (target, effectID) {
        if (this.mDisplayManager)
            this.mDisplayManager.removeEffect(target, effectID);
    };
    Render.prototype.switchBaseMouseManager = function () {
        if (!this.mInputManager)
            return;
        this.mInputManager.changeMouseManager(new MouseManager(this));
        var playScene = this.mGame.scene.getScene(SceneName.PLAY_SCENE);
        if (playScene) {
            playScene.resumeMotion();
            playScene.enableCameraMove();
        }
    };
    Render.prototype.liftItem = function (id, display, animation) {
        if (!this.mDisplayManager)
            return;
        this.mDisplayManager.liftItem(id, display, animation);
    };
    Render.prototype.clearMount = function (id) {
        if (!this.mDisplayManager)
            return;
        this.mDisplayManager.clearMount(id);
    };
    Render.prototype.throwElement = function (userid, target, display, animation) {
        if (!this.mDisplayManager)
            return;
        this.mDisplayManager.throwElement(userid, target, display, animation);
    };
    Render.prototype.switchDecorateMouseManager = function () {
    };
    Render.prototype.setRoomSize = function (size, miniSize) {
        this.mRoomSize = size;
        this.mRoomMiniSize = miniSize;
    };
    Render.prototype.isCordove = function () {
        var pktGlobal = window["pktGlobal"];
        return (pktGlobal && pktGlobal.envPlatform === "Cordova");
    };
    Render.prototype.onWorkerUnlinked = function (worker) {
        if (!this.mWorkerDestroyMap.has(worker))
            return;
        this.mWorkerDestroyMap.get(worker).resolve(null);
        this.mWorkerDestroyMap.delete(worker);
    };
    Render.prototype.initConfig = function () {
        if (!this.mConfig.devicePixelRatio) {
            this.mConfig.devicePixelRatio = window.devicePixelRatio || 2;
        }
        if (this.mConfig.width === undefined) {
            this.mConfig.width = window.innerWidth;
        }
        if (this.mConfig.height === undefined) {
            this.mConfig.height = window.innerHeight;
        }
        this.resUrl = new Url();
        this.resUrl.init({ osd: this.mConfig.osd, res: "resources/", resUI: "resources/ui/" });
        this.initRatio();
    };
    Render.prototype.initRatio = function () {
        this.mScaleRatio = Math.ceil(this.mConfig.devicePixelRatio || UiUtils.baseDpr);
        this.mConfig.scale_ratio = this.mScaleRatio;
        this.mUIRatio = Math.round(this.mConfig.devicePixelRatio || UiUtils.baseDpr);
        if (this.mUIRatio > UiUtils.MaxDpr) {
            this.mUIRatio = UiUtils.MaxDpr;
        }
        var scaleW = (this.mConfig.width / this.DEFAULT_WIDTH) * (this.mConfig.devicePixelRatio / this.mUIRatio);
        var desktop = false;
        if (this.game)
            desktop = this.game.device.os.desktop;
        this.mUIScale = desktop ? UiUtils.baseScale : scaleW;
    };
    Render.prototype.initWorker = function () {
        var _this = this;
        Logger.getInstance().log("startLink mainpeer", this.mMainPeerParam.key, this.mMainPeerParam.url);
        var key = this.mMainPeerParam.key;
        var peerName = this.mMainPeerParam.name;
        this.attach(this.mMainPeerParam.key, this.mMainPeerParam.url).onceReady(function () {
            _this.mMainPeer = _this.remote[key][peerName];
            _this.mMainPeer.updateFps();
            _this.createGame();
            Logger.getInstance().debug("worker onReady");
        });
    };
    Render.prototype.dealTipsScene = function (sceneName, show) {
        if (!this.mGame.scene.getScene(sceneName)) {
            var sceneClass = this.sceneManager.getSceneClass(sceneName);
            this.mGame.scene.add(sceneName, sceneClass);
        }
        var pauseScene = this.mGame.scene.getScene(SceneName.GAMEPAUSE_SCENE);
        var playScene = this.mGame.scene.getScene(SceneName.PLAY_SCENE);
        var uiScene = this.mGame.scene.getScene(SceneName.MAINUI_SCENE);
        var loginScene = this.mGame.scene.getScene(SceneName.LOGIN_SCENE);
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
        }
        else {
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
    };
    Render.prototype.onFullScreenChange = function () {
        this.resize(this.mGame.scale.gameSize.width, this.mGame.scale.gameSize.height);
    };
    Render.prototype.gameCreated = function (keyEvents) {
        if (this.mCallBack) {
            this.mCallBack();
        }
        if (this.mConfig.game_created) {
            this.mConfig.game_created();
        }
        this.mGame.scale.on("enterfullscreen", this.onFullScreenChange, this);
        this.mGame.scale.on("leavefullscreen", this.onFullScreenChange, this);
    };
    Render.prototype.resumeScene = function () {
        var type = this.mConfig.platform;
        switch (type) {
            case PlatFormType.APP:
                this.mainPeer.reconnect();
                break;
            case PlatFormType.PC:
            case PlatFormType.NOPC:
                Logger.getInstance().debug("#BlackSceneFromBackground; world.resumeScene(); isPause:" + this.isPause + "; mGame:" + this.mGame);
                if (!this.isPause) {
                    return;
                }
                this.isPause = false;
                if (this.mGame) {
                    if (this.sceneManager.currentScene)
                        this.sceneManager.currentScene.scene.resume();
                    this.mainPeer.onFocus();
                    // this.mConnection.onFocus();
                    // this.mRoomMamager.onFocus();
                    this.dealTipsScene(SceneName.GAMEPAUSE_SCENE, false);
                }
                break;
        }
    };
    Render.prototype.pauseScene = function () {
        Logger.getInstance().debug("#BlackSceneFromBackground; world.pauseScene(); isPause:" + this.isPause + "; mGame:" + this.mGame);
        if (this.isPause) {
            return;
        }
        this.isPause = true;
        if (this.mGame) {
            if (this.sceneManager.currentScene)
                this.sceneManager.currentScene.scene.pause();
            this.mainPeer.onBlur();
            // this.mConnection.onBlur();
            // this.mRoomMamager.onBlur();
            this.dealTipsScene(SceneName.GAMEPAUSE_SCENE, true);
        }
    };
    Object.defineProperty(Render.prototype, "mainPeer", {
        get: function () {
            if (!this.mMainPeer) {
                throw new Error("can't find main worker");
            }
            return this.mMainPeer;
        },
        enumerable: true,
        configurable: true
    });
    Render.SCENE_CREATED = "SCENE_CREATED";
    Render.SCENE_DESTROY = "SCENE_DESTROY";
    __decorate([
        Export()
    ], Render.prototype, "gridsDebugger", void 0);
    __decorate([
        Export()
    ], Render.prototype, "astarDebugger", void 0);
    __decorate([
        Export()
    ], Render.prototype, "sortDebugger", void 0);
    __decorate([
        Export()
    ], Render.prototype, "editorModeDebugger", void 0);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "showErrorMsg", null);
    __decorate([
        Export()
    ], Render.prototype, "hidden", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "getSound", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "setResourecRoot", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    ], Render.prototype, "getUIPath", null);
    __decorate([
        Export()
    ], Render.prototype, "getResPath", null);
    __decorate([
        Export()
    ], Render.prototype, "getOsdPath", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "getResourceRoot", null);
    __decorate([
        Export()
    ], Render.prototype, "getResUIPath", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "getNormalUIPath", null);
    __decorate([
        Export()
    ], Render.prototype, "destroyAccount", null);
    __decorate([
        Export()
    ], Render.prototype, "reconnect", null);
    __decorate([
        Export()
    ], Render.prototype, "showLogin", null);
    __decorate([
        Export()
    ], Render.prototype, "hideLogin", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "checkContains", null);
    __decorate([
        Export()
    ], Render.prototype, "showCreateRolePanel", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "showTipsAlert", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "updateModel", null);
    __decorate([
        Export()
    ], Render.prototype, "getIndexInLayer", null);
    __decorate([
        Export()
    ], Render.prototype, "changeLayer", null);
    __decorate([
        Export()
    ], Render.prototype, "showCreateRole", null);
    __decorate([
        Export()
    ], Render.prototype, "hideCreateRole", null);
    __decorate([
        Export()
    ], Render.prototype, "showPlay", null);
    __decorate([
        Export()
    ], Render.prototype, "updateFPS", null);
    __decorate([
        Export()
    ], Render.prototype, "endFPS", null);
    __decorate([
        Export()
    ], Render.prototype, "hidePlay", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "showPanel", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "hidePanel", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "showBatchPanel", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "hideBatchPanel", null);
    __decorate([
        Export()
    ], Render.prototype, "reload", null);
    __decorate([
        Export()
    ], Render.prototype, "showJoystick", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], Render.prototype, "setInputVisible", null);
    __decorate([
        Export()
    ], Render.prototype, "onShowErrorHandler", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "onLoginErrorHanler", null);
    __decorate([
        Export()
    ], Render.prototype, "updateCharacterPackage", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "displayReady", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "soundChangeRoom", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "playSoundByKey", null);
    __decorate([
        Export()
    ], Render.prototype, "playOsdSound", null);
    __decorate([
        Export()
    ], Render.prototype, "playSound", null);
    __decorate([
        Export()
    ], Render.prototype, "stopAllSound", null);
    __decorate([
        Export()
    ], Render.prototype, "pauseAll", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "startFireMove", null);
    __decorate([
        Export()
    ], Render.prototype, "resume", null);
    __decorate([
        Export()
    ], Render.prototype, "onConnected", null);
    __decorate([
        Export()
    ], Render.prototype, "onDisConnected", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "onConnectError", null);
    __decorate([
        Export()
    ], Render.prototype, "connectFail", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "updateUIState", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "setMoveStyle", null);
    __decorate([
        Export([webworker_rpc.ParamType.unit8array])
    ], Render.prototype, "onEnterRoom", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "scaleTween", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "getRenderPosition", null);
    __decorate([
        Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    ], Render.prototype, "createAccount", null);
    __decorate([
        Export()
    ], Render.prototype, "refreshAccount", null);
    __decorate([
        Export()
    ], Render.prototype, "getAccount", null);
    __decorate([
        Export()
    ], Render.prototype, "setAccount", null);
    __decorate([
        Export()
    ], Render.prototype, "clearAccount", null);
    __decorate([
        Export()
    ], Render.prototype, "getWorldView", null);
    __decorate([
        Export()
    ], Render.prototype, "onClockReady", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "i18nString", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "showAlert", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "showAlertReconnect", null);
    __decorate([
        Export()
    ], Render.prototype, "showLoading", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "updateProgress", null);
    __decorate([
        Export()
    ], Render.prototype, "hideLoading", null);
    __decorate([
        Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    ], Render.prototype, "loadStart", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "roomPause", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "roomResume", null);
    __decorate([
        Export()
    ], Render.prototype, "removeScene", null);
    __decorate([
        Export()
    ], Render.prototype, "showCreatePanelError", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "createSetNickName", null);
    __decorate([
        Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    ], Render.prototype, "createAnotherGame", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "setCamerasBounds", null);
    __decorate([
        Export()
    ], Render.prototype, "getCameraMidPos", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "setCamerasScroll", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "setInteractive", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "disableInteractive", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "fadeIn", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "fadeOut", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "fadeAlpha", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "getCurTime", null);
    __decorate([
        Export()
    ], Render.prototype, "gameLoadedCallBack", null);
    __decorate([
        Export()
    ], Render.prototype, "createGameCallBack", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "addFillEffect", null);
    __decorate([
        Export()
    ], Render.prototype, "clearRoom", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], Render.prototype, "clearGame", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "getMessage", null);
    __decorate([
        Export()
    ], Render.prototype, "setLocalStorage", null);
    __decorate([
        Export()
    ], Render.prototype, "getLocalStorage", null);
    __decorate([
        Export()
    ], Render.prototype, "removeLocalStorage", null);
    __decorate([
        Export()
    ], Render.prototype, "createPanel", null);
    __decorate([
        Export()
    ], Render.prototype, "roomstartPlay", null);
    __decorate([
        Export()
    ], Render.prototype, "roomReady", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "playAnimation", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    ], Render.prototype, "setHasInteractive", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "setCameraScroller", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "createDragonBones", null);
    __decorate([
        Export()
    ], Render.prototype, "createUserDragonBones", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "createFramesDisplay", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "createTerrainDisplay", null);
    __decorate([
        Export()
    ], Render.prototype, "setModel", null);
    __decorate([
        Export()
    ], Render.prototype, "setPlayerModel", null);
    __decorate([
        Export()
    ], Render.prototype, "addSkybox", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "removeSkybox", null);
    __decorate([
        Export()
    ], Render.prototype, "showMatterDebug", null);
    __decorate([
        Export()
    ], Render.prototype, "hideMatterDebug", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "drawServerPosition", null);
    __decorate([
        Export()
    ], Render.prototype, "hideServerPosition", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "changeAlpha", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "removeBlockObject", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "setPosition", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    ], Render.prototype, "showBubble", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "clearBubble", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "startFollow", null);
    __decorate([
        Export()
    ], Render.prototype, "stopFollow", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "cameraFollow", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "cameraPan", null);
    __decorate([
        Export()
    ], Render.prototype, "updateSkyboxState", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], Render.prototype, "setLayerDepth", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "doMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    ], Render.prototype, "showNickname", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "showTopDisplay", null);
    __decorate([
        Export()
    ], Render.prototype, "SetDisplayVisible", null);
    __decorate([
        Export()
    ], Render.prototype, "showRefernceArea", null);
    __decorate([
        Export()
    ], Render.prototype, "hideRefernceArea", null);
    __decorate([
        Export()
    ], Render.prototype, "displayAnimationChange", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], Render.prototype, "workerEmitter", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "mount", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], Render.prototype, "unmount", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], Render.prototype, "updateInput", null);
    __decorate([
        Export()
    ], Render.prototype, "addEffect", null);
    __decorate([
        Export()
    ], Render.prototype, "removeEffect", null);
    __decorate([
        Export()
    ], Render.prototype, "switchBaseMouseManager", null);
    __decorate([
        Export()
    ], Render.prototype, "liftItem", null);
    __decorate([
        Export()
    ], Render.prototype, "clearMount", null);
    __decorate([
        Export()
    ], Render.prototype, "throwElement", null);
    __decorate([
        Export()
    ], Render.prototype, "switchDecorateMouseManager", null);
    __decorate([
        Export()
    ], Render.prototype, "setRoomSize", null);
    __decorate([
        Export()
    ], Render.prototype, "isCordove", null);
    return Render;
}(RPCPeer));
export { Render };
//# sourceMappingURL=render.js.map