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
import { LayerEnum } from "game-capsule";
import { PBpacket } from "net-socket-packet";
import { op_def, op_virtual_world } from "pixelpai_proto";
import { AvatarSuitType, PlayerState, DirectionChecker, Logger, LogicPos } from "structure";
import { Tool } from "utils";
import { BlockObject } from "../block/block.object";
import { BaseStateManager } from "../state";
import { InputEnable } from "./input.enable";
var Element = /** @class */ (function (_super) {
    __extends_1(Element, _super);
    function Element(sprite, mElementManager) {
        var _this = _super.call(this, sprite ? sprite.id : -1, mElementManager ? mElementManager.roomService : undefined) || this;
        _this.mElementManager = mElementManager;
        _this.mAnimationName = "";
        _this.mMoveData = {};
        _this.mCurState = PlayerState.IDLE;
        _this.mOffsetY = undefined;
        _this.mMoving = false;
        _this.mDirty = false;
        _this.mCreatedDisplay = false;
        _this.isUser = false;
        // 移动
        _this.mMoveDelayTime = 400;
        _this.mMoveTime = 0;
        _this.mMoveSyncDelay = 200;
        _this.mMoveSyncTime = 0;
        _this.delayTime = 1000 / 45;
        _this.mState = false;
        if (!sprite) {
            return _this;
        }
        _this.mId = sprite.id;
        _this.model = sprite;
        return _this;
    }
    Object.defineProperty(Element.prototype, "state", {
        get: function () {
            return this.mState;
        },
        set: function (val) {
            this.mState = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "dir", {
        get: function () {
            return (this.mDisplayInfo && this.mDisplayInfo.avatarDir !== undefined) ? this.mDisplayInfo.avatarDir : 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "roomService", {
        get: function () {
            return this.mRoomService;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "id", {
        get: function () {
            return this.mId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "model", {
        get: function () {
            return this.mModel;
        },
        set: function (val) {
            this.setModel(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "moveData", {
        get: function () {
            return this.mMoveData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "created", {
        get: function () {
            return this.mCreatedDisplay;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "eleMgr", {
        get: function () {
            if (this.mElementManager) {
                return this.mElementManager;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "moving", {
        get: function () {
            return this.mMoving;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Element.prototype, "nodeType", {
        get: function () {
            return op_def.NodeType.ElementNodeType;
        },
        enumerable: true,
        configurable: true
    });
    Element.prototype.showEffected = function (displayInfo) {
        throw new Error("Method not implemented.");
    };
    Element.prototype.moveMotion = function (x, y) {
        if (this.mRootMount) {
            this.mRootMount.removeMount(this, { x: x, y: y });
        }
        this.mMoveData = { path: [{ pos: new LogicPos(x, y) }] };
        this.moveControll.setIgnoreCollsion(false);
        this.startMove();
    };
    Element.prototype.load = function (displayInfo, isUser) {
        if (isUser === void 0) { isUser = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.mDisplayInfo = displayInfo;
                        this.isUser = isUser;
                        if (!displayInfo)
                            return [2 /*return*/, Promise.reject("element " + this.mModel.nickname + " " + this.id + " display does not exist")];
                        return [4 /*yield*/, this.loadDisplayInfo()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.addToBlock()];
                }
            });
        });
    };
    Element.prototype.setModel = function (model) {
        return __awaiter(this, void 0, void 0, function () {
            var area, obj;
            var _this = this;
            return __generator(this, function (_a) {
                if (!model) {
                    return [2 /*return*/];
                }
                model.off("Animation_Change", this.animationChanged, this);
                model.on("Animation_Change", this.animationChanged, this);
                if (!model.layer) {
                    model.layer = LayerEnum.Surface;
                    Logger.getInstance().warn(Element.name + ": sprite layer is empty");
                }
                this.mModel = model;
                this.mQueueAnimations = undefined;
                if (this.mModel.pos) {
                    this.setPosition(this.mModel.pos);
                }
                this.removeFromMap();
                area = model.getCollisionArea();
                obj = { id: model.id, pos: model.pos, nickname: model.nickname, nodeType: model.nodeType, sound: model.sound, alpha: model.alpha, titleMask: model.titleMask | 0x00020000, hasInteractive: model.hasInteractive };
                this.addToMap();
                // render action
                this.load(this.mModel.displayInfo)
                    .then(function () { return _this.mElementManager.roomService.game.peer.render.setModel(obj); })
                    .then(function () {
                    _this.setDirection(_this.mModel.direction);
                    if (_this.mInputEnable === InputEnable.Interactive) {
                        _this.setInputEnable(_this.mInputEnable);
                    }
                    if (model.mountSprites && model.mountSprites.length > 0) {
                        _this.updateMounth(model.mountSprites);
                    }
                    return _this.setRenderable(true);
                })
                    .catch(function (error) {
                    Logger.getInstance().error(error);
                    _this.mRoomService.elementManager.onDisplayReady(_this.mModel.id);
                });
                return [2 /*return*/];
            });
        });
    };
    Element.prototype.updateModel = function (model, avatarType) {
        if (this.mModel.id !== model.id) {
            return;
        }
        this.removeFromMap();
        if (model.hasOwnProperty("attrs")) {
            this.mModel.updateAttr(model.attrs);
        }
        var reload = false;
        if (avatarType === op_def.AvatarStyle.SuitType) {
            if (this.mModel.updateSuits) {
                this.mModel.updateAvatarSuits(this.mModel.suits);
                if (!this.mModel.avatar)
                    this.mModel.avatar = AvatarSuitType.createBaseAvatar();
                this.mModel.updateAvatar(this.mModel.avatar);
                reload = true;
            }
        }
        else if (avatarType === op_def.AvatarStyle.OriginAvatar) {
            if (model.hasOwnProperty("avatar")) {
                this.mModel.updateAvatar(model.avatar);
                reload = true;
            }
        }
        if (model.display && model.animations) {
            this.mModel.updateDisplay(model.display, model.animations);
            reload = true;
        }
        if (model.hasOwnProperty("currentAnimationName")) {
            this.play(model.currentAnimationName);
            this.setInputEnable(this.mInputEnable);
            this.mModel.setAnimationQueue(undefined);
        }
        if (model.hasOwnProperty("direction")) {
            this.setDirection(model.direction);
        }
        if (model.hasOwnProperty("mountSprites")) {
            var mounts = model.mountSprites;
            this.mergeMounth(mounts);
            this.updateMounth(mounts);
        }
        if (model.hasOwnProperty("speed")) {
            this.mModel.speed = model.speed;
            // 速度改变，重新计算
            if (this.mMoving)
                this.startMove();
        }
        if (model.hasOwnProperty("nickname")) {
            this.mModel.nickname = model.nickname;
            this.showNickname();
        }
        if (reload)
            this.load(this.mModel.displayInfo);
        this.addToMap();
    };
    Element.prototype.play = function (animationName, times) {
        if (!this.mModel) {
            Logger.getInstance().error(Element.name + ": sprite is empty");
            return;
        }
        // const preWalkable = this.mModel.getWalkableArea();
        this.removeFromMap();
        this.mModel.setAnimationName(animationName, times);
        // const nextWalkable = this.mModel.getWalkableArea();
        var hasInteractive = this.model.hasInteractive;
        if (this.mInputEnable)
            this.setInputEnable(this.mInputEnable);
        this.addToMap();
        if (this.mRoomService) {
            if (!this.mRootMount) {
                if (times === undefined) {
                    // this.mRoomService.game.physicalPeer.changeAnimation(this.id, this.mModel.currentAnimation.name);
                }
                else {
                    // this.mRoomService.game.physicalPeer.changeAnimation(this.id, this.mModel.currentAnimation.name, times);
                }
                this.addBody();
            }
            this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation, undefined, times);
            this.mRoomService.game.renderPeer.setHasInteractive(this.id, hasInteractive);
        }
    };
    Element.prototype.setQueue = function (animations) {
        if (!this.mModel) {
            return;
        }
        var queue = [];
        for (var _i = 0, animations_1 = animations; _i < animations_1.length; _i++) {
            var animation = animations_1[_i];
            var aq = {
                name: animation.animationName,
                playTimes: animation.times,
            };
            queue.push(aq);
        }
        this.mModel.setAnimationQueue(queue);
        if (queue.length > 0) {
            this.play(animations[0].animationName, animations[0].times);
        }
    };
    Element.prototype.completeAnimationQueue = function () {
        var anis = this.model.animationQueue;
        if (!anis || anis.length < 1)
            return;
        anis.shift();
        var aniName = PlayerState.IDLE;
        var playTiems;
        if (anis.length > 0) {
            aniName = anis[0].name;
            playTiems = anis[0].playTimes;
        }
        this.play(aniName, playTiems);
    };
    Element.prototype.setDirection = function (val) {
        if (!this.mModel) {
            return;
        }
        if (this.mDisplayInfo) {
            this.mDisplayInfo.avatarDir = val;
        }
        if (this.mModel.direction === val) {
            return;
        }
        if (this.model && !this.model.currentAnimationName) {
            this.model.currentAnimationName = PlayerState.IDLE;
        }
        if (this.model) {
            this.model.setDirection(val);
        }
        if (this.mMounts) {
            for (var _i = 0, _a = this.mMounts; _i < _a.length; _i++) {
                var mount = _a[_i];
                mount.setDirection(val);
            }
        }
        // this.play(this.model.currentAnimationName);
    };
    Element.prototype.getDirection = function () {
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    };
    Element.prototype.changeState = function (val) {
        if (this.mCurState === val)
            return;
        if (!val) {
            val = PlayerState.IDLE;
        }
        this.mCurState = val;
        this.play(this.mCurState);
    };
    Element.prototype.getState = function () {
        return this.mCurState;
    };
    Element.prototype.getRenderable = function () {
        return this.mRenderable;
    };
    Element.prototype.syncPosition = function () {
        var userPos = this.getPosition();
        var pos = op_def.PBPoint3f.create();
        pos.x = userPos.x;
        pos.y = userPos.y;
        var movePoint = op_def.MovePoint.create();
        movePoint.pos = pos;
        // 给每个同步点时间戳
        movePoint.timestamp = Date.now();
        if (!this.mMovePoints)
            this.mMovePoints = [];
        this.mMovePoints.push(movePoint);
    };
    Element.prototype.update = function (time, delta) {
        if (this.mMoving === false)
            return;
        this._doMove(time, delta);
        this.mDirty = false;
        // 如果主角没有在推箱子，直接跳过
        if (!this.mRoomService.playerManager.actor.stopBoxMove)
            return;
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
    /**
     * 发射
     * id 发射对象
     * pos 发射终点
     */
    Element.prototype.fire = function (id, pos) {
        // 没有挂载物
        if (!this.mMounts)
            return;
        var len = this.mMounts.length;
        for (var i = 0; i < len; i++) {
            var mount = this.mMounts[i];
            if (mount && mount.id === id) {
                mount.startFireMove(pos);
                break;
            }
        }
    };
    Element.prototype.startFireMove = function (pos) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mTarget) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.removeMount(this.mTarget)];
                    case 1:
                        _a.sent();
                        this.mRoomService.game.renderPeer.startFireMove(this.mTarget.id, pos);
                        this.mTarget = null;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Element.prototype.move = function (path) {
        if (!this.mElementManager) {
            return;
        }
        this.mMoveData.path = path;
        // this.mRoomService.game.physicalPeer.move(this.id, this.mMoveData.path);
        this.startMove();
    };
    Element.prototype.startMove = function (points) {
        if (points && this.mRoomService.playerManager.actor.stopBoxMove) {
            this._startMove(points);
            return;
        }
        if (!this.mMoveData) {
            return;
        }
        var path = this.mMoveData.path;
        if (!path || path.length < 1) {
            return;
        }
        this.mMoving = true;
        if (!this.moveControll) {
            return;
        }
        var pos = this.moveControll.position;
        var pathData = path[0];
        var pathPos = pathData.pos;
        var angle = Math.atan2(pathPos.y - pos.y, pathPos.x - pos.x);
        var speed = this.mModel.speed * this.delayTime;
        this.moveControll.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        var dir = DirectionChecker.check(pos, pathPos);
        this.setDirection(dir);
        this.changeState(PlayerState.WALK);
    };
    Element.prototype.stopMove = function (stopPos) {
        if (!this.mMovePoints)
            this.mMovePoints = [];
        this.mMoving = false;
        this.moveControll.setVelocity(0, 0);
        this.changeState(PlayerState.IDLE);
        // 如果主角没有在推箱子，直接跳过
        if (!this.mRoomService.playerManager.actor.stopBoxMove)
            return;
        Logger.getInstance().log("============>>>>> element stop: ", this.mModel.nickname, this.mModel.pos.x, this.mModel.pos.y);
        this.mMovePoints = [];
        this.mRoomService.playerManager.actor.stopBoxMove = false;
    };
    Element.prototype.getPosition = function () {
        var pos;
        var p = _super.prototype.getPosition.call(this);
        // if (this.mRootMount) {
        // mount后未更新Position。加上RootMount会偏移
        //     pos = this.mRootMount.getPosition();
        //     pos.x += p.x;
        //     pos.y += p.y;
        //     pos.z += p.z;
        // } else {
        pos = new LogicPos(p.x, p.y, p.z);
        // }
        return pos;
    };
    Element.prototype.setPosition = function (p, syncPos) {
        if (syncPos === void 0) { syncPos = false; }
        if (!this.mElementManager) {
            return;
        }
        if (p) {
            this.mModel.setPosition(p.x, p.y);
            if (this.moveControll)
                this.moveControll.setPosition(this.mModel.pos);
        }
    };
    Element.prototype.getRootPosition = function () {
        return this.mModel.pos;
    };
    Element.prototype.showBubble = function (text, setting) {
        this.mRoomService.game.renderPeer.showBubble(this.id, text, setting);
    };
    Element.prototype.clearBubble = function () {
        this.mRoomService.game.renderPeer.clearBubble(this.id);
    };
    Element.prototype.showNickname = function () {
        if (!this.mModel)
            return;
        this.mRoomService.game.renderPeer.showNickname(this.id, this.mModel.nickname);
    };
    Element.prototype.hideNickname = function () {
        // this.removeFollowObject(FollowEnum.Nickname);
    };
    Element.prototype.showTopDisplay = function (data) {
        this.mTopDisplay = data;
        if (this.mCreatedDisplay)
            this.mRoomService.game.renderPeer.showTopDisplay(this.id, data);
    };
    Element.prototype.removeTopDisplay = function () {
    };
    Element.prototype.showRefernceArea = function (conflictMap) {
        var area = this.mModel.getCollisionArea();
        var origin = this.mModel.getOriginPoint();
        if (!area || !origin)
            return;
        this.mRoomService.game.renderPeer.showRefernceArea(this.id, area, origin, conflictMap);
    };
    Element.prototype.hideRefernceArea = function () {
        this.mRoomService.game.renderPeer.hideRefernceArea(this.id);
    };
    /**
     * 获取元素交互点列表
     */
    Element.prototype.getInteractivePositionList = function () {
        var interactives = this.mModel.getInteractive();
        if (!interactives || interactives.length < 1) {
            return;
        }
        var pos45 = this.mRoomService.transformToMini45(this.getPosition());
        var result = [];
        for (var _i = 0, interactives_1 = interactives; _i < interactives_1.length; _i++) {
            var interactive = interactives_1[_i];
            if (this.mRoomService.isWalkable(pos45.x + interactive.x, pos45.y + interactive.y)) {
                result.push(this.mRoomService.transformToMini90(new LogicPos(pos45.x + interactive.x, pos45.y + interactive.y)));
            }
        }
        return result;
    };
    Object.defineProperty(Element.prototype, "nickname", {
        get: function () {
            return this.mModel.nickname;
        },
        enumerable: true,
        configurable: true
    });
    Element.prototype.turn = function () {
        if (!this.mModel) {
            return;
        }
        this.mModel.turn();
        this.play(this.model.currentAnimationName);
    };
    Element.prototype.setAlpha = function (val) {
        this.roomService.game.renderPeer.changeAlpha(this.id, val);
    };
    Element.prototype.mount = function (root) {
        this.mRootMount = root;
        if (this.mMoving) {
            this.stopMove();
        }
        this.mDirty = true;
        this.removeFromMap();
        this.removeBody();
        return this;
    };
    Element.prototype.unmount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.mRootMount) return [3 /*break*/, 2];
                        pos = this.mRootMount.getPosition();
                        this.mRootMount = null;
                        this.setPosition(pos, true);
                        this.addToMap();
                        this.addBody();
                        return [4 /*yield*/, this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y)];
                    case 1:
                        _a.sent();
                        this.mDirty = true;
                        _a.label = 2;
                    case 2: return [2 /*return*/, this];
                }
            });
        });
    };
    Element.prototype.addMount = function (ele, index) {
        if (!this.mMounts)
            this.mMounts = [];
        ele.mount(this);
        this.mRoomService.game.renderPeer.mount(this.id, ele.id, index);
        if (this.mMounts.indexOf(ele) === -1) {
            this.mMounts.push(ele);
        }
        return this;
    };
    Element.prototype.removeMount = function (ele, targetPos) {
        return __awaiter(this, void 0, void 0, function () {
            var index;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        index = this.mMounts.indexOf(ele);
                        if (index === -1) {
                            return [2 /*return*/, Promise.resolve()];
                        }
                        this.mMounts.splice(index, 1);
                        return [4 /*yield*/, ele.unmount(targetPos)];
                    case 1:
                        _a.sent();
                        if (!this.mMounts)
                            return [2 /*return*/, Promise.resolve()];
                        this.mRoomService.game.renderPeer.unmount(this.id, ele.id, ele.getPosition());
                        return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    Element.prototype.getDepth = function () {
        var depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
        return depth;
    };
    Element.prototype.asociate = function () {
        var model = this.mModel;
        if (model.mountSprites && model.mountSprites.length > 0) {
            this.updateMounth(model.mountSprites);
        }
    };
    Element.prototype.addToMap = function () {
        this.addToWalkableMap();
        this.addToInteractiveMap();
    };
    Element.prototype.removeFromMap = function () {
        this.removeFromWalkableMap();
        this.removeFromInteractiveMap();
    };
    Element.prototype.addToWalkableMap = function () {
        if (this.mRootMount)
            return;
        if (this.model && this.mElementManager)
            this.mElementManager.roomService.addToWalkableMap(this.model);
    };
    Element.prototype.removeFromWalkableMap = function () {
        if (this.model && this.mElementManager)
            this.mElementManager.roomService.removeFromWalkableMap(this.model);
    };
    Element.prototype.addToInteractiveMap = function () {
        // 有叠加物件时，不做添加处理
        if (this.mRootMount)
            return;
        if (this.model && this.mElementManager)
            this.mElementManager.roomService.addToInteractiveMap(this.model);
    };
    Element.prototype.removeFromInteractiveMap = function () {
        if (this.model && this.mElementManager)
            this.mElementManager.roomService.removeFromInteractiveMap(this.model);
    };
    Element.prototype.setState = function (stateGroup) {
        if (!this.mStateManager)
            this.mStateManager = new BaseStateManager(this.mRoomService);
        this.mStateManager.setState(stateGroup);
    };
    Element.prototype.destroy = function () {
        this.mCreatedDisplay = false;
        if (this.mMoveData && this.mMoveData.path) {
            this.mMoveData.path.length = 0;
            this.mMoveData.path = [];
            this.mMoveData = null;
        }
        if (this.mStateManager) {
            this.mStateManager.destroy();
            this.mStateManager = null;
        }
        this.removeDisplay();
        _super.prototype.destroy.call(this);
    };
    Element.prototype._doMove = function (time, delta) {
        this.moveControll.update(time, delta);
        var pos = this.moveControll.position;
        // this.mModel.setPosition(pos.x, pos.y);
        this.mRoomService.game.renderPeer.setPosition(this.id, pos.x, pos.y);
        if (!this.mMoveData)
            return;
        var path = this.mMoveData.path;
        if (!path || !path[0])
            return;
        var pathData = path[0];
        if (!pathData)
            return;
        var pathPos = pathData.pos;
        // 允许1.5误差。delta存在波动避免停不下来
        var speed = this.mModel.speed * delta * 1.5;
        if (Tool.twoPointDistance(pos, pathPos) <= speed) {
            if (path.length > 1) {
                path.shift();
                this.startMove();
            }
            else {
                this.stopMove();
            }
        }
        else {
            this.checkDirection();
        }
    };
    Element.prototype.createDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var createPromise, currentAnimation;
            var _this = this;
            return __generator(this, function (_a) {
                if (this.mCreatedDisplay) {
                    Logger.getInstance().debug("mCreatedDisplay", this.id);
                    return [2 /*return*/];
                }
                _super.prototype.createDisplay.call(this);
                if (!this.mDisplayInfo || !this.mElementManager) {
                    Logger.getInstance().debug("no displayInfo", this);
                    return [2 /*return*/];
                }
                createPromise = null;
                if (this.mDisplayInfo.discriminator === "DragonbonesModel") {
                    if (this.isUser) {
                        createPromise = this.mElementManager.roomService.game.peer.render.createUserDragonBones(this.mDisplayInfo, this.mModel.layer);
                    }
                    else {
                        createPromise = this.mElementManager.roomService.game.peer.render.createDragonBones(this.id, this.mDisplayInfo, this.mModel.layer, this.mModel.nodeType);
                    }
                }
                else {
                    createPromise = this.mElementManager.roomService.game.peer.render.createFramesDisplay(this.id, this.mDisplayInfo, this.mModel.layer);
                }
                this.mElementManager.roomService.game.renderPeer.editorModeDebugger.getIsDebug()
                    .then(function (isDebug) {
                    if (isDebug)
                        _this.showRefernceArea();
                });
                createPromise.then(function () {
                    var pos = _this.mModel.pos;
                    _this.mElementManager.roomService.game.peer.render.setPosition(_this.id, pos.x, pos.y);
                    if (currentAnimation)
                        _this.mElementManager.roomService.game.renderPeer.playAnimation(_this.id, _this.mModel.currentAnimation);
                }).catch(function (error) {
                    Logger.getInstance().error("promise error ====>", error);
                });
                currentAnimation = this.mModel.currentAnimation;
                if (this.mInputEnable)
                    this.setInputEnable(this.mInputEnable);
                if (this.mTopDisplay)
                    this.showTopDisplay(this.mTopDisplay);
                this.addBody();
                this.roomService.game.emitter.emit("ElementCreated", this.id);
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    Element.prototype.loadDisplayInfo = function () {
        this.mRoomService.game.emitter.once("dragonBones_initialized", this.onDisplayReady, this);
        var id = this.mDisplayInfo.id || this.mModel.displayInfo.id;
        var discriminator = this.mDisplayInfo.discriminator || this.mModel.displayInfo.discriminator;
        var eventName = this.mDisplayInfo.eventName || this.mModel.displayInfo.eventName;
        var avatarDir = this.mDisplayInfo.avatarDir || this.mModel.displayInfo.avatarDir;
        var animationName = this.mDisplayInfo.animationName || this.mModel.displayInfo.animationName;
        var sound = this.mDisplayInfo.sound || undefined;
        var obj = {
            discriminator: discriminator,
            id: id,
            eventName: eventName,
            avatarDir: avatarDir,
            animationName: animationName,
            avatar: undefined,
            gene: undefined,
            type: "",
            sound: sound,
            display: null,
            animations: undefined,
        };
        if (discriminator === "DragonbonesModel") {
            obj.avatar = this.mDisplayInfo.avatar || this.mModel.displayInfo.avatar;
        }
        else {
            obj.gene = this.mDisplayInfo.type || this.mModel.displayInfo.gene;
            obj.type = this.mDisplayInfo.type || this.mModel.displayInfo.type;
            obj.display = this.mDisplayInfo.display || this.mModel.displayInfo.avatar;
            obj.animations = this.mDisplayInfo.animations || this.mModel.displayInfo.animations;
        }
        return this.mRoomService.game.renderPeer.updateModel(this.id, obj);
    };
    Element.prototype.onDisplayReady = function () {
        if (this.mModel.mountSprites && this.mModel.mountSprites.length > 0) {
            this.updateMounth(this.mModel.mountSprites);
        }
        var depth = 0;
        if (this.model && this.model.pos) {
            depth = this.model.pos.depth ? this.model.pos.depth : 0;
        }
    };
    Element.prototype.addDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var depth;
            return __generator(this, function (_a) {
                if (this.mCreatedDisplay)
                    return [2 /*return*/];
                _super.prototype.addDisplay.call(this);
                depth = 0;
                if (this.model && this.model.pos) {
                    depth = this.model.pos.depth ? this.model.pos.depth : 0;
                }
                // if (this.mStateManager) {
                //     this.mStateManager.execAllState();
                // }
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    Element.prototype.removeDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                _super.prototype.removeDisplay.call(this);
                return [2 /*return*/, Promise.resolve()];
            });
        });
    };
    Element.prototype.setDepth = function (depth) {
        if (!this.mElementManager)
            return;
        this.mElementManager.roomService.game.peer.render.setLayerDepth(true);
    };
    Object.defineProperty(Element.prototype, "offsetY", {
        get: function () {
            if (this.mOffsetY === undefined) {
                if (!this.mElementManager ||
                    !this.mElementManager.roomService ||
                    !this.mElementManager.roomService.roomSize) {
                    return 0;
                }
                this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Element.prototype.addToBlock = function () {
        if (!this.mDisplayInfo)
            return Promise.resolve();
        return _super.prototype.addToBlock.call(this);
    };
    Element.prototype.checkDirection = function () {
    };
    Element.prototype.calculateDirectionByAngle = function (angle) {
        var direction = -1;
        if (angle > 90) {
            direction = 3;
        }
        else if (angle >= 0) {
            direction = 5;
        }
        else if (angle >= -90) {
            direction = 7;
        }
        else {
            direction = 1;
        }
        return direction;
    };
    Element.prototype.mergeMounth = function (mounts) {
        var oldMounts = this.mModel.mountSprites || [];
        var room = this.mRoomService;
        for (var _i = 0, oldMounts_1 = oldMounts; _i < oldMounts_1.length; _i++) {
            var id = oldMounts_1[_i];
            if (mounts.indexOf(id) === -1) {
                var ele = room.getElement(id);
                if (ele) {
                    this.removeMount(ele, this.mModel.pos);
                }
            }
        }
    };
    Element.prototype.updateMounth = function (mounts) {
        var room = this.mRoomService;
        if (mounts.length > 0) {
            for (var i = 0; i < mounts.length; i++) {
                var ele = room.getElement(mounts[i]);
                if (ele) {
                    this.addMount(ele, i);
                }
            }
        }
        this.mModel.mountSprites = mounts;
    };
    Element.prototype.animationChanged = function (data) {
        this.mElementManager.roomService.game.renderPeer.displayAnimationChange(data);
    };
    Element.prototype.drawBody = function () {
        if (this.mRootMount) {
            this.moveControll.removePolygon();
            return;
        }
        _super.prototype.drawBody.call(this);
    };
    Element.prototype._startMove = function (points) {
        var _points = [];
        points.forEach(function (pos) {
            var movePoint = op_def.MovePoint.create();
            var tmpPos = op_def.PBPoint3f.create();
            tmpPos.x = pos.x;
            tmpPos.y = pos.y;
            movePoint.pos = tmpPos;
            // 给每个同步点时间戳
            movePoint.timestamp = new Date().getTime();
            _points.push(movePoint);
        });
        var movePath = op_def.MovePath.create();
        movePath.id = this.id;
        movePath.movePos = _points;
        var packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MOVE_SPRITE);
        var content = packet.content;
        content.movePath = movePath;
        this.mRoomService.game.connection.send(packet);
    };
    return Element;
}(BlockObject));
export { Element };
//# sourceMappingURL=element.js.map