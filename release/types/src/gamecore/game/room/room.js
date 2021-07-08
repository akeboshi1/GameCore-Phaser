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
import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { AStar, Handler, Logger, LogicPos, Position45 } from "structure";
import { EventType, LoadState, SceneName } from "structure";
import { TerrainManager } from "./terrain/terrain.manager";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.manager";
import { CamerasManager } from "./camera/cameras.worker.manager";
import { EffectManager } from "./effect/effect.manager";
import { SkyBoxManager } from "./sky.box/sky.box.manager";
import { WallManager } from "./element/wall.manager";
import { CollsionManager } from "../collsion";
import { RoomStateManager } from "./state";
import { ViewblockManager } from "./viewblock/viewblock.manager";
import { Sprite } from "baseGame";
// 这一层管理数据和Phaser之间的逻辑衔接
// 消息处理让上层[RoomManager]处理
var Room = /** @class */ (function (_super) {
    __extends_1(Room, _super);
    function Room(manager) {
        var _this = _super.call(this) || this;
        _this.manager = manager;
        _this.mEnableDecorate = false;
        _this.mIsDecorating = false;
        _this.mIsLoading = false;
        _this.mManagersReadyStates = new Map();
        _this.mUpdateHandlers = [];
        _this.mDecorateEntryData = null;
        // 地块可行走标记map。每格标记由多个不同优先级（暂时仅地块和物件）标记组成，最终是否可行走由高优先级标记决定
        _this.mWalkableMarkMap = new Map();
        _this.mIsWaitingForDecorateResponse = false;
        _this.mGame = _this.manager.game;
        _this.mScaleRatio = _this.mGame.scaleRatio;
        if (_this.mGame) {
            _this.addListen();
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ENABLE_EDIT_MODE, _this.onEnableEditModeHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP, _this.onShowMapTitle);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SET_CAMERA_FOLLOW, _this.onCameraFollowHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_RESET_CAMERA_SIZE, _this.onCameraResetSizeHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SYNC_STATE, _this.onSyncStateHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE, _this.onAllSpriteReceived);
            _this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE, _this.onReloadScene);
        }
        return _this;
    }
    Room.prototype.addListen = function () {
        if (this.game.emitter)
            this.mGame.emitter.on(EventType.UPDATE_EXTRA_ROOM_INFO, this.onExtraRoomInfoHandler, this);
        if (this.connection) {
            this.connection.addPacketListener(this);
        }
    };
    Room.prototype.removeListen = function () {
        if (this.game.emitter)
            this.mGame.emitter.off(EventType.UPDATE_EXTRA_ROOM_INFO, this.onExtraRoomInfoHandler, this);
        if (this.connection) {
            this.connection.removePacketListener(this);
        }
    };
    Room.prototype.enter = function (data) {
        if (!data) {
            return;
        }
        // Logger.getInstance().debug("room====enter");
        this.mID = data.id;
        this.mSize = {
            cols: data.cols,
            rows: data.rows,
            tileHeight: data.tileHeight,
            tileWidth: data.tileWidth,
            sceneWidth: (data.rows + data.cols) * (data.tileWidth / 2),
            sceneHeight: (data.rows + data.cols) * (data.tileHeight / 2),
        };
        this.mMiniSize = {
            cols: data.cols * 2,
            rows: data.rows * 2,
            tileWidth: data.tileWidth / 2,
            tileHeight: data.tileHeight / 2,
        };
        this.game.renderPeer.setRoomSize(this.mSize, this.mMiniSize);
        this.mWalkableMap = new Array(this.mMiniSize.rows);
        for (var i = 0; i < this.mWalkableMap.length; i++) {
            this.mWalkableMap[i] = new Array(this.mMiniSize.cols).fill(-1);
        }
        this.mTerrainMap = new Array(this.mMiniSize.rows);
        for (var i = 0; i < this.mTerrainMap.length; i++) {
            this.mTerrainMap[i] = new Array(this.mMiniSize.cols).fill(-1);
        }
        this.mInteractiveList = new Array(this.mMiniSize.rows);
        for (var i = 0; i < this.mInteractiveList.length; i++) {
            this.mInteractiveList[i] = new Array(this.mMiniSize.cols);
        }
        // create render scene
        this.mGame.showLoading({
            "dpr": this.mScaleRatio,
            "sceneName": "PlayScene",
            "state": LoadState.CREATESCENE
        });
        this.mIsLoading = true;
    };
    Room.prototype.onFullPacketReceived = function (sprite_t) {
        if (sprite_t !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    };
    Room.prototype.onClockReady = function () {
        // TODO: Unload loading-scene
    };
    Room.prototype.pause = function () {
        this.mGame.roomPause(this.mID);
    };
    Room.prototype.resume = function () {
        this.mGame.roomResume(this.mID);
    };
    Room.prototype.addActor = function (data) {
        this.mActorData = data;
    };
    Room.prototype.addBlockObject = function (object) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.blocks) {
                _this.blocks.add(object).then(function (val) {
                    resolve(val);
                });
            }
            else {
                reject(false);
            }
        });
    };
    Room.prototype.removeBlockObject = function (object) {
        // Logger.getInstance().debug("rooms remove");
        if (this.blocks) {
            this.blocks.remove(object);
        }
    };
    Room.prototype.updateBlockObject = function (object) {
        // Logger.getInstance().debug("rooms update");
        if (this.blocks) {
            this.blocks.check(object);
        }
    };
    Room.prototype.transformTo90 = function (p) {
        if (!this.mSize) {
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    };
    Room.prototype.transformTo45 = function (p) {
        if (!this.mSize) {
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    };
    Room.prototype.transformToMini90 = function (p) {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo90(p, this.miniSize);
    };
    Room.prototype.transformToMini45 = function (p) {
        if (!this.mMiniSize) {
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    };
    Room.prototype.getElement = function (id) {
        var ele = null;
        if (this.mPlayerManager) {
            ele = this.mPlayerManager.get(id);
        }
        if (!ele && this.mElementManager) {
            ele = this.mElementManager.get(id);
        }
        if (!ele && this.mTerrainManager) {
            ele = this.mTerrainManager.get(id);
        }
        return ele;
    };
    Room.prototype.update = function (time, delta) {
        this.updateClock(time, delta);
        if (this.mElementManager)
            this.mElementManager.update(time, delta);
        if (this.mPlayerManager)
            this.mPlayerManager.update(time, delta);
        if (this.terrainManager)
            this.terrainManager.update(time, delta);
        if (this.mGame.httpClock)
            this.mGame.httpClock.update(time, delta);
        if (this.mCameraService)
            this.mCameraService.update(time, delta);
        if (this.mCollsionManager)
            this.mCollsionManager.update(time, delta);
        for (var _i = 0, _a = this.mUpdateHandlers; _i < _a.length; _i++) {
            var oneHandler = _a[_i];
            oneHandler.runWith([time, delta]);
        }
    };
    Room.prototype.updateClock = function (time, delta) {
        // 客户端自己通过delta来更新游戏时间戳 *现改为使用sysTime+deltaTime的形式，就不需要update了*
        // if (this.mGame.clock) this.mGame.clock.update(time, delta);
    };
    Room.prototype.now = function () {
        return this.mGame.clock.unixTime;
    };
    Room.prototype.getMaxScene = function () {
        if (!this.mSize) {
            return;
        }
        var w = this.mSize.sceneWidth;
        var h = this.mSize.sceneHeight;
        return { width: w, height: h };
    };
    Room.prototype.createManager = function () {
        this.mCameraService = new CamerasManager(this.mGame, this);
        this.mTerrainManager = new TerrainManager(this, this);
        this.mElementManager = new ElementManager(this);
        this.mPlayerManager = new PlayerManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mSkyboxManager = new SkyBoxManager(this);
        this.mEffectManager = new EffectManager(this);
        this.mWallMamager = new WallManager(this);
        this.mCollsionManager = new CollsionManager(this);
        this.mCollsionManager.addWall();
    };
    Room.prototype.startPlay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var padding, offsetX, map, i, j;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        Logger.getInstance().debug("room startplay =====");
                        this.game.renderPeer.showPlay();
                        this.createManager();
                        padding = 199 * this.mScaleRatio;
                        offsetX = this.mSize.rows * (this.mSize.tileWidth / 2);
                        this.mGame.peer.render.roomstartPlay();
                        this.mGame.peer.render.gridsDebugger.setData(this.mSize);
                        this.mGame.peer.render.setCamerasBounds(-padding - offsetX * this.mScaleRatio, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
                        //     // init block
                        this.mBlocks.int(this.mSize);
                        this.mGame.user.enterScene(this, this.mActorData);
                        if (!this.connection) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.cameraService.syncCamera()];
                    case 1:
                        _a.sent();
                        if (!this.cameraService.initialize) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.cameraService.syncCameraScroll()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
                        _a.label = 4;
                    case 4:
                        this.initSkyBox();
                        this.mTerrainManager.init();
                        this.mWallMamager.init();
                        this.mAstar = new AStar(this);
                        map = [];
                        for (i = 0; i < this.miniSize.rows; i++) {
                            map[i] = [];
                            for (j = 0; j < this.miniSize.cols; j++) {
                                map[i][j] = 1;
                            }
                        }
                        this.mAstar.init(map);
                        return [2 /*return*/];
                }
            });
        });
    };
    Room.prototype.initUI = function () {
        // if (this.game.uiManager) this.game.uiManager.showMainUI();
        this.mIsLoading = false;
    };
    Room.prototype.addToInteractiveMap = function (sprite) {
        var displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        // op_def.IPBPoint2i[]
        var interactiveList = sprite.getInteractive();
        if (!interactiveList) {
            this.removeFromInteractiveMap(sprite);
            return;
        }
        var id = sprite.id;
        var addPos = sprite.getOriginPoint();
        var pos = sprite.pos;
        var index45 = this.transformToMini45(new LogicPos(pos.x, pos.y));
        // const rows = interactiveList.length;
        // const cols = interactiveList[0].length;
        var len = interactiveList.length;
        if (!this.mInteractiveList)
            this.mInteractiveList = [];
        for (var i = 0; i < len; i++) {
            var interactivePos = interactiveList[i];
            var x = interactivePos.x + index45.x - addPos.x;
            var y = interactivePos.y + index45.y - addPos.y;
            // tslint:disable-next-line:no-console
            // console.log("interactive ===>", x, y, id, len, interactiveList);
            if (!this.mInteractiveList[y])
                this.mInteractiveList[y] = [];
            if (!this.mInteractiveList[y][x])
                this.mInteractiveList[y][x] = [];
            if (this.mInteractiveList[y][x].indexOf(id) === -1)
                this.mInteractiveList[y][x].push(id);
        }
    };
    Room.prototype.removeFromInteractiveMap = function (sprite) {
        // const displayInfo = sprite.displayInfo;
        // if (!displayInfo) {
        //     return;
        // }
        // const interactiveList = sprite.getInteractive();
        // if (!interactiveList) return;
        var id = sprite.id;
        if (!this.mInteractiveList)
            return;
        var len = this.mInteractiveList.length;
        for (var i = 0; i < len; i++) {
            var tmpLen = this.mInteractiveList[i].length;
            for (var j = 0; j < tmpLen; j++) {
                var ids = this.mInteractiveList[i][j];
                if (!ids || ids.length < 1)
                    continue;
                var tmpLen1 = ids.length;
                for (var k = 0; k < tmpLen1; k++) {
                    var tmpId = ids[k];
                    if (id === tmpId) {
                        this.mInteractiveList[i][j].splice(k, 1);
                    }
                }
            }
        }
    };
    Room.prototype.addToWalkableMap = function (sprite, isTerrain) {
        if (isTerrain === void 0) { isTerrain = false; }
        var displayInfo = sprite.displayInfo;
        if (!displayInfo) {
            return;
        }
        var walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData)
            return;
        // tslint:disable-next-line:no-console
        // console.log("addWalk ===>", sprite);
        var origin = walkableData.origin, collisionArea = walkableData.collisionArea, walkableArea = walkableData.walkableArea, pos45 = walkableData.pos45, rows = walkableData.rows, cols = walkableData.cols;
        var tempY = 0;
        var tempX = 0;
        for (var i = 0; i < rows; i++) {
            // pos45 sprite在45度坐标系中的索引，pad(origin) sprite, i(y), j(x)
            tempY = pos45.y + i - origin.y;
            for (var j = 0; j < cols; j++) {
                tempX = pos45.x + j - origin.x;
                if (tempY < 0 || tempY >= this.mWalkableMap.length || tempX < 0 || tempX >= this.mWalkableMap[tempY].length) {
                    continue;
                }
                var canWalk = collisionArea[i][j] === 0 || walkableArea[i][j] === 1;
                this.addWalkableMark(tempX, tempY, sprite.id, isTerrain ? 0 : 1, canWalk);
                if (isTerrain)
                    this.setTerrainMap(tempX, tempY, canWalk);
            }
        }
        if (isTerrain)
            this.showDecorateGrid();
    };
    Room.prototype.removeFromWalkableMap = function (sprite, isTerrain) {
        if (isTerrain === void 0) { isTerrain = false; }
        if (!sprite)
            return;
        var walkableData = this.getSpriteWalkableData(sprite, isTerrain);
        if (!walkableData)
            return;
        // tslint:disable-next-line:no-console
        // console.log("removeWalk ===>", sprite);
        var origin = walkableData.origin, collisionArea = walkableData.collisionArea, walkableArea = walkableData.walkableArea, pos45 = walkableData.pos45, rows = walkableData.rows, cols = walkableData.cols;
        var tempY = 0;
        var tempX = 0;
        for (var i = 0; i < rows; i++) {
            tempY = pos45.y + i - origin.y;
            for (var j = 0; j < cols; j++) {
                tempX = pos45.x + j - origin.x;
                if (tempY < 0 || tempY >= this.mWalkableMap.length || tempX < 0 || tempX >= this.mWalkableMap[tempY].length) {
                    continue;
                }
                this.removeWalkableMark(tempX, tempY, sprite.id);
            }
        }
    };
    Room.prototype.getInteractiveEles = function (x, y) {
        if (!this.mInteractiveList)
            return null;
        // 前后10个格子直接可交互物件,正负gridlen格子
        var gridLen = 80;
        var list = [];
        var pos = this.transformToMini45(new LogicPos(x, y));
        var baseX = pos.x;
        var baseY = pos.y;
        var rows = this.miniSize.rows;
        var cols = this.miniSize.cols;
        for (var i = -gridLen; i <= gridLen; i++) {
            if (baseY + i < 0 || baseY + i >= rows)
                continue;
            for (var j = -gridLen; j < gridLen; j++) {
                if (baseX + j < 0 || baseX + j >= cols)
                    continue;
                var idPos = { x: baseX + j, y: baseY + i };
                var ids = this.mInteractiveList[idPos.y][idPos.x];
                if (ids && ids.length > 0) {
                    list.push(ids);
                }
            }
        }
        // tslint:disable-next-line:no-console
        // console.log(list);
        return list;
    };
    Room.prototype.isWalkable = function (x, y) {
        if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
            return false;
        }
        return this.mWalkableMap[y][x] === 1;
    };
    Room.prototype.findPath = function (startPos, targetPosList, toReverse) {
        return this.mAstar.find(startPos, targetPosList, toReverse);
    };
    Room.prototype.clear = function () {
        // if (this.mLayManager) this.mLayManager.destroy();
        if (this.mStateManager) {
            this.mStateManager.destroy();
        }
        if (this.mTerrainManager) {
            this.mTerrainManager.destroy();
        }
        if (this.mElementManager) {
            this.mElementManager.destroy();
        }
        if (this.mPlayerManager) {
            this.mPlayerManager.destroy();
        }
        if (this.mBlocks) {
            this.mBlocks.destroy();
        }
        if (this.mEffectManager)
            this.mEffectManager.destroy();
        if (this.mSkyboxManager)
            this.mSkyboxManager.destroy();
        if (this.mWallMamager)
            this.mWallMamager.destroy();
        if (this.mCollsionManager)
            this.mCollsionManager.destroy();
        if (this.mActorData)
            this.mActorData = null;
        Logger.getInstance().debug("room clear");
        if (this.game) {
            if (this.game.renderPeer)
                this.game.renderPeer.clearRoom();
            if (this.game.uiManager)
                this.game.uiManager.recover();
        }
        this.mTerrainMap = [];
        this.mWalkableMap = [];
        this.mInteractiveList = [];
        this.mWalkableMarkMap.clear();
    };
    Room.prototype.destroy = function () {
        this.removeListen();
        this.clear();
        this.game.renderPeer.removeScene(SceneName.PLAY_SCENE);
    };
    // update handlers. TODO: remove method
    Room.prototype.addUpdateHandler = function (caller, method) {
        this.removeUpdateHandler(caller, method);
        var handler = new Handler(caller, method);
        this.mUpdateHandlers.push(handler);
    };
    Room.prototype.removeUpdateHandler = function (caller, method) {
        var removeid = -1;
        for (var i = 0; i < this.mUpdateHandlers.length; i++) {
            var item = this.mUpdateHandlers[i];
            if (item.caller === caller && item.method === method) {
                removeid = i;
                break;
            }
        }
        if (removeid !== -1) {
            var hander = this.mUpdateHandlers.splice(removeid, 1)[0];
            hander.clear();
        }
    };
    Room.prototype.destroyUpdateHandler = function () {
        for (var _i = 0, _a = this.mUpdateHandlers; _i < _a.length; _i++) {
            var item = _a[_i];
            item.clear();
        }
        this.mUpdateHandlers.length = 0;
    };
    Object.defineProperty(Room.prototype, "isLoading", {
        get: function () {
            return this.mIsLoading;
        },
        enumerable: true,
        configurable: true
    });
    // room创建状态管理
    Room.prototype.onManagerCreated = function (key) {
        if (this.mManagersReadyStates.has(key))
            return;
        this.mManagersReadyStates.set(key, false);
    };
    Room.prototype.onManagerReady = function (key) {
        if (!this.mManagersReadyStates.has(key))
            return;
        this.mManagersReadyStates.set(key, true);
        var allReady = true;
        this.mManagersReadyStates.forEach(function (val) {
            if (val === false) {
                allReady = false;
            }
        });
        if (allReady) {
            this.game.renderPeer.roomReady();
            this.onRoomReady();
        }
    };
    Room.prototype.onRoomReady = function () {
        if (!this.terrainManager.isDealEmptyTerrain) {
            this.terrainManager.dealEmptyTerrain();
        }
    };
    Room.prototype.cameraFollowHandler = function () {
        if (!this.cameraService.initialize)
            return;
        this.cameraService.syncCameraScroll();
    };
    Room.prototype.requestSaveDecorating = function (pkt) {
        if (this.mIsWaitingForDecorateResponse)
            return;
        this.mIsWaitingForDecorateResponse = true;
        this.connection.send(pkt);
        // waite for response: _OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODEL_RESULT
    };
    // 检测sprite是否与现有walkableMap有碰撞重叠，无碰撞区域为0，无碰撞重叠为1，有碰撞重叠为2
    Room.prototype.checkSpriteConflictToWalkableMap = function (sprite, isTerrain, pos) {
        if (isTerrain === void 0) { isTerrain = false; }
        var walkableData = this.getSpriteWalkableData(sprite, isTerrain, pos);
        if (!walkableData) {
            Logger.getInstance().error("data error check sprite: ", sprite);
            return [];
        }
        var origin = walkableData.origin, collisionArea = walkableData.collisionArea, walkableArea = walkableData.walkableArea, pos45 = walkableData.pos45, rows = walkableData.rows, cols = walkableData.cols;
        var result = new Array(rows);
        for (var i = 0; i < rows; i++) {
            result[i] = new Array(cols).fill(1);
        }
        var tempY = 0;
        var tempX = 0;
        for (var i = 0; i < rows; i++) {
            tempY = pos45.y + i - origin.y;
            for (var j = 0; j < cols; j++) {
                result[i][j] = collisionArea[i][j];
                tempX = pos45.x + j - origin.x;
                if (collisionArea[i][j] === 0 || walkableArea[i][j] === 1) {
                    continue;
                }
                var val = this.isWalkable(tempX, tempY);
                if (!val) {
                    // Logger.getInstance().debug("#place ", val, pos, tempX, tempY);
                    result[i][j] = 2;
                }
            }
        }
        return result;
    };
    Room.prototype.initSkyBox = function () {
        var scenerys = this.game.elementStorage.getScenerys();
        if (scenerys) {
            for (var _i = 0, scenerys_1 = scenerys; _i < scenerys_1.length; _i++) {
                var scenery = scenerys_1[_i];
                this.addSkyBox({
                    id: scenery.id,
                    uris: scenery.uris,
                    depth: scenery.depth,
                    width: scenery.width,
                    height: scenery.height,
                    speed: scenery.speed,
                    offset: scenery.offset,
                    fit: scenery.fit
                });
            }
        }
    };
    Room.prototype.addSkyBox = function (scenery) {
        this.mSkyboxManager.add(scenery);
    };
    Object.defineProperty(Room.prototype, "terrainManager", {
        get: function () {
            return this.mTerrainManager || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "elementManager", {
        get: function () {
            return this.mElementManager || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "playerManager", {
        get: function () {
            return this.mPlayerManager || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "skyboxManager", {
        get: function () {
            return this.mSkyboxManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "wallManager", {
        get: function () {
            return this.mWallMamager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "cameraService", {
        get: function () {
            return this.mCameraService || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "effectManager", {
        get: function () {
            return this.mEffectManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "collsionManager", {
        get: function () {
            return this.mCollsionManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "id", {
        get: function () {
            return this.mID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "roomSize", {
        get: function () {
            return this.mSize || undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "miniSize", {
        get: function () {
            return this.mMiniSize;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "blocks", {
        get: function () {
            return this.mBlocks;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "game", {
        get: function () {
            return this.mGame;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "enableDecorate", {
        get: function () {
            return this.mEnableDecorate;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "isDecorating", {
        get: function () {
            return this.mIsDecorating;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "connection", {
        get: function () {
            if (this.manager) {
                return this.manager.connection;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Room.prototype, "sceneType", {
        get: function () {
            return op_def.SceneTypeEnum.NORMAL_SCENE_TYPE;
        },
        enumerable: true,
        configurable: true
    });
    Room.prototype.onEnableEditModeHandler = function (packet) {
        this.mEnableDecorate = true;
        // this.game.uiManager.showMed(ModuleName.CUTINMENU_NAME, { button: [{ text: "editor" }] });
    };
    Room.prototype.onShowMapTitle = function (packet) {
        // if (!this.scene) {
        //     return;
        // }
        // const content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_UNWALKABLE_BIT_MAP = packet.content;
        // const area = new ReferenceArea(this.scene, this);
        // const num = [];
        // const intArray: op_def.IIntArray[] = content.intArray;
        // for (let i = 0; i < intArray.length; i++) {
        //     num[i] = [];
        //     for (let j = 0; j < intArray[i].value.length; j++) {
        //         num[i][j] = intArray[i].value[j];
        //     }
        //     // num[i] = intArray[i];
        // }
        // area.draw(num, new Phaser.Geom.Point(0, 0));
        // area.setAlpha(0.1);
        // if (area.size) {
        //     area.setPosition(area.size.sceneWidth / 2, 0);
        //     this.mLayManager.addToMiddle(area);
        // }
    };
    Room.prototype.onCameraResetSizeHandler = function () {
        this.cameraService.initialize = true;
        // this.cameraService.syncCameraScroll();
    };
    Room.prototype.onCameraFollowHandler = function (packet) {
        if (!this.cameraService.initialize)
            return;
        var content = packet.content;
        if (content.hasOwnProperty("id")) {
            var id = content.id ? content.id : 0;
            this.cameraService.startFollow(id, content.effect);
        }
        else {
            this.cameraService.stopFollow();
        }
        if (content.hasOwnProperty("pos")) {
            var pos = content.pos;
            this.cameraService.setCamerasScroll(pos.x, pos.y, content.effect);
        }
    };
    Room.prototype.onAllSpriteReceived = function (packet) {
        var content = packet.content;
        var sprites = content.sprites;
        if (!sprites) {
            Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_CURRENT_SCENE_ALL_SPRITE> content.sprites is undefined");
            return;
        }
        var nodeType = content.nodeType;
        var addList = [];
        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            for (var _i = 0, _a = content.sprites; _i < _a.length; _i++) {
                var sp = _a[_i];
                if (this.mElementManager.get(sp.id))
                    continue;
                addList.push(sp);
            }
            this.mElementManager.addSpritesToCache(addList);
        }
        else if (nodeType === op_def.NodeType.TerrainNodeType) {
            for (var _b = 0, _c = content.sprites; _b < _c.length; _b++) {
                var sp = _c[_b];
                if (this.mTerrainManager.get(sp.id))
                    continue;
                addList.push(sp);
            }
            this.mTerrainManager.addSpritesToCache(addList);
        }
    };
    Room.prototype.onReloadScene = function (packet) {
        var content = packet.content;
        var sprites = content.sprites;
        if (!sprites) {
            Logger.getInstance().error("<OP_VIRTUAL_WORLD_REQ_CLIENT_NOTICE_RELOAD_SCENE> content.sprites is undefined");
            return;
        }
        var nodeType = content.nodeType;
        var addList = [];
        for (var _i = 0, _a = content.sprites; _i < _a.length; _i++) {
            var sp = _a[_i];
            var _sprite = new Sprite(sp, nodeType);
            addList.push(_sprite);
        }
        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            if (content.packet.currentFrame !== undefined && content.packet.currentFrame === 1) {
                // remove all elements
                var elements = this.elementManager.getElements();
                for (var _b = 0, elements_1 = elements; _b < elements_1.length; _b++) {
                    var element = elements_1[_b];
                    this.elementManager.remove(element.id);
                }
            }
            this.mElementManager.addSpritesToCache(content.sprites);
        }
        else if (nodeType === op_def.NodeType.TerrainNodeType) {
            if (content.packet.currentFrame !== undefined && content.packet.currentFrame === 1) {
                // remove all elements
                var terrains = this.terrainManager.getElements();
                for (var _c = 0, terrains_1 = terrains; _c < terrains_1.length; _c++) {
                    var terrain = terrains_1[_c];
                    this.terrainManager.remove(terrain.id);
                }
            }
            this.mTerrainManager.add(addList);
        }
    };
    Room.prototype.onSyncStateHandler = function (packet) {
        var content = packet.content;
        var states = content.stateGroup;
        for (var _i = 0, states_1 = states; _i < states_1.length; _i++) {
            var state = states_1[_i];
            switch (state.owner.type) {
                case op_def.NodeType.ElementNodeType:
                    this.mElementManager.setState(state);
                    break;
                case op_def.NodeType.CharacterNodeType:
                    this.mPlayerManager.setState(state);
                    break;
                case op_def.NodeType.SceneNodeType:
                    this.setState(state);
                    break;
            }
        }
    };
    Room.prototype.onExtraRoomInfoHandler = function (content) {
        if (this.wallManager) {
            this.wallManager.changeAllDisplayData(content.wallId);
        }
        if (this.terrainManager) {
            this.terrainManager.changeAllDisplayData(content.floorId);
        }
    };
    Room.prototype.getSpriteWalkableData = function (sprite, isTerrain, pos) {
        var collisionArea = sprite.getCollisionArea();
        var walkableArea = sprite.getWalkableArea();
        var origin = sprite.getOriginPoint();
        if (!collisionArea) {
            return null;
        }
        var rows = collisionArea.length;
        var cols = collisionArea[0].length;
        var pos45;
        var pos90;
        if (pos === undefined) {
            pos90 = sprite.pos;
        }
        else {
            pos90 = pos;
        }
        if (isTerrain) {
            pos45 = this.transformTo45(new LogicPos(pos90.x, pos90.y));
            pos45.x *= 2;
            pos45.y *= 2;
            if (rows === 1 && cols === 1) {
                rows = 2;
                cols = 2;
                var colVal = collisionArea[0][0];
                collisionArea = new Array(rows);
                for (var i = 0; i < rows; i++) {
                    collisionArea[i] = new Array(cols).fill(colVal);
                }
                walkableArea = new Array(rows);
                for (var i = 0; i < rows; i++) {
                    walkableArea[i] = new Array(cols).fill(0);
                }
            }
        }
        else {
            pos45 = this.transformToMini45(new LogicPos(pos90.x, pos90.y));
        }
        if (!walkableArea || walkableArea.length === 0) {
            walkableArea = new Array(rows);
            for (var i = 0; i < rows; i++) {
                walkableArea[i] = new Array(cols).fill(0);
            }
        }
        else {
            var wRows = walkableArea.length;
            var wCols = walkableArea[0].length;
            if (rows !== wRows || cols !== wCols) {
                // 数据尺寸不一致 做求交集处理
                // Logger.getInstance().debug("#walkable before ", walkableArea);
                var temp = new Array(rows);
                for (var i = 0; i < rows; i++) {
                    temp[i] = new Array(cols).fill(0);
                }
                for (var i = 0; i < rows; i++) {
                    for (var j = 0; j < cols; j++) {
                        if (i >= wRows || j >= wCols) {
                            continue;
                        }
                        temp[i][j] = walkableArea[i][j];
                    }
                }
                walkableArea = temp;
                // Logger.getInstance().debug("#walkable after ", walkableArea);
            }
        }
        return { origin: origin, collisionArea: collisionArea, walkableArea: walkableArea, pos45: pos45, rows: rows, cols: cols };
    };
    Room.prototype.addWalkableMark = function (x, y, id, level, walkable) {
        var idx = this.mapPos2Idx(x, y);
        if (!this.mWalkableMarkMap.has(idx)) {
            this.mWalkableMarkMap.set(idx, new Map());
        }
        var marks = this.mWalkableMarkMap.get(idx);
        if (marks.has(id)) {
            marks.delete(id);
        }
        marks.set(id, { level: level, walkable: walkable });
        this.caculateWalkableMark(x, y);
    };
    Room.prototype.removeWalkableMark = function (x, y, id) {
        var idx = this.mapPos2Idx(x, y);
        if (!this.mWalkableMarkMap.has(idx)) {
            this.mWalkableMarkMap.set(idx, new Map());
        }
        var marks = this.mWalkableMarkMap.get(idx);
        if (marks.has(id)) {
            marks.delete(id);
        }
        this.caculateWalkableMark(x, y);
    };
    Room.prototype.caculateWalkableMark = function (x, y) {
        var idx = this.mapPos2Idx(x, y);
        if (!this.mWalkableMarkMap.has(idx)) {
            this.setWalkableMap(x, y, false);
            return;
        }
        var marks = this.mWalkableMarkMap.get(idx);
        if (marks.size === 0) {
            this.setWalkableMap(x, y, false);
            return;
        }
        var highestLv = -1;
        var result = false;
        marks.forEach(function (val) {
            // 低优先级不影响结果
            if (val.level < highestLv)
                return;
            // 高优先级 直接覆盖
            if (val.level > highestLv) {
                highestLv = val.level;
                result = val.walkable;
                return;
            }
            // 相同优先级 不可行走覆盖可行走
            if (!val.walkable) {
                result = false;
            }
        });
        this.setWalkableMap(x, y, result);
    };
    Room.prototype.setWalkableMap = function (x, y, walkable) {
        if (y < 0 || y >= this.mWalkableMap.length || x < 0 || x >= this.mWalkableMap[y].length) {
            return;
        }
        var newVal = walkable ? 1 : 0;
        if (this.mWalkableMap[y][x] === newVal)
            return;
        this.mWalkableMap[y][x] = newVal;
        this.mAstar.setWalkableAt(x, y, walkable);
    };
    Room.prototype.setTerrainMap = function (x, y, walkable) {
        if (y < 0 || y >= this.mTerrainMap.length || x < 0 || x >= this.mTerrainMap[y].length) {
            return;
        }
        var newVal = walkable ? 1 : 0;
        if (this.mTerrainMap[y][x] === newVal)
            return;
        this.mTerrainMap[y][x] = newVal;
    };
    Room.prototype.mapPos2Idx = function (x, y) {
        return x + y * this.mMiniSize.cols;
    };
    Room.prototype.setState = function (state) {
        if (!this.mStateManager)
            this.mStateManager = new RoomStateManager(this);
        this.mStateManager.setState(state);
    };
    Room.prototype.showDecorateGrid = function () {
        if (!this.isDecorating)
            return;
        if (!this.mTerrainManager.hasAddComplete)
            return;
        this.game.renderPeer.showEditGrids(this.mMiniSize, this.mTerrainMap);
    };
    return Room;
}(PacketHandler));
export { Room };
//# sourceMappingURL=room.js.map