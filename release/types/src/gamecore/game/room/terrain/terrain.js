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
import { BlockObject } from "../block/block.object";
import { op_def } from "pixelpai_proto";
import { Logger } from "structure";
import { LayerEnum } from "game-capsule";
var Terrain = /** @class */ (function (_super) {
    __extends_1(Terrain, _super);
    function Terrain(sprite, mElementManager) {
        var _this = _super.call(this, sprite.id, mElementManager.roomService) || this;
        _this.mElementManager = mElementManager;
        _this.mCreatedDisplay = false;
        _this.mState = false;
        _this.mId = sprite.id;
        _this.model = sprite;
        return _this;
    }
    Object.defineProperty(Terrain.prototype, "nodeType", {
        get: function () {
            return op_def.NodeType.TerrainNodeType;
        },
        enumerable: true,
        configurable: true
    });
    Terrain.prototype.changeDisplayData = function (texturePath, dataPath) {
        this.mDisplayInfo.display.texturePath = texturePath;
        if (dataPath)
            this.mDisplayInfo.display.dataPath = dataPath;
        this.changeDisplay(this.mDisplayInfo);
    };
    Object.defineProperty(Terrain.prototype, "state", {
        get: function () {
            return this.mState;
        },
        set: function (val) {
            this.mState = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "moveData", {
        get: function () {
            return this.mMoveData;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "moving", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Terrain.prototype.startMove = function () {
    };
    Terrain.prototype.stopMove = function () {
    };
    Terrain.prototype.startFireMove = function (pos) {
    };
    Terrain.prototype.addToMap = function () {
        this.addToWalkableMap();
        this.addToInteractiveMap();
    };
    Terrain.prototype.removeFromMap = function () {
        this.removeFromWalkableMap();
        this.removeFromInteractiveMap();
    };
    Terrain.prototype.addToInteractiveMap = function () {
    };
    Terrain.prototype.removeFromInteractiveMap = function () {
    };
    Terrain.prototype.addToWalkableMap = function () {
        this.addBody();
        if (this.model && this.mElementManager)
            this.mElementManager.roomService.addToWalkableMap(this.model, true);
    };
    Terrain.prototype.removeFromWalkableMap = function () {
        this.removeBody();
        if (this.model && this.mElementManager)
            this.mElementManager.roomService.removeFromWalkableMap(this.model, true);
    };
    Terrain.prototype.setModel = function (val) {
        return __awaiter(this, void 0, void 0, function () {
            var area, obj, obj1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.mModel = val;
                        if (!val) {
                            return [2 /*return*/];
                        }
                        if (!this.mModel.layer) {
                            this.mModel.layer = LayerEnum.Terrain;
                        }
                        area = this.mModel.getCollisionArea();
                        obj = { id: this.mModel.id, pos: this.mModel.pos, nickname: this.mModel.nickname, alpha: this.mModel.alpha, titleMask: this.mModel.titleMask | 0x00020000 };
                        return [4 /*yield*/, this.mElementManager.roomService.game.renderPeer.setModel(obj)];
                    case 1:
                        _a.sent();
                        obj1 = {
                            id: this.mModel.id,
                            point3f: this.mModel.pos,
                            currentAnimationName: this.mModel.currentAnimationName,
                            direction: this.mModel.direction,
                            mountSprites: this.mModel.mountSprites,
                            speed: this.mModel.speed,
                            displayInfo: this.mModel.displayInfo
                        };
                        this.removeFromWalkableMap();
                        this.load(this.mModel.displayInfo);
                        this.setPosition(this.mModel.pos);
                        this.setRenderable(true);
                        this.addToWalkableMap();
                        return [2 /*return*/];
                }
            });
        });
    };
    Terrain.prototype.updateModel = function (val) {
    };
    Terrain.prototype.load = function (displayInfo) {
        this.mCreatedDisplay = false;
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) {
            return;
        }
        this.addDisplay();
    };
    Terrain.prototype.play = function (animationName) {
        if (!this.mModel) {
            Logger.getInstance().error(Terrain.name + ": sprite is empty");
            return;
        }
        if (this.mModel.currentAnimation.name !== animationName) {
            this.removeFromWalkableMap();
            this.mModel.setAnimationName(animationName);
            this.addToWalkableMap();
            this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
        }
    };
    Terrain.prototype.setDirection = function (val) {
        if (this.mDisplayInfo && this.mDisplayInfo.avatarDir)
            this.mDisplayInfo.avatarDir = val;
    };
    Terrain.prototype.getDirection = function () {
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    };
    Terrain.prototype.setPosition = function (p) {
        this.mModel.setPosition(p.x, p.y);
        if (this.moveControll)
            this.moveControll.setPosition(this.mModel.pos);
        this.mRoomService.game.peer.render.setPosition(this.id, p.x, p.y, p.z);
        this.setDepth();
    };
    Terrain.prototype.showNickname = function () {
    };
    Terrain.prototype.hideNickname = function () {
    };
    Terrain.prototype.showRefernceArea = function () {
    };
    Terrain.prototype.hideRefernceArea = function () {
    };
    Terrain.prototype.showEffected = function () {
    };
    Terrain.prototype.turn = function () {
    };
    Terrain.prototype.setAlpha = function (val) {
    };
    Terrain.prototype.scaleTween = function () {
    };
    Terrain.prototype.setQueue = function () {
    };
    Terrain.prototype.completeAnimationQueue = function () {
    };
    Terrain.prototype.update = function () {
    };
    Terrain.prototype.mount = function () {
        return this;
    };
    Terrain.prototype.unmount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this];
            });
        });
    };
    Terrain.prototype.addMount = function () {
        return this;
    };
    Terrain.prototype.removeMount = function () {
        return Promise.resolve();
    };
    Terrain.prototype.getInteractivePositionList = function () {
        return [];
    };
    Terrain.prototype.destroy = function () {
        this.removeDisplay();
        _super.prototype.destroy.call(this);
    };
    Terrain.prototype.createDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var frameModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.mCreatedDisplay)
                            return [2 /*return*/];
                        _super.prototype.createDisplay.call(this);
                        if (!this.mDisplayInfo) {
                            // Logger.getInstance().error("displayinfo does not exist, Create display failed");
                            return [2 /*return*/];
                        }
                        frameModel = Object.assign({}, this.mDisplayInfo);
                        frameModel.animationName = this.mModel.currentAnimation.name;
                        return [4 /*yield*/, this.mRoomService.game.peer.render.createTerrainDisplay(this.id, frameModel, this.mModel.layer)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.addToBlock()];
                }
            });
        });
    };
    Terrain.prototype.addDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pos;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.addDisplay.call(this)];
                    case 1:
                        _a.sent();
                        pos = this.mModel.pos;
                        return [2 /*return*/, this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z)];
                }
            });
        });
    };
    Terrain.prototype.setDepth = function () {
        // if (this.mDisplay) {
        //     this.mDisplay.setDepth(this.mDisplay.y);
        //     if (!this.roomService) {
        //         throw new Error("roomService is undefined");
        //     }
        //     const layerManager = this.roomService.layerManager;
        //     if (!layerManager) {
        //         throw new Error("layerManager is undefined");
        //     }
        //     layerManager.depthGroundDirty = true;
        // }
    };
    Terrain.prototype.setPosition45 = function (pos) {
        if (!this.roomService) {
            Logger.getInstance().error("roomService does not exist");
            return;
        }
        var point = this.roomService.transformTo90(pos);
        this.setPosition(point);
    };
    Object.defineProperty(Terrain.prototype, "id", {
        get: function () {
            return this.mId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "dir", {
        get: function () {
            return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "roomService", {
        get: function () {
            if (!this.mElementManager) {
                Logger.getInstance().error("element manager is undefined");
                return;
            }
            return this.mElementManager.roomService;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "model", {
        get: function () {
            return this.mModel;
        },
        set: function (val) {
            this.setModel(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "currentAnimationName", {
        get: function () {
            if (this.mModel) {
                return this.mModel.currentAnimationName;
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Terrain.prototype, "created", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return Terrain;
}(BlockObject));
export { Terrain };
//# sourceMappingURL=terrain.js.map