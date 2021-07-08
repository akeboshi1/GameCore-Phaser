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
import { UIManager } from "./ui/ui.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { op_def, op_client, op_virtual_world } from "pixelpai_proto";
import { Capsule } from "game-capsule";
import { load, HttpLoadManager } from "utils";
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
export var fps = 30;
export var interval = fps > 0 ? 1000 / fps : 1000 / 30;
var Game = /** @class */ (function (_super) {
    __extends_1(Game, _super);
    function Game(peer) {
        var _this = _super.call(this) || this;
        _this.isDestroy = false;
        _this.isAuto = true;
        _this.mGameConfigUrls = new Map();
        _this.mGameConfigState = new Map();
        _this.isPause = false;
        /**
         * 自动重连开关
         */
        _this.mDebugReconnect = true;
        _this.mReconnect = 0;
        _this.hasClear = false;
        _this.currentTime = 0;
        _this.mHeartBeatDelay = 1000;
        _this.mRunning = true;
        _this.remoteIndex = 0;
        _this.isSyncPackage = false;
        _this.mainPeer = peer;
        _this.boot();
        return _this;
    }
    Game.prototype.setConfigPath = function (path) {
        this.mConfigPath = {
            notice_url: path.notice_url
        };
    };
    /**
     * 初始化
     * @param config
     */
    Game.prototype.init = function (config) {
        this.mGameStateManager.state = GameState.Init;
        this.mGameStateManager.startRun(config);
    };
    /**
     * 登陆
     */
    Game.prototype.login = function () {
        this.mGameStateManager.state = GameState.Login;
        this.mGameStateManager.startRun();
    };
    /**
     * 开始链接
     */
    Game.prototype.startConnect = function () {
        this.mGameStateManager.refreshStateTime();
        this.mGameStateManager.state = GameState.Connecting;
        this.mGameStateManager.startRun();
    };
    /**
     * 链接成功
     * @param isAuto
     */
    Game.prototype.onConnected = function (isAuto) {
        this.mGameStateManager.update(isAuto);
    };
    /**
     * 登陆游戏返回
     */
    Game.prototype.loginEnterWorld = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.mGameStateManager.state = GameState.EnterWorld;
                this.mGameStateManager.startRun();
                return [2 /*return*/];
            });
        });
    };
    Game.prototype.v = function () {
        this.debugReconnect = true;
    };
    Game.prototype.q = function () {
        this.debugReconnect = false;
    };
    Game.prototype.addPacketListener = function () {
        if (this.connect)
            this.connect.addPacketListener(this);
    };
    Game.prototype.removePacketListener = function () {
        if (this.connect)
            this.connect.removePacketListener(this);
    };
    Game.prototype.createGame = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setConfig(config);
                        return [4 /*yield*/, this.initWorld()];
                    case 1:
                        _a.sent();
                        this.hasClear = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.setConfig = function (config) {
        this.mConfig = config;
        if (config.config_root) {
            ConfigPath.ROOT_PATH = config.config_root;
            this.debugReconnect = config.debugReconnect;
        }
    };
    Game.prototype.showLoading = function (data) {
        this.mainPeer.render.showLoading(data);
    };
    Game.prototype.onDisConnected = function (isAuto) {
        var _this = this;
        if (!this.debugReconnect)
            return;
        // 由于socket逻辑于跨场景和踢下线逻辑冲突，所以游戏状态在此两个逻辑时，不做断线弹窗
        var stateKey = this.peer.state.key;
        if (stateKey === GameState.ChangeGame || stateKey === GameState.OffLine)
            return;
        Logger.getInstance().debug("app connectFail=====");
        this.isAuto = isAuto;
        if (!this.isAuto)
            return;
        if (this.mConfig.hasConnectFail) {
            return this.mainPeer.render.connectFail();
        }
        else {
            this.renderPeer.showAlert("网络连接失败，请稍后再试", true, false).then(function () {
                // const mediator = this.uiManager.getMed(ModuleName.PICA_BOOT_NAME);
                // if (mediator && mediator.isShow()) {
                //     mediator.show();
                // } else {
                //     this.renderPeer.hidden();
                // }
                _this.renderPeer.hidden();
            });
        }
    };
    Game.prototype.onRefreshConnect = function (isAuto) {
        var _this = this;
        this.isAuto = isAuto;
        if (!this.isAuto)
            return;
        // if (this.hasClear || this.isPause) return;
        Logger.getInstance().debug("game onrefreshconnect");
        if (this.mConfig.hasConnectFail) {
            Logger.getInstance().debug("app connectfail");
            this.onError();
        }
        else {
            this.clearGame().then(function () {
                Logger.getInstance().debug("clearGame");
                _this.createGame(_this.mConfig);
            });
        }
    };
    Game.prototype.onError = function () {
        if (!this.isAuto)
            return;
        Logger.getInstance().debug("socket error");
        if (this.mReconnect > 2) {
            // todo reconnect scene
            return;
        }
        if (!this.connect.connect) {
            if (this.mConfig.hasConnectFail) {
                Logger.getInstance().debug("app connectFail");
                return this.mainPeer.render.connectFail();
            }
            else {
                Logger.getInstance().debug("reconnect");
                this.reconnect();
            }
        }
    };
    Game.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isAuto)
                    return [2 /*return*/];
                // if (this.hasClear || this.isPause) return;
                this.manualReconnect();
                return [2 /*return*/];
            });
        });
    };
    Game.prototype.manualReconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gameID, virtualWorldId, worldId, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.debugReconnect)
                            return [2 /*return*/];
                        Logger.getInstance().debug("game reconnect");
                        if (this.mConfig.hasConnectFail)
                            return [2 /*return*/, this.mainPeer.render.connectFail()];
                        gameID = this.mConfig.game_id;
                        virtualWorldId = this.mConfig.virtual_world_id;
                        worldId = this.mConfig.world_id;
                        return [4 /*yield*/, this.mainPeer.render.getAccount()];
                    case 1:
                        account = _a.sent();
                        if (account.gameID && account.virtualWorldId) {
                            gameID = account.gameID;
                            virtualWorldId = account.virtualWorldId;
                        }
                        this._createAnotherGame(gameID, virtualWorldId, null, null, null, worldId);
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.exitUser = function () {
        var _this = this;
        this.mConfig.token_expire = this.mConfig.token_fingerprint = this.mConfig.user_id = this.mConfig.auth_token = null;
        this.renderPeer.destroyAccount().then(function () {
            _this._createAnotherGame(_this.mConfig.game_id, _this.mConfig.virtual_world_id, null, null);
        });
    };
    Game.prototype.onClientErrorHandler = function (packet) {
        var _this = this;
        var content = packet.content;
        switch (content.responseStatus) {
            case op_def.ResponseStatus.REQUEST_UNAUTHORIZED:
                // 校验没成功
                this.renderPeer.showAlert("登陆过期，请重新登陆", true, false)
                    .then(function () {
                    _this.renderPeer.hidden();
                });
                break;
        }
        // 显示服务器报错信息
        var errorLevel = content.errorLevel;
        var msg = content.msg;
        // 游戏phaser创建完成后才能在phaser内显示ui弹窗等ui
        if (errorLevel >= op_def.ErrorLevel.SERVICE_GATEWAY_ERROR && this.debugReconnect) {
            var str = msg;
            if (msg.length > 100)
                str = msg.slice(0, 99);
            this.renderPeer.showAlert(str, true, false).then(function () {
                // 暂时去除重连
                // this.manualReconnect();
            });
        }
        else {
            // 右上角显示
            // this.renderPeer.showErrorMsg(msg);
        }
        Logger.getInstance().log("Remote Trace[" + content.responseStatus + "]: " + msg);
    };
    Game.prototype.destroyClock = function () {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
    };
    /**
     * todo
     * 试验性方法，尝试后台加载场景pi
     * @returns
     */
    Game.prototype.loadTotalSceneConfig = function () {
        var _this = this;
        if (!this.gameConfigUrls)
            return;
        this.gameConfigUrls.forEach(function (remotePath) {
            if (!_this.mGameConfigState.get(remotePath)) {
                var url = ConfigPath.getSceneConfigUrl(remotePath);
                return load(url, "arraybuffer").then(function (req) {
                    Logger.getInstance().debug("start decodeConfig");
                }, function (reason) {
                    Logger.getInstance().error("reload res ====>", reason, "reload count ====>", _this.remoteIndex);
                });
            }
        });
    };
    Game.prototype.clearGameComplete = function () {
        this.initWorld();
    };
    Game.prototype.setSize = function (width, height) {
        this.mSize = {
            width: width,
            height: height
        };
    };
    Game.prototype.getSize = function () {
        return this.mSize;
    };
    Game.prototype.setGameConfig = function (config) {
        this.mConfig = config;
    };
    Game.prototype.getGameConfig = function () {
        return this.mConfig;
    };
    Game.prototype.getDataMgr = function (type) {
        return !this.dataControlManager ? null : this.dataControlManager.getDataMgr(type);
    };
    Game.prototype.clearClock = function () {
        if (this.mClock) {
            this.mClock.destroy();
            this.mClock = null;
        }
        this.mClock = new Clock(this.connect, this.mainPeer, this);
    };
    Game.prototype.roomResume = function (roomID) {
        this.mainPeer.render.roomResume(roomID);
    };
    Game.prototype.roomPause = function (roomID) {
        this.mainPeer.render.roomPause(roomID);
    };
    Game.prototype.setCamerasBounds = function (x, y, width, height) {
        this.mainPeer.render.setCamerasBounds(x, y, width, height);
    };
    Game.prototype.getConfigUrl = function (sceneId) {
        return this.gameConfigUrls.get(sceneId);
    };
    Game.prototype.onClockReady = function () {
        this.mainPeer.render.onClockReady();
    };
    Game.prototype.syncClock = function (times) {
        if (times === void 0) { times = 1; }
        this.mClock.sync(times);
    };
    Object.defineProperty(Game.prototype, "moveStyle", {
        get: function () {
            return this.mMoveStyle;
        },
        set: function (moveStyle) {
            this.mMoveStyle = moveStyle;
            this.mainPeer.render.setMoveStyle(moveStyle);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "scaleRatio", {
        get: function () {
            return this.mConfig.scale_ratio;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "debugReconnect", {
        get: function () {
            return this.mDebugReconnect;
        },
        set: function (val) {
            this.mDebugReconnect = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "httpService", {
        get: function () {
            return this.mHttpService;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "peer", {
        get: function () {
            return this.mainPeer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "connection", {
        get: function () {
            return this.connect;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "socket", {
        get: function () {
            return this.connect.socket;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "uiManager", {
        get: function () {
            return this.mUIManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "soundManager", {
        get: function () {
            return this.mSoundManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "clock", {
        get: function () {
            return this.mClock;
        },
        set: function (val) {
            this.mClock = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "httpClock", {
        get: function () {
            return this.mHttpClock;
        },
        set: function (val) {
            this.mHttpClock = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "elementStorage", {
        get: function () {
            return this.mElementStorage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "roomManager", {
        get: function () {
            return this.mRoomManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "guideWorkerManager", {
        get: function () {
            return this.mGuideWorkerManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "loadingManager", {
        get: function () {
            return this.mLoadingManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "dataControlManager", {
        get: function () {
            return this.mDataControlManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "gameConfigUrl", {
        get: function () {
            return this.mGameConfigUrl;
        },
        set: function (val) {
            this.mGameConfigUrl = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "gameConfigUrls", {
        get: function () {
            return this.mGameConfigUrls;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "gameConfigState", {
        get: function () {
            return this.mGameConfigState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "httpLoaderManager", {
        get: function () {
            return this.mHttpLoadManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "emitter", {
        get: function () {
            if (!this.mDataControlManager)
                return undefined;
            return this.mDataControlManager.emitter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "user", {
        get: function () {
            return this.mUser;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "renderPeer", {
        get: function () {
            var render = this.peer.render;
            if (!render) {
                throw new Error("can't find render");
            }
            return render;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "gameStateManager", {
        get: function () {
            return this.mGameStateManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Game.prototype, "avatarType", {
        get: function () {
            return this.mAvatarType;
        },
        enumerable: true,
        configurable: true
    });
    Game.prototype.onFocus = function () {
        // if (this.mHeartBeat) clearInterval(this.mHeartBeat);
        this.mRunning = true;
        this.connect.onFocus();
        if (this.connection) {
            if (!this.connection.connect) {
                if (this.mConfig.hasConnectFail) {
                    return this.mainPeer.render.connectFail();
                }
                else {
                    return this.onDisConnected();
                }
            }
            var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            var context = pkt.content;
            context.gameStatus = op_def.GameStatus.Focus;
            this.connection.send(pkt);
            // 同步心跳
            this.mClock.sync(-1);
        }
        else {
            Logger.getInstance().error("connection is undefined");
            return this.onDisConnected();
        }
    };
    Game.prototype.onBlur = function () {
        this.currentTime = 0;
        // if (this.mHeartBeat) clearInterval(this.mHeartBeat);
        this.mRunning = false;
        this.connect.onBlur();
        Logger.getInstance().debug("#BlackSceneFromBackground; world.onBlur()");
        if (this.connection) {
            var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_GAME_STATUS);
            var context = pkt.content;
            context.gameStatus = op_def.GameStatus.Blur;
            this.connection.send(pkt);
        }
        else {
            Logger.getInstance().error("connection is undefined");
        }
    };
    Game.prototype.refreshToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            var token, account;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peer.render.getLocalStorage("token")];
                    case 1:
                        token = _a.sent();
                        account = token ? JSON.parse(token) : null;
                        if (!account || !account.accessToken) {
                            this.login();
                            return [2 /*return*/];
                        }
                        this.httpService.refreshToekn(account.refreshToken, account.accessToken)
                            .then(function (response) {
                            if (response.code === 200) {
                                _this.peer.render.refreshAccount(response);
                                _this.loginEnterWorld();
                            }
                            else {
                                _this.login();
                            }
                        }).catch(function (error) {
                            Logger.getInstance().error("refreshToken:", error);
                            _this.login();
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.leaveRoom = function (room) {
    };
    Game.prototype.showByName = function (name, data) {
    };
    Game.prototype.showMediator = function (name, isShow, param) {
        if (!this.mUIManager)
            return;
        if (isShow) {
            this.mUIManager.showMed(name, param);
        }
        else {
            this.mUIManager.hideMed(name);
        }
    };
    Game.prototype.hideMediator = function (name) {
        if (!this.mUIManager)
            return;
        this.mUIManager.hideMed(name);
    };
    /**
     * 加载前端json文件
     * @param name
     */
    Game.prototype.loadJson = function () {
        this.mLoadingManager.start(LoadState.LOADJSON);
    };
    Game.prototype.preloadGameConfig = function () {
        return undefined;
    };
    Game.prototype.initWorld = function () {
        return __awaiter(this, void 0, void 0, function () {
            var gameID, worldId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.createUser();
                        this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_ERROR, this.onClientErrorHandler);
                        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
                        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GOTO_ANOTHER_GAME, this.onGotoAnotherGame);
                        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PING, this.onClientPingHandler);
                        // this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_RES_CLIENT_PONG, this.heartBeatCallBack);
                        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_GAME_MODE, this.onAvatarGameModeHandler);
                        this.createManager();
                        gameID = this.mConfig.game_id;
                        worldId = this.mConfig.virtual_world_id;
                        if (typeof gameID !== "string") {
                            Logger.getInstance().error("gameID is not string");
                        }
                        if (typeof worldId !== "string") {
                            Logger.getInstance().error("worldId is not string");
                        }
                        return [4 /*yield*/, this.mainPeer.render.createAccount(this.mConfig.game_id + "", this.mConfig.virtual_world_id + "")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.createUser = function () {
        this.mUser = new User();
    };
    Game.prototype.createManager = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resPath, osdPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
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
                        // if (!this.mConfigManager) this.mConfigManager = new BaseConfigManager(this);
                        if (!this.mNetWorkManager)
                            this.mNetWorkManager = new NetworkManager(this);
                        if (!this.mHttpLoadManager)
                            this.mHttpLoadManager = new HttpLoadManager();
                        // this.mPlayerDataManager = new PlayerDataManager(this);
                        this.mUIManager.addPackListener();
                        this.mRoomManager.addPackListener();
                        this.mGuideWorkerManager.addPackListener();
                        this.user.addPackListener();
                        this.mSoundManager.addPackListener();
                        return [4 /*yield*/, this.renderPeer.getResPath()];
                    case 1:
                        resPath = _a.sent();
                        return [4 /*yield*/, this.renderPeer.getOsdPath()];
                    case 2:
                        osdPath = _a.sent();
                        this.mElementStorage = new ElementStorage({ resPath: resPath, osdPath: osdPath });
                        return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.onClearGame = function () {
    };
    Game.prototype.boot = function () {
        this.connect = new Connection(this.peer);
        this.addPacketListener();
        if (!this.mGameStateManager)
            this.mGameStateManager = new GameStateManager(this.peer);
        this.update(new Date().getTime());
    };
    Game.prototype.onSelectCharacter = function () {
        var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
        this.mainPeer.send(pkt.Serialization());
        var i18Packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SET_LOCALE);
        var content = i18Packet.content;
        content.localeCode = "zh-CN";
        this.mainPeer.send(i18Packet.Serialization());
    };
    Game.prototype.onGotoAnotherGame = function (packet) {
        var content = packet.content;
        this._onGotoAnotherGame(content.gameId, content.virtualWorldId, content.sceneId, content.loc, content.spawnPointId, content.worldId);
    };
    Game.prototype.onAvatarGameModeHandler = function (packet) {
        var content = packet.content;
        this.mAvatarType = content.avatarStyle;
    };
    Game.prototype.update = function (current, delta) {
        var _this = this;
        if (current === void 0) { current = 0; }
        if (delta === void 0) { delta = 0; }
        if (this.isDestroy)
            return;
        this._run(current, delta);
        var now = new Date().getTime();
        var run_time = now - current;
        if (run_time >= interval) {
            // I am late.
            Logger.getInstance().info("Update late.  run_time: " + run_time + " ");
            this.update(now, run_time);
        }
        else {
            // Logger.getInstance().info(`${interval - run_time}`);
            setTimeout(function () {
                var when = new Date().getTime();
                _this.update(when, when - now);
            }, interval - run_time);
        }
    };
    Game.prototype.clearGame = function (bool) {
        var _this = this;
        if (bool === void 0) { bool = false; }
        return new Promise(function (resolve, reject) {
            _this.renderPeer.clearGame(bool).then(function () {
                _this.isAuto = true;
                if (_this.mClock) {
                    _this.mClock.destroy();
                    _this.mClock = null;
                }
                if (_this.mRoomManager) {
                    _this.mRoomManager.destroy();
                    _this.mRoomManager = null;
                }
                if (_this.mGuideWorkerManager) {
                    _this.mGuideWorkerManager.destroy();
                    _this.mGuideWorkerManager = null;
                }
                if (_this.mUIManager) {
                    _this.mUIManager.destroy();
                    _this.mUIManager = null;
                }
                if (_this.mElementStorage) {
                    _this.mElementStorage.destroy();
                    _this.mElementStorage = null;
                }
                if (_this.mLoadingManager) {
                    _this.mLoadingManager.destroy();
                    _this.mLoadingManager = null;
                }
                if (_this.mNetWorkManager) {
                    _this.mNetWorkManager.destory();
                    _this.mNetWorkManager = null;
                }
                if (_this.mHttpLoadManager) {
                    _this.mHttpLoadManager.destroy();
                    _this.mHttpLoadManager = null;
                }
                if (_this.mDataControlManager) {
                    _this.mDataControlManager.clear();
                    _this.mDataControlManager = null;
                }
                if (_this.mSoundManager) {
                    _this.mSoundManager.destroy();
                    _this.mSoundManager = null;
                }
                if (_this.user)
                    _this.user.removePackListener();
                // this.peer.destroy();
                _this.hasClear = true;
                _this.onClearGame();
                resolve();
            });
        });
    };
    Game.prototype._createAnotherGame = function (gameId, virtualworldId, sceneId, loc, spawnPointId, worldId) {
        var _this = this;
        this.mGameStateManager.startState(GameState.ChangeGame);
        this.clearGame(true).then(function () {
            _this.isPause = false;
            if (_this.mUser) {
                _this.mUser.clear();
            }
            if (_this.connect) {
                _this.removePacketListener();
                _this.connect.closeConnect();
            }
            if (_this.mClock) {
                _this.mClock.destroy();
                _this.mClock = null;
            }
            _this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
            // this.mConfig.game_id = gameId;
            // this.mConfig.virtual_world_id = virtualworldId;
            _this.createManager();
            _this.addPacketListener();
            _this.startConnect();
            _this.mClock = new Clock(_this.connect, _this.peer);
            _this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
        });
    };
    Game.prototype._onGotoAnotherGame = function (gameId, virtualworldId, sceneId, loc, spawnPointId, worldId) {
        var _this = this;
        this.mGameStateManager.startState(GameState.ChangeGame);
        this.clearGame(true).then(function () {
            _this.isPause = false;
            if (_this.connect) {
                _this.connect.closeConnect();
            }
            if (_this.mClock) {
                _this.mClock.destroy();
                _this.mClock = null;
            }
            _this.mainPeer.render.createAccount(gameId, virtualworldId, sceneId, loc, spawnPointId);
            _this.createManager();
            _this.removePacketListener();
            _this.addPacketListener();
            _this.startConnect();
            _this.mClock = new Clock(_this.connect, _this.peer);
            // 告知render进入其他game
            _this.mainPeer.render.createAnotherGame(gameId, virtualworldId, sceneId, loc ? loc.x : 0, loc ? loc.y : 0, loc ? loc.z : 0, spawnPointId, worldId);
        });
    };
    Game.prototype.decodeConfigs = function (req) {
        return new Promise(function (resolve, reject) {
            var arraybuffer = req.response;
            if (arraybuffer) {
                try {
                    var gameConfig = new Capsule();
                    gameConfig.deserialize(new Uint8Array(arraybuffer));
                    Logger.getInstance().debug("TCL: World -> gameConfig", gameConfig);
                    // const list = (<any>gameConfig)._root._moss._peersDict;
                    // list.forEach((dat) => {
                    //     if (dat.id === 1229472650) {
                    //         Logger.getInstance().debug("地毯=======", dat);
                    //     }
                    // });
                    resolve(gameConfig);
                }
                catch (error) {
                    Logger.getInstance().error("catch error", error);
                    reject(error);
                }
            }
            else {
                Logger.getInstance().error("reject error");
                reject("error");
            }
        });
    };
    Game.prototype.onClientPingHandler = function (packet) {
        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_RES_VIRTUAL_WORLD_PONG));
    };
    Game.prototype._run = function (current, delta) {
        if (!this.mRunning)
            return;
        // Logger.getInstance.log(`_run at ${current} + delta: ${delta}`);
        // TODO do something here.
        if (this.connect)
            this.connect.update();
        if (this.mRoomManager)
            this.mRoomManager.update(current, delta);
        if (this.mHttpLoadManager)
            this.mHttpLoadManager.update(current, delta);
    };
    return Game;
}(PacketHandler));
export { Game };
//# sourceMappingURL=game.js.map