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
import { op_def } from "pixelpai_proto";
import { PlayerState, DirectionChecker } from "structure";
import { Element } from "../element/element";
import { LayerEnum } from "game-capsule";
import { InputEnable } from "../element/input.enable";
var Player = /** @class */ (function (_super) {
    __extends_1(Player, _super);
    function Player(sprite, mElementManager) {
        var _this = _super.call(this, sprite, mElementManager) || this;
        _this.mOffsetY = undefined;
        _this.setInputEnable(InputEnable.Enable);
        return _this;
    }
    Object.defineProperty(Player.prototype, "nodeType", {
        get: function () {
            return op_def.NodeType.CharacterNodeType;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.setModel = function (model) {
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
                }
                this.removeFromWalkableMap();
                this.mModel = model;
                this.mQueueAnimations = undefined;
                if (this.mModel.pos) {
                    this.setPosition(this.mModel.pos);
                }
                area = model.getCollisionArea();
                obj = {
                    id: model.id,
                    pos: model.pos,
                    alpha: model.alpha,
                    nickname: model.nickname,
                    titleMask: model.titleMask | 0x00010000,
                    hasInteractive: true
                };
                // render action
                this.load(this.mModel.displayInfo)
                    .then(function () { return _this.mElementManager.roomService.game.renderPeer.setPlayerModel(obj); })
                    .then(function () {
                    _this.setDirection(_this.mModel.direction);
                    if (_this.mInputEnable === InputEnable.Interactive) {
                        _this.setInputEnable(_this.mInputEnable);
                    }
                    if (model.mountSprites && model.mountSprites.length > 0) {
                        _this.updateMounth(model.mountSprites);
                    }
                    _this.addToWalkableMap();
                    return _this.setRenderable(true);
                });
                return [2 /*return*/];
            });
        });
    };
    Player.prototype.load = function (displayInfo, isUser) {
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
    Player.prototype.changeState = function (val, times) {
        if (this.mCurState === val)
            return;
        if (!val) {
            val = PlayerState.IDLE;
        }
        if (this.mCheckStateHandle(val)) {
            this.mCurState = val;
            this.mModel.setAnimationName(this.mCurState, times);
            var id = this.mModel.id;
            this.mElementManager.roomService.game.renderPeer.playAnimation(id, this.mModel.currentAnimation, undefined, times);
        }
    };
    Player.prototype.stopMove = function (points) {
        this.mMoving = false;
        this.moveControll.setVelocity(0, 0);
        this.changeState(PlayerState.IDLE);
    };
    Player.prototype.completeMove = function () {
    };
    Player.prototype.setWeapon = function (weaponid) {
        if (!this.mModel || !this.mModel.avatar)
            return;
        var avatar = { barmWeapId: { sn: weaponid, slot: "NDE5NDMwNA==", suit_type: "weapon" } };
        this.model.setTempAvatar(avatar);
        this.load(this.mModel.displayInfo);
    };
    Player.prototype.removeWeapon = function () {
        if (!this.mModel)
            return;
        if (this.mModel.suits) {
            this.mModel.updateAvatarSuits(this.mModel.suits);
            this.model.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        }
        else if (this.mModel.avatar) {
            this.model.updateAvatar(this.mModel.avatar);
            this.load(this.mModel.displayInfo);
        }
    };
    // Player 和 User不需要参与碰撞
    Player.prototype.addToWalkableMap = function () {
    };
    Player.prototype.removeFromWalkableMap = function () {
    };
    Player.prototype.calcDirection = function (pos, target) {
        var dir = DirectionChecker.check(pos, target);
        this.setDirection(dir);
    };
    Player.prototype.checkDirection = function () {
        var pos = this.moveControll.position;
        var prePos = this.moveControll.prePosition;
        var dir = DirectionChecker.check(prePos, pos);
        this.setDirection(dir);
    };
    Object.defineProperty(Player.prototype, "offsetY", {
        get: function () {
            if (this.mOffsetY === undefined) {
                if (!this.mElementManager || !this.mElementManager.roomService || !this.mElementManager.roomService.roomSize) {
                    return 0;
                }
                this.mOffsetY = this.mElementManager.roomService.roomSize.tileHeight >> 2;
            }
            return this.mOffsetY;
        },
        enumerable: true,
        configurable: true
    });
    Player.prototype.addBody = function () {
    };
    Player.prototype.drawBody = function () {
        _super.prototype.drawBody.call(this);
        var size = this.mRoomService.miniSize;
        this.moveControll.setBodiesOffset({ x: 0, y: -size.tileHeight * 0.5 });
    };
    Player.prototype.mCheckStateHandle = function (val) {
        return true;
    };
    return Player;
}(Element));
export { Player };
//# sourceMappingURL=player.js.map