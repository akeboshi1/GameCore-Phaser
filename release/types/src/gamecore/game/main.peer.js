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
import { RPCPeer, Export, webworker_rpc } from "webworker-rpc";
import { op_gateway, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import * as protos from "pixelpai_proto";
import { Game } from "./game";
import { Logger, EventType, LogicPos } from "structure";
for (var key in protos) {
    PBpacket.addProtocol(protos[key]);
}
var MainPeer = /** @class */ (function (_super) {
    __extends_1(MainPeer, _super);
    // private isReconnect: boolean = false;
    function MainPeer(workerName) {
        var _this = _super.call(this, workerName) || this;
        _this.stateTime = 0;
        /**
         * 主进程和render之间完全链接成功
         */
        _this.isReady = false;
        _this.delayTime = 15000;
        _this.reConnectCount = 0;
        _this.isStartUpdateFps = false;
        _this.game = new Game(_this);
        _this.stateTime = new Date().getTime();
        return _this;
    }
    Object.defineProperty(MainPeer.prototype, "renderParam", {
        get: function () {
            return this.mRenderParam;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MainPeer.prototype, "mainPeerParam", {
        get: function () {
            return this.mMainPeerParam;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MainPeer.prototype, "render", {
        get: function () {
            return this.remote[this.mRenderParam.key][this.mRenderParam.name];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MainPeer.prototype, "config", {
        get: function () {
            return this.mConfig;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MainPeer.prototype, "game", {
        get: function () {
            return this.mGame;
        },
        set: function (val) {
            this.mGame = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MainPeer.prototype, "state", {
        get: function () {
            return this.game.gameStateManager.curState;
        },
        set: function (val) {
            var now = new Date().getTime();
            Logger.getInstance().log("gameState: ====>", val, "delayTime:=====>", now - this.stateTime);
            this.gameState = val;
            this.stateTime = now;
        },
        enumerable: true,
        configurable: true
    });
    // ============= connection调用主进程
    MainPeer.prototype.onConnected = function (isAuto) {
        // 逻辑层game链接成功
        this.game.onConnected(isAuto);
    };
    MainPeer.prototype.onDisConnected = function (isAuto) {
        // 告诉主进程断开链接
        this.render.onDisConnected();
        // 停止心跳
        this.endBeat();
        this.game.onDisConnected(isAuto);
    };
    MainPeer.prototype.onConnectError = function (error) {
        // 告诉主进程链接错误
        this.render.onConnectError(error);
        // 停止心跳
        this.endBeat();
        this.game.onError();
    };
    MainPeer.prototype.onData = function (buffer) {
        this.game.connection.onData(buffer);
    };
    MainPeer.prototype.workerEmitter = function (eventType, data) {
        this.render.workerEmitter(eventType, data);
    };
    // ============= 主进程调用心跳
    MainPeer.prototype.updateFps = function () {
        var _this = this;
        if (this.isStartUpdateFps)
            return;
        this.isStartUpdateFps = true;
        this.startUpdateFps = setInterval(function () {
            _this.render.updateFPS();
        }, 100);
    };
    MainPeer.prototype.endFps = function () {
        if (this.startUpdateFps) {
            clearInterval(this.startUpdateFps);
            this.startUpdateFps = null;
        }
        // Logger.getInstance().debug("heartBeatWorker endBeat");
        this.render.endFPS();
    };
    MainPeer.prototype.startBeat = function () {
        var _this = this;
        if (this.startDelay)
            return;
        this.startDelay = setInterval(function () {
            if (_this.reConnectCount >= 8) {
                _this.game.reconnect();
                return;
            }
            _this.reConnectCount++;
            var pkt = new PBpacket(op_gateway.OPCODE._OP_CLIENT_REQ_GATEWAY_PING);
            _this.game.socket.send(pkt.Serialization());
        }, this.delayTime);
    };
    MainPeer.prototype.endBeat = function () {
        this.reConnectCount = 0;
        if (this.startDelay) {
            clearInterval(this.startDelay);
            this.startDelay = null;
        }
        Logger.getInstance().log("heartBeat end");
        // this.mainPeer.endHeartBeat();
    };
    MainPeer.prototype.clearBeat = function () {
        this.reConnectCount = 0;
        // Logger.getInstance().debug("heartBeatWorker clearBeat");
        // this.mainPeer.clearHeartBeat();
    };
    MainPeer.prototype.refrehActiveUIState = function (panel) {
        return this.game.uiManager.refrehActiveUIState(panel);
    };
    MainPeer.prototype.showMovePoint = function (val) {
        if (this.game && this.game.user)
            this.game.user.debugPoint = val;
    };
    // ============== render调用主进程
    MainPeer.prototype.createGame = function (config) {
        this.mConfig = config;
        this.game.init(config);
        // log 在不同进程中都需要设置debug参数
        Logger.getInstance().isDebug = config.debugLog || false;
    };
    MainPeer.prototype.getScaleRatio = function () {
        return this.game.scaleRatio;
    };
    MainPeer.prototype.updateMoss = function (moss) {
        if (this.game.elementStorage)
            this.game.elementStorage.updateMoss(moss);
    };
    MainPeer.prototype.updatePalette = function (palette) {
        if (this.game.elementStorage)
            this.game.elementStorage.updatePalette(palette);
    };
    MainPeer.prototype.removeElement = function (id) {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.elementManager) {
            this.game.roomManager.currentRoom.elementManager.remove(id);
        }
    };
    MainPeer.prototype.refreshToken = function () {
        this.game.refreshToken();
    };
    MainPeer.prototype.changePlayerState = function (id, state, times) {
        var playser = this.game.roomManager.currentRoom.playerManager.get(id);
        if (playser)
            playser.changeState(state, times);
    };
    MainPeer.prototype.setDragonBonesQueue = function (id, animation) {
        var dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
        if (dragonbones)
            dragonbones.setQueue(animation);
    };
    MainPeer.prototype.loginEnterWorld = function () {
        Logger.getInstance().debug("game======loginEnterWorld");
        this.game.loginEnterWorld();
    };
    MainPeer.prototype.closeConnect = function (boo) {
        if (boo)
            this.terminate();
        this.game.connection.closeConnect();
    };
    MainPeer.prototype.reconnect = function (isAuto) {
        // if (this.isReconnect) return;
        // this.isReconnect = true;
        // 告诉逻辑进程重新链接
        this.game.reconnect();
    };
    MainPeer.prototype.refreshConnect = function () {
        this.game.onRefreshConnect();
    };
    MainPeer.prototype.onFocus = function () {
        this.game.onFocus();
    };
    MainPeer.prototype.onBlur = function () {
        this.game.onBlur();
        // todo manager pause
    };
    MainPeer.prototype.setSize = function (width, height) {
        this.game.setSize(width, height);
    };
    MainPeer.prototype.setGameConfig = function (configStr) {
        this.game.setGameConfig(configStr);
    };
    MainPeer.prototype.send = function (buffer) {
        this.game.socket.send(buffer);
    };
    MainPeer.prototype.destroyClock = function () {
        this.game.destroyClock();
    };
    MainPeer.prototype.clearGameComplete = function () {
        this.game.clearGameComplete();
    };
    MainPeer.prototype.initUI = function () {
        // 根据不同场景初始化不同场景ui
        if (this.game.roomManager.currentRoom)
            this.game.roomManager.currentRoom.initUI();
    };
    MainPeer.prototype.getActiveUIData = function (str) {
        return this.game.uiManager.getUIStateData(str);
    };
    MainPeer.prototype.startRoomPlay = function () {
        Logger.getInstance().debug("peer startroom");
        if (this.game.roomManager && this.game.roomManager.currentRoom)
            this.game.roomManager.currentRoom.startPlay();
    };
    MainPeer.prototype.onVerifiedHandler = function (name, idcard) {
    };
    MainPeer.prototype.getRoomTransformTo90 = function (p) {
        return this.game.roomManager.currentRoom.transformTo90(p);
    };
    MainPeer.prototype.getCurrentRoomSize = function () {
        return this.game.roomManager.currentRoom.roomSize;
    };
    MainPeer.prototype.getCurrentRoomMiniSize = function () {
        return this.game.roomManager.currentRoom.miniSize;
    };
    MainPeer.prototype.getPlayerName = function (id) {
        var player = this.game.roomManager.currentRoom.playerManager.get(id);
        return player.nickname;
    };
    MainPeer.prototype.getPlayerAvatar = function () {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.playerManager && this.game.roomManager.currentRoom.playerManager.actor) {
            var avatar = this.game.roomManager.currentRoom.playerManager.actor.model.avatar;
            var suits = this.game.roomManager.currentRoom.playerManager.actor.model.suits;
            return { avatar: avatar, suits: suits };
        }
        return null;
    };
    MainPeer.prototype.resetGameraSize = function (width, height) {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService)
            this.game.roomManager.currentRoom.cameraService.resetCameraSize(width, height);
    };
    MainPeer.prototype.syncCameraScroll = function () {
        if (this.game.roomManager && this.game.roomManager.currentRoom && this.game.roomManager.currentRoom.cameraService) {
            Logger.getInstance().debug("mainpeer====synccamerascroll");
            this.game.roomManager.currentRoom.cameraService.syncCameraScroll();
        }
    };
    MainPeer.prototype.sendMouseEvent = function (id, mouseEvent, point3f) {
        var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOUSE_EVENT);
        var content = pkt.content;
        content.id = id;
        content.mouseEvent = mouseEvent;
        content.point3f = point3f;
        this.game.connection.send(pkt);
    };
    MainPeer.prototype.exitUser = function () {
        this.game.exitUser();
    };
    MainPeer.prototype.displayCompleteMove = function (id) {
        if (!this.game.roomManager.currentRoom)
            return;
        var element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element)
            element.completeMove();
    };
    MainPeer.prototype.syncPosition = function (targetPoint) {
        this.game.user.syncPosition();
    };
    MainPeer.prototype.syncElementPosition = function (id, targetPoint) {
        if (!this.game.roomManager || this.game.roomManager.currentRoom)
            return;
        var elementManager = this.game.roomManager.currentRoom.elementManager;
        if (!elementManager)
            return;
        var ele = elementManager.get(id);
        if (!ele)
            return;
        // ele.syncPosition(targetPoint);
    };
    MainPeer.prototype.setSyncDirty = function (boo) {
        if (!this.game.roomManager.currentRoom)
            return;
        this.game.roomManager.currentRoom.cameraService.syncDirty = boo;
    };
    MainPeer.prototype.elementDisplayReady = function (id) {
        if (!this.game)
            return;
        if (!this.game.roomManager)
            return;
        if (!this.game.roomManager.currentRoom)
            return;
        var elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager)
            elementManager.onDisplayReady(id);
    };
    MainPeer.prototype.elementDisplaySyncReady = function (id) {
        var elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager)
            elementManager.elementDisplaySyncReady(id);
    };
    MainPeer.prototype.now = function () {
        return this.game.roomManager.currentRoom.now();
    };
    MainPeer.prototype.setDirection = function (id, direction) {
        var element = this.game.roomManager.currentRoom.playerManager.get(id);
        if (element)
            element.setDirection(direction);
    };
    MainPeer.prototype.getMed = function (name) {
        return this.game.uiManager.getMed(name);
    };
    MainPeer.prototype.elementsShowReferenceArea = function () {
        var elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager)
            elementManager.showReferenceArea();
    };
    MainPeer.prototype.elementsHideReferenceArea = function () {
        var elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager)
            elementManager.hideReferenceArea();
    };
    MainPeer.prototype.pushMovePoints = function (id, points) {
        var elementManager = this.game.roomManager.currentRoom.elementManager;
        if (elementManager) {
            var ele = elementManager.get(id);
            if (ele)
                ele.startMove(points);
        }
    };
    MainPeer.prototype.onTapHandler = function (obj) {
        // if (this.game.roomManager.currentRoom) this.game.roomManager.currentRoom.move(obj.id, obj.x, obj.y, obj.nodeType);
    };
    MainPeer.prototype.getCurrentRoomType = function () {
        return this.game.roomManager.currentRoom.sceneType;
    };
    MainPeer.prototype.activePlayer = function (id) {
        var playermgr = this.game.roomManager.currentRoom.playerManager;
        if (playermgr.has(id)) {
            this.game.emitter.emit(EventType.SCENE_INTERACTION_ELEMENT, id);
        }
    };
    MainPeer.prototype.getInteractivePosition = function (id) {
        var room = this.game.roomManager.currentRoom;
        if (!room)
            return;
        var ele = room.getElement(id);
        if (!ele)
            return;
        return ele.getInteractivePositionList();
    };
    MainPeer.prototype.stopSelfMove = function () {
        this.game.user.stopMove();
    };
    MainPeer.prototype.stopGuide = function (id) {
        if (this.game.guideWorkerManager)
            this.game.guideWorkerManager.stopGuide(id);
    };
    MainPeer.prototype.findPath = function (targets, targetId, toReverse) {
        if (toReverse === void 0) { toReverse = false; }
        if (this.game.user)
            this.game.user.findPath(targets, targetId, toReverse);
    };
    MainPeer.prototype.startFireMove = function (pointer) {
        if (this.game.user)
            this.game.user.startFireMove(pointer);
    };
    MainPeer.prototype.syncClock = function (times) {
        this.game.syncClock(times);
    };
    MainPeer.prototype.clearClock = function () {
        this.game.clearClock();
    };
    MainPeer.prototype.requestCurTime = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.render.getCurTime(_this.game.clock.unixTime)
                .then(function (t) {
                resolve(t);
            });
        });
    };
    MainPeer.prototype.httpClockEnable = function (enable) {
        this.game.httpClock.enable = enable;
    };
    MainPeer.prototype.showNoticeHandler = function (text) {
        // const data = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI();
        // data.text = [{ text, node: undefined }];
        // this.game.showByName(ModuleName.PICANOTICE_NAME, data);
    };
    MainPeer.prototype.showPanelHandler = function (name, data) {
        this.game.showByName(name, data);
    };
    MainPeer.prototype.closePanelHandler = function (id) {
        var packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_CLOSE_UI);
        var content = packet.content;
        content.uiIds = [id];
        this.game.connection.send(packet);
    };
    MainPeer.prototype.showMediator = function (name, isShow, param) {
        if (name.length === 0)
            return;
        this.game.showMediator(name, isShow, param);
    };
    MainPeer.prototype.exportUimanager = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.exportProperty(_this.game.uiManager, _this, "uiManager").onceReady(function () {
                resolve(true);
            });
        });
    };
    MainPeer.prototype.hideMediator = function (name) {
        this.game.hideMediator(name);
    };
    MainPeer.prototype.renderEmitter = function (eventType, data) {
        this.game.emitter.emit(eventType, data);
    };
    MainPeer.prototype.fetchProjectionSize = function (id) {
        var room = this.game.roomManager.currentRoom;
        if (!room) {
            return;
        }
        var ele = room.getElement(id);
        if (!ele) {
            return;
        }
        return ele.getProjectionSize();
    };
    MainPeer.prototype.getClockNow = function () {
        return this.game.clock.unixTime;
    };
    MainPeer.prototype.setPosition = function (id, updateBoo, x, y, z) {
        var ele = this.game.roomManager.currentRoom.getElement(id);
        if (ele) {
            ele.setPosition({ x: x, y: y, z: z }, updateBoo);
        }
    };
    // @Export([webworker_rpc.ParamType.num])
    // public removePartMount(id: number, targets?: any, paths?: any) {
    //     const ele: IElement = this.game.roomManager.currentRoom.elementManager.get(id);
    //     if (!ele) return;
    //     ele.removePartMount(targets, paths);
    // }
    MainPeer.prototype.selfStartMove = function () {
        var user = this.game.user;
        if (user) {
            user.startMove();
        }
    };
    MainPeer.prototype.tryStopMove = function (id, interactiveBoo, targetId, stopPos) {
        if (this.game.user) {
            // const room = this.game.roomManager.currentRoom;
            // this.game.user.tryStopMove({ targetId, interactiveBoo: false, stopPos });
            // room.elementManager.checkElementAction(targetId);
            // const needBroadcast = room.elementManager.checkActionNeedBroadcast(targetId);
            // if (interactiveBoo) this.game.user.activeSprite(targetId, undefined, needBroadcast);
        }
    };
    MainPeer.prototype.tryStopElementMove = function (id, points) {
        var ele = this.game.roomManager.currentRoom.elementManager.get(id);
        if (!ele)
            return;
        ele.stopMove(points);
    };
    MainPeer.prototype.requestPushBox = function (id) {
        this.game.user.requestPushBox(id);
    };
    MainPeer.prototype.removeMount = function (id, mountID, stopPos) {
        return __awaiter(this, void 0, void 0, function () {
            var room, ele, target;
            return __generator(this, function (_a) {
                room = this.game.roomManager.currentRoom;
                if (!room) {
                    return [2 /*return*/, Logger.getInstance().error("room not exist")];
                }
                ele = room.getElement(id);
                target = room.getElement(mountID);
                if (!ele || !target) {
                    return [2 /*return*/, Logger.getInstance().error("target not exist")];
                }
                return [2 /*return*/, ele.removeMount(target, stopPos)];
            });
        });
    };
    MainPeer.prototype.stopMove = function (x, y) {
        this.game.user.stopMove(new LogicPos(x, y));
    };
    MainPeer.prototype.uploadHeadImage = function (url) {
        var _this = this;
        this.game.httpService.uploadHeadImage(url).then(function () {
            _this.game.emitter.emit("updateDetail");
        });
    };
    MainPeer.prototype.uploadDBTexture = function (key, url, json) {
        return this.game.httpService.uploadDBTexture(key, url, json);
    };
    MainPeer.prototype.completeDragonBonesAnimationQueue = function (id) {
        var dragonbones = this.game.roomManager.currentRoom.playerManager.get(id);
        if (dragonbones)
            dragonbones.completeAnimationQueue();
    };
    MainPeer.prototype.completeFrameAnimationQueue = function (id) {
        var frames = this.game.roomManager.currentRoom.elementManager.get(id);
        if (frames)
            frames.completeAnimationQueue();
    };
    MainPeer.prototype.setConfig = function (config) {
        this.mConfig = config;
        this.game.setConfig(config);
    };
    MainPeer.prototype.moveMotion = function (x, y) {
        this.game.user.moveMotion(x, y);
    };
    // ==== todo
    MainPeer.prototype.terminate = function () {
        // this.remote[HEARTBEAT_WORKER].HeartBeatPeer.terminate();
        self.close();
        // super.terminate();
    };
    /**
     * 慎用，super.destroy()会使worker.terminator,致使整个游戏进程关闭
     */
    MainPeer.prototype.destroy = function () {
        if (this.game)
            this.game.isDestroy = true;
        _super.prototype.destroy.call(this);
    };
    // ==== config
    MainPeer.prototype.isPlatform_PC = function () {
        return this.mConfig && this.mConfig.platform && this.mConfig.platform === "pc";
    };
    __decorate([
        Export()
    ], MainPeer.prototype, "mGame", void 0);
    __decorate([
        Export()
    ], MainPeer.prototype, "updateFps", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "endFps", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "clearBeat", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "refrehActiveUIState", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], MainPeer.prototype, "showMovePoint", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "createGame", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getScaleRatio", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "updateMoss", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "updatePalette", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "removeElement", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "refreshToken", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "changePlayerState", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "setDragonBonesQueue", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "loginEnterWorld", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], MainPeer.prototype, "closeConnect", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "reconnect", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "refreshConnect", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "onFocus", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "onBlur", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "setSize", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "setGameConfig", null);
    __decorate([
        Export([webworker_rpc.ParamType.unit8array])
    ], MainPeer.prototype, "send", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "destroyClock", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "clearGameComplete", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "initUI", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "getActiveUIData", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "startRoomPlay", null);
    __decorate([
        Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "onVerifiedHandler", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getRoomTransformTo90", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getCurrentRoomSize", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getCurrentRoomMiniSize", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "getPlayerName", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getPlayerAvatar", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "resetGameraSize", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "syncCameraScroll", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "sendMouseEvent", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "exitUser", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "displayCompleteMove", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "syncPosition", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "syncElementPosition", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], MainPeer.prototype, "setSyncDirty", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "elementDisplayReady", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "elementDisplaySyncReady", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "now", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "setDirection", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "getMed", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "elementsShowReferenceArea", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "elementsHideReferenceArea", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "pushMovePoints", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "onTapHandler", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getCurrentRoomType", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "activePlayer", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "getInteractivePosition", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "stopSelfMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "stopGuide", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "findPath", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "startFireMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "syncClock", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "clearClock", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "requestCurTime", null);
    __decorate([
        Export([webworker_rpc.ParamType.boolean])
    ], MainPeer.prototype, "httpClockEnable", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "showNoticeHandler", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "showPanelHandler", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "closePanelHandler", null);
    __decorate([
        Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.boolean])
    ], MainPeer.prototype, "showMediator", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "exportUimanager", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "hideMediator", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "renderEmitter", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "fetchProjectionSize", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "getClockNow", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "setPosition", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "selfStartMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    ], MainPeer.prototype, "tryStopMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "tryStopElementMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "requestPushBox", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "removeMount", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "stopMove", null);
    __decorate([
        Export([webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "uploadHeadImage", null);
    __decorate([
        Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.str])
    ], MainPeer.prototype, "uploadDBTexture", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "completeDragonBonesAnimationQueue", null);
    __decorate([
        Export([webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "completeFrameAnimationQueue", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "setConfig", null);
    __decorate([
        Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    ], MainPeer.prototype, "moveMotion", null);
    __decorate([
        Export()
    ], MainPeer.prototype, "destroy", null);
    return MainPeer;
}(RPCPeer));
export { MainPeer };
//# sourceMappingURL=main.peer.js.map