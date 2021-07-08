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
import { op_def, op_virtual_world } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Player } from "../room/player/player";
import { PlayerModel } from "../room/player/player.model";
import { AvatarSuitType, EventType, PlayerState, DirectionChecker, Logger, LogicPos } from "structure";
import { LayerEnum } from "game-capsule";
import { Tool } from "utils";
import { MoveControll } from "../collsion";
// import * as _ from "lodash";
var wokerfps = 30;
var interval = wokerfps > 0 ? 1000 / wokerfps : 1000 / 30;
var User = /** @class */ (function (_super) {
    __extends_1(User, _super);
    function User() {
        var _this = _super.call(this, undefined, undefined) || this;
        _this.stopBoxMove = false;
        _this.mDebugPoint = false;
        _this.mMoveStyle = MoveStyleEnum.Null;
        _this.mSyncTime = 0;
        _this.mSyncDirty = false;
        _this.mSetPostionTime = 0;
        _this.mPreTargetID = 0;
        _this.holdTime = 0;
        _this.holdDelay = 80;
        _this.mBlockable = false;
        return _this;
    }
    Object.defineProperty(User.prototype, "nearEle", {
        get: function () {
            return this.mNearEle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "debugPoint", {
        get: function () {
            return this.mDebugPoint;
        },
        set: function (val) {
            this.mDebugPoint = val;
        },
        enumerable: true,
        configurable: true
    });
    User.prototype.load = function (displayInfo, isUser) {
        if (isUser === void 0) { isUser = false; }
        return _super.prototype.load.call(this, displayInfo, true);
    };
    User.prototype.addPackListener = function () {
    };
    User.prototype.removePackListener = function () {
    };
    User.prototype.enterScene = function (room, actor) {
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
                    actor.avatar = (AvatarSuitType.createBaseAvatar());
            }
        }
        this.moveControll = new MoveControll(actor.id, this.mRoomService);
        this.model = new PlayerModel(actor);
        this.mRoomService.playerManager.setMe(this);
        // todo render setScroll
        Logger.getInstance().debug("setCameraScroller");
        this.mRoomService.game.renderPeer.setCameraScroller(actor.x, actor.y);
    };
    User.prototype.update = function (time, delta) {
        if (this.mMoving === false)
            return;
        this._doMove(time, delta);
        this.mDirty = false;
        this.mRoomService.cameraService.syncDirty = true;
        var now = Date.now();
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
            var movePath = op_def.MovePath.create();
            movePath.id = this.id;
            movePath.movePos = this.mMovePoints;
            var packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
            var content = packet.content;
            content.movePath = movePath;
            this.mRoomService.game.connection.send(packet);
            this.mMovePoints.length = 0;
            this.mMovePoints = [];
            this.mMoveTime = now;
        }
    };
    User.prototype.findPath = function (targets, targetId, toReverse) {
        if (toReverse === void 0) { toReverse = false; }
        return __awaiter(this, void 0, void 0, function () {
            var pos, miniSize, _i, targets_1, target, findResult, firstPos, path, _a, findResult_1, p;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!targets) {
                            return [2 /*return*/];
                        }
                        if (!this.mRootMount) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.mRootMount.removeMount(this, targets[0])];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        pos = this.mModel.pos;
                        miniSize = this.roomService.miniSize;
                        for (_i = 0, targets_1 = targets; _i < targets_1.length; _i++) {
                            target = targets_1[_i];
                            // findPath坐标转换后存在误差
                            if (Tool.twoPointDistance(target, pos) <= miniSize.tileWidth / 2) {
                                this.mMoveData = { targetId: targetId };
                                this.stopMove();
                                return [2 /*return*/];
                            }
                        }
                        findResult = this.roomService.findPath(pos, targets, toReverse);
                        if (!findResult) {
                            return [2 /*return*/];
                        }
                        firstPos = targets[0];
                        if (findResult.length < 1) {
                            this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_UNREACHABLE_AREA);
                            return [2 /*return*/];
                        }
                        path = [];
                        for (_a = 0, findResult_1 = findResult; _a < findResult_1.length; _a++) {
                            p = findResult_1[_a];
                            path.push({ pos: p });
                        }
                        this.moveStyle = MoveStyleEnum.Astar;
                        this.mMoveData = { path: path, targetId: targetId };
                        this.addFillEffect({ x: firstPos.x, y: firstPos.y }, op_def.PathReachableStatus.PATH_REACHABLE_AREA);
                        this.moveControll.setIgnoreCollsion(true);
                        this.startMove();
                        this.checkDirection();
                        return [2 /*return*/];
                }
            });
        });
    };
    User.prototype.moveMotion = function (x, y) {
        if (this.mRootMount) {
            this.mRootMount.removeMount(this, { x: x, y: y });
        }
        this.mMoveData = { path: [{ pos: new LogicPos(x, y) }] };
        this.mSyncDirty = true;
        // this.body.isSensor = false;
        this.moveControll.setIgnoreCollsion(false);
        this.moveStyle = MoveStyleEnum.Motion;
        this.startMove();
    };
    User.prototype.unmount = function (targetPos) {
        var mountID = this.mRootMount.id;
        this.mRootMount = null;
        this.addBody();
        this.unmountSprite(mountID, targetPos);
        return Promise.resolve(this);
    };
    User.prototype.syncPosition = function () {
        var userPos = this.getPosition();
        var pos = op_def.PBPoint3f.create();
        pos.x = userPos.x;
        pos.y = userPos.y;
        var movePoint = op_def.MovePoint.create();
        movePoint.pos = pos;
        // todo pos发生变化就开始check
        // ==================== 检测周边可交互物件
        // this.mNearEle = this.checkNearEle(pos);
        // ====================
        // 给每个同步点时间戳
        movePoint.timestamp = Date.now();
        if (!this.mMovePoints)
            this.mMovePoints = [];
        this.mMovePoints.push(movePoint);
    };
    User.prototype.startMove = function () {
        if (!this.mMoveData)
            return;
        var path = this.mMoveData.path;
        if (path.length < 1)
            return;
        this.changeState(PlayerState.WALK);
        this.mMoving = true;
        var pos = this.getPosition();
        var angle = Math.atan2((path[0].pos.y - pos.y), (path[0].pos.x - pos.x));
        var speed = this.mModel.speed * interval;
        this.moveControll.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    };
    User.prototype.stopMove = function (stopPos) {
        if (!this.mMovePoints)
            this.mMovePoints = [];
        this.changeState(PlayerState.IDLE);
        this.moveControll.setVelocity(0, 0);
        this.moveStyle = MoveStyleEnum.Null;
        if (this.mMoving) {
            var pos = stopPos ? stopPos : this.mModel.pos;
            var position = op_def.PBPoint3f.create();
            position.x = pos.x;
            position.y = pos.y;
            var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_STOP_SELF);
            var ct = pkt.content;
            ct.position = pos;
            // ct.movePath = movePath;
            this.mElementManager.connection.send(pkt);
        }
        this.mMovePoints = [];
        this.mMoving = false;
        this.stopActiveSprite();
    };
    User.prototype.move = function (moveData) {
        if (!this.mDebugPoint) {
            this.mRoomService.game.renderPeer.hideServerPosition();
            return;
        }
        this.mRoomService.game.renderPeer.drawServerPosition(moveData[0].x, moveData[0].y);
    };
    User.prototype.setQueue = function (animations) {
        if (this.mMoving) {
            return;
        }
        _super.prototype.setQueue.call(this, animations);
    };
    User.prototype.requestPushBox = function (targetId) {
        var pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_CLIENT_HIT_SPRITE);
        var ct = pkt.content;
        ct.targetId = targetId;
        ct.timestamp = new Date().getTime();
        ct.dir = this.mModel.direction;
        this.mElementManager.connection.send(pkt);
    };
    // override super's method.
    User.prototype.setRenderable = function (isRenderable) {
        // do nothing!
        // Actor is always renderable!!!
        return Promise.resolve();
    };
    User.prototype.clear = function () {
        this.holdTime = 0;
        this.removePackListener();
        _super.prototype.clear.call(this);
        this.destroy();
    };
    User.prototype.stopActiveSprite = function (pos) {
        if (!this.mMoveData)
            return;
        var targetId = this.mMoveData.targetId;
        if (!targetId) {
            return;
        }
        // this.mRoomService.elementManager.checkElementAction(targetId);
        // const needBroadcast = this.mRoomService.elementManager.checkActionNeedBroadcast(targetId);
        this.activeSprite(targetId, undefined, false);
        delete this.mMoveData.targetId;
    };
    User.prototype.tryActiveAction = function (targetId, param, needBroadcast) {
        this.activeSprite(targetId, param, needBroadcast);
        this.mRoomService.game.emitter.emit(EventType.SCENE_PLAYER_ACTION, this.mRoomService.game.user.id, targetId, param);
    };
    User.prototype.updateModel = function (model) {
        if (model.hasOwnProperty("inputMask")) {
            this.mInputMask = model.inputMask;
            this.mRoomService.game.renderPeer.updateInput(this.mInputMask);
        }
        _super.prototype.updateModel.call(this, model, this.mRoomService.game.avatarType);
    };
    User.prototype.destroy = function () {
        this.mSetPostionTime = 0;
        _super.prototype.destroy.call(this);
    };
    User.prototype.setPosition = function (pos, syncPos) {
        if (syncPos === void 0) { syncPos = false; }
        _super.prototype.setPosition.call(this, pos);
        // // ==================== 检测周边可交互物件
        // this.checkNearEle(pos);
        // // ====================
        var now = new Date().getTime();
        if (now - this.mSetPostionTime > 1000) {
            this.mSetPostionTime = now;
            this.syncCameraPosition();
        }
        // 向服务器同步位置
        if (syncPos) {
            this.syncPosition();
            var movePath = op_def.MovePath.create();
            movePath.id = this.id;
            movePath.movePos = this.mMovePoints;
            var packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
            var content = packet.content;
            content.movePath = movePath;
            this.mRoomService.game.connection.send(packet);
            this.mMovePoints.length = 0;
            this.mMovePoints = [];
            this.mMoveTime = now;
        }
    };
    /**
     * 检测角色当前位置附近的可交互element
     * @param pos
     */
    User.prototype.checkNearEle = function (pos) {
        var x = pos.x;
        var y = pos.y;
        var ids = this.mRoomService.getInteractiveEles(x, y);
        if (!ids)
            return;
        var len = ids.length;
        var elementManager = this.mRoomService.elementManager;
        var dis = Number.MAX_VALUE;
        var mNearEle;
        var basePos = this.getPosition();
        for (var i = 0; i < len; i++) {
            var tmpIds = ids[i];
            var tmpLen = tmpIds.length;
            for (var j = 0; j < tmpLen; j++) {
                var id = tmpIds[j];
                var ele = elementManager.get(id);
                // tslint:disable-next-line:no-console
                // console.log("id ===>", id, 0);
                if (!ele)
                    continue;
                var elePos = ele.getPosition();
                var tmpDis = Tool.twoPointDistance(elePos, basePos);
                // tslint:disable-next-line:no-console
                // console.log("id ===>", id, 1, elePos, basePos, tmpDis);
                if (dis > tmpDis) {
                    dis = tmpDis;
                    // tslint:disable-next-line:no-console
                    // console.log("id ===>", id, 2);
                    mNearEle = ele;
                }
            }
        }
        // tslint:disable-next-line:no-console
        // console.log("mNearEle ===>", mNearEle);
        return mNearEle;
    };
    User.prototype.activeSprite = function (targetId, param, needBroadcast) {
        return __awaiter(this, void 0, void 0, function () {
            var ele, key, now, txt, tempdata, packet, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!targetId) {
                            this.mPreTargetID = 0;
                            return [2 /*return*/];
                        }
                        ele = this.mRoomService.getElement(targetId);
                        if (!ele) return [3 /*break*/, 2];
                        if (!(ele.model && ele.model.sound)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.mRoomService.game.renderPeer.url.getSound(ele.model.sound)];
                    case 1:
                        key = _a.sent();
                        this.mRoomService.game.renderPeer.playSoundByKey(key);
                        _a.label = 2;
                    case 2:
                        now = new Date().getTime();
                        if (!(this.mPreTargetID === targetId)) return [3 /*break*/, 4];
                        if (!(now - this.holdTime < this.holdDelay)) return [3 /*break*/, 4];
                        this.holdTime = now;
                        return [4 /*yield*/, this.mRoomService.game.renderPeer.i18nString("noticeTips.quickclick")];
                    case 3:
                        txt = _a.sent();
                        tempdata = {
                            text: [{ text: txt, node: undefined }]
                        };
                        // this.mRoomService.game.peer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
                        return [2 /*return*/];
                    case 4:
                        this.mPreTargetID = targetId;
                        packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_ACTIVE_SPRITE);
                        content = packet.content;
                        content.spriteId = targetId;
                        content.param = param ? JSON.stringify(param) : "";
                        content.needBroadcast = needBroadcast;
                        this.mRoomService.game.connection.send(packet);
                        return [2 /*return*/];
                }
            });
        });
    };
    User.prototype.unmountSprite = function (id, pos) {
        var packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UMOUNT_SPRITE);
        var content = packet.content;
        if (!pos)
            pos = this.getPosition();
        var pos3f = op_def.PBPoint3f.create();
        pos3f.x = pos.x;
        pos3f.y = pos.y;
        pos3f.z = pos.z;
        content.pos = pos;
        content.spriteId = id;
        this.mRoomService.game.connection.send(packet);
    };
    User.prototype.addToBlock = function () {
        return this.addDisplay();
    };
    User.prototype.addBody = function () {
        // if (this.mRootMount) return;
        this.drawBody();
    };
    User.prototype.syncCameraPosition = function () {
        this.roomService.cameraFollowHandler();
    };
    User.prototype.checkDirection = function () {
        var posA = null;
        var posB = null;
        if (this.moveStyle === MoveStyleEnum.Motion) {
            if (!this.moveData || !this.moveData.path) {
                return;
            }
            posB = this.moveData.path[0].pos;
            posA = this.moveControll.position;
        }
        else {
            posB = this.moveControll.position;
            posA = this.moveControll.prePosition;
        }
        var dir = DirectionChecker.check(posA, posB);
        this.setDirection(dir);
    };
    Object.defineProperty(User.prototype, "model", {
        get: function () {
            return this.mModel;
        },
        set: function (val) {
            if (!val) {
                return;
            }
            if (!this.mModel) {
                this.mModel = val;
            }
            else {
                Object.assign(this.mModel, val);
            }
            this.mModel.off("Animation_Change", this.animationChanged, this);
            this.mModel.on("Animation_Change", this.animationChanged, this);
            if (!this.mModel.layer) {
                this.mModel.layer = LayerEnum.Surface;
            }
            this.load(this.mModel.displayInfo, this.isUser);
            if (this.mModel.pos) {
                var obj = { id: val.id, pos: val.pos, nickname: this.model.nickname, alpha: val.alpha, titleMask: val.titleMask | 0x00010000, hasInteractive: true };
                this.mRoomService.game.renderPeer.setModel(obj);
                this.setPosition(this.mModel.pos);
            }
            // todo change display alpha
            this.setDirection(this.mModel.direction);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "package", {
        get: function () {
            return undefined;
        },
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(User.prototype, "moveStyle", {
        get: function () {
            return this.mMoveStyle;
        },
        set: function (val) {
            this.mMoveStyle = val;
        },
        enumerable: true,
        configurable: true
    });
    User.prototype.addFillEffect = function (pos, status) {
        var scaleRatio = this.roomService.game.scaleRatio;
        this.roomService.game.renderPeer.addFillEffect(pos.x * scaleRatio, pos.y * scaleRatio, status);
    };
    return User;
}(Player));
export { User };
var MoveStyleEnum;
(function (MoveStyleEnum) {
    MoveStyleEnum[MoveStyleEnum["Null"] = 0] = "Null";
    MoveStyleEnum[MoveStyleEnum["Astar"] = 1] = "Astar";
    MoveStyleEnum[MoveStyleEnum["Motion"] = 2] = "Motion";
})(MoveStyleEnum || (MoveStyleEnum = {}));
//# sourceMappingURL=user.js.map