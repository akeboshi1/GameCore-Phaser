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
import { op_client, op_def } from "pixelpai_proto";
import { PacketHandler } from "net-socket-packet";
import { Room } from "./room";
import { EventType, LoadState, Logger } from "structure";
import { Capsule } from "game-capsule";
import { ConfigPath } from "../config";
import { load } from "utils";
var RoomManager = /** @class */ (function (_super) {
    __extends_1(RoomManager, _super);
    function RoomManager(game) {
        var _this = _super.call(this) || this;
        _this.mRooms = [];
        _this.remoteIndex = 0;
        _this.mGame = game;
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, _this.onEnterEditor);
        _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ENTER_ROOM, _this.onEnterResult);
        _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, _this.onEnterSceneHandler);
        return _this;
        // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_READY, this.onEnterDecorate);
    }
    RoomManager.prototype.update = function (time, delay) {
        if (this.mCurRoom)
            this.mCurRoom.update(time, delay);
    };
    RoomManager.prototype.addPackListener = function () {
        if (this.connection) {
            Logger.getInstance().debug("roommanager addPackListener");
            this.connection.addPacketListener(this);
        }
    };
    RoomManager.prototype.removePackListener = function () {
        if (this.connection) {
            Logger.getInstance().debug("roommanager removePackListener");
            this.connection.removePacketListener(this);
        }
    };
    RoomManager.prototype.getRoom = function (id) {
        return this.mRooms.find(function (room) {
            return room.id === id;
        });
    };
    RoomManager.prototype.onFocus = function () {
        this.mRooms.forEach(function (room) {
            if (room)
                room.resume();
        });
    };
    RoomManager.prototype.onBlur = function () {
        this.mRooms.forEach(function (room) {
            if (room)
                room.pause();
        });
    };
    RoomManager.prototype.stop = function () {
        this.mRooms.forEach(function (room) {
            if (room)
                room.destroy();
        });
    };
    RoomManager.prototype.removeAllRoom = function () {
        for (var _i = 0, _a = this.mRooms; _i < _a.length; _i++) {
            var room = _a[_i];
            room.destroy();
            room = null;
        }
        this.mRooms.length = 0;
        this.mCurRoom = null;
    };
    RoomManager.prototype.hasRoom = function (id) {
        var idx = this.mRooms.findIndex(function (room, index) { return id === room.id; });
        return idx >= 0;
    };
    RoomManager.prototype.leaveRoom = function (room) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!room)
                    return [2 /*return*/];
                this.mRooms = this.mRooms.filter(function (r) { return r.id !== room.id; });
                room.destroy();
                return [2 /*return*/];
            });
        });
    };
    RoomManager.prototype.onEnterRoom = function (scene) {
        Logger.getInstance().debug("enter===room");
        var id = scene.scene.id;
        var boo = false;
        // tslint:disable-next-line:no-shadowed-variable
        this.mRooms.forEach(function (room) {
            if (room && room.id === id) {
                boo = true;
                return;
            }
        });
        if (boo)
            return;
        var room = new Room(this);
        this.mRooms.push(room);
        room.addActor(scene.actor);
        room.enter(scene.scene);
        this.mCurRoom = room;
    };
    RoomManager.prototype.destroy = function () {
        this.removePackListener();
        this.removeAllRoom();
    };
    RoomManager.prototype.loadGameConfig = function (remotePath) {
        return __awaiter(this, void 0, void 0, function () {
            var game, config, configPath;
            var _this = this;
            return __generator(this, function (_a) {
                game = this.game;
                config = game.getGameConfig();
                configPath = ConfigPath.getSceneConfigUrl(remotePath);
                return [2 /*return*/, load(configPath, "arraybuffer").then(function (req) {
                        _this.mGame.gameConfigState.set(remotePath, true);
                        game.loadingManager.start(LoadState.PARSECONFIG);
                        Logger.getInstance().debug("start decodeConfig");
                        return _this.decodeConfigs(req);
                    }, function (reason) {
                        if (_this.remoteIndex > 3) {
                            if (config.hasReload) {
                                // app reload
                            }
                            else {
                                Logger.getInstance().log(reason);
                                game.renderPeer.reload();
                            }
                            return;
                        }
                        _this.remoteIndex++;
                        Logger.getInstance().error("reload res ====>", reason, "reload count ====>", _this.remoteIndex);
                        return _this.loadGameConfig(remotePath);
                    })];
            });
        });
    };
    RoomManager.prototype.decodeConfigs = function (req) {
        return new Promise(function (resolve, reject) {
            var arraybuffer = req.response;
            if (arraybuffer) {
                try {
                    var gameConfig = new Capsule();
                    gameConfig.deserialize(new Uint8Array(arraybuffer));
                    Logger.getInstance().debug("TCL: World -> gameConfig", gameConfig);
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
    // ========> 进入房间流程
    RoomManager.prototype.onEnterSceneHandler = function (packet) {
        var content = packet.content;
        var scene = content.scene;
        switch (scene.sceneType) {
            case op_def.SceneTypeEnum.NORMAL_SCENE_TYPE:
                this.onEnterScene(content);
                break;
            case op_def.SceneTypeEnum.EDIT_SCENE_TYPE:
                Logger.getInstance().error("error message: scene.sceneType === EDIT_SCENE_TYPE");
                break;
        }
        this.mGame.emitter.emit(EventType.SCENE_CHANGE);
    };
    RoomManager.prototype.onEnterScene = function (scene) {
        return __awaiter(this, void 0, void 0, function () {
            var vw, roomManager, curRoom;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vw = scene;
                        roomManager = this.mGame.roomManager;
                        curRoom = roomManager.currentRoom;
                        if (!curRoom) return [3 /*break*/, 2];
                        // 客户端会接受到多次进入场景消息，这边客户端自己处理下，防止一个房间多次创建
                        if (curRoom.id === vw.scene.id)
                            return [2 /*return*/];
                        return [4 /*yield*/, roomManager.leaveRoom(curRoom)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (roomManager.hasRoom(vw.scene.id)) {
                            roomManager.onEnterRoom(scene);
                        }
                        else {
                            this.loadSceneConfig(vw.scene.id.toString()).then(function (config) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    this.mGame.elementStorage.setSceneConfig(config);
                                    roomManager.onEnterRoom(scene);
                                    // ====> 游戏开始运行
                                    this.mGame.gameStateManager.next();
                                    return [2 /*return*/];
                                });
                            }); });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RoomManager.prototype.loadSceneConfig = function (sceneID) {
        var _this = this;
        var remotePath = this.getConfigUrl(sceneID);
        this.mGame.loadingManager.start(LoadState.DOWNLOADSCENECONFIG);
        var render = this.mGame.renderPeer;
        var result = this.mGame.preloadGameConfig();
        if (result === undefined) {
            return this.loadGameConfig(remotePath);
        }
        else {
            return result.then(function (req) {
                return _this.loadGameConfig(remotePath);
            }, function (reason) {
                return new Promise(function (resolve, reject) {
                    render.showAlert("配置加载错误，请重新登陆" + reason, true, false)
                        .then(function () {
                        if (!_this.mGame.debugReconnect)
                            return;
                        render.hidden();
                    });
                    reject();
                });
            });
        }
    };
    RoomManager.prototype.getConfigUrl = function (sceneId) {
        return this.mGame.gameConfigUrls.get(sceneId);
    };
    RoomManager.prototype.onEnterEditor = function (packet) {
        // const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        // const room = new EditorRoom(this);
        // room.enter(content.scene);
        // this.mCurRoom = room;
        // this.mRooms.push(room);
    };
    RoomManager.prototype.onEnterResult = function (packet) {
        var content = packet.content;
        if (!content.result) {
            return;
        }
        var tips = [undefined, "commontips.room_full", "commontips.room_need_password", "commontips.room_password_failure", "commontips.room_dose_not_exists"];
        var tip = tips[content.result - 1];
        if (tip)
            this.game.renderPeer.showAlert(tip);
    };
    Object.defineProperty(RoomManager.prototype, "game", {
        get: function () {
            return this.mGame;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoomManager.prototype, "currentRoom", {
        get: function () {
            return this.mCurRoom;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RoomManager.prototype, "connection", {
        get: function () {
            if (this.mGame) {
                return this.mGame.connection;
            }
        },
        enumerable: true,
        configurable: true
    });
    return RoomManager;
}(PacketHandler));
export { RoomManager };
//# sourceMappingURL=room.manager.js.map