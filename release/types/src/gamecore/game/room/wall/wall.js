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
import { Logger, LogicPos } from "structure";
var Wall = /** @class */ (function (_super) {
    __extends_1(Wall, _super);
    function Wall(sprite, roomService) {
        var _this = _super.call(this, sprite.id, roomService) || this;
        _this.mId = sprite.id;
        _this.setModel(sprite);
        return _this;
    }
    Wall.prototype.startMove = function () { };
    Wall.prototype.stopMove = function () { };
    Wall.prototype.setModel = function (val) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.mModel = val;
                        if (!val) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.mRoomService.game.peer.render.setModel(val)];
                    case 1:
                        _a.sent();
                        this.load(this.mModel.displayInfo);
                        // this.mDisplayInfo = <IFramesModel> this.mModel.displayInfo;
                        // this.createDisplay();
                        this.setPosition(this.mModel.pos);
                        this.setRenderable(true);
                        return [2 /*return*/];
                }
            });
        });
    };
    Wall.prototype.updateModel = function (val) {
    };
    Wall.prototype.load = function (displayInfo) {
        this.mCreatedDisplay = false;
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) {
            return;
        }
        this.addDisplay();
        // if (!this.mDisplay) {
        //     this.createDisplay();
        // }
        // this.mDisplayInfo = displayInfo;
        // this.mDisplay.once("initialized", this.onInitializedHandler, this);
        // this.mDisplay.load(this.mDisplayInfo);
    };
    Wall.prototype.play = function (animationName) {
        if (!this.mModel) {
            Logger.getInstance().error(Wall.name + ": sprite is empty");
            return;
        }
        if (this.mModel.currentAnimationName !== animationName) {
            // this.mAnimationName = animationName;
            this.mModel.currentAnimationName = animationName;
            this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
            // if (this.mDisplay) {
            //     this.mDisplay.play(this.model.currentAnimation);
            // }
        }
    };
    Wall.prototype.setDirection = function (val) {
        // if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    };
    Wall.prototype.getDirection = function () {
        return 3;
        // return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    };
    Wall.prototype.setPosition = function (p) {
        var pos = this.mRoomService.transformTo90(new LogicPos(p.x, p.y, p.z));
        this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
        // if (this.mDisplay) {
        //     this.mDisplay.setPosition(p.x, p.y, p.z);
        // }
        this.setDepth();
    };
    // public getDisplay(): BaseDisplay {
    //     return this.mDisplay;
    // }
    Wall.prototype.showNickname = function () { };
    Wall.prototype.hideNickname = function () { };
    Wall.prototype.showRefernceArea = function () { };
    Wall.prototype.hideRefernceArea = function () { };
    Wall.prototype.showEffected = function () { };
    Wall.prototype.turn = function () { };
    Wall.prototype.setAlpha = function (val) { };
    Wall.prototype.scaleTween = function () { };
    Wall.prototype.setQueue = function () { };
    Wall.prototype.completeAnimationQueue = function () { };
    Wall.prototype.update = function () { };
    Wall.prototype.mount = function () {
        return this;
    };
    Wall.prototype.unmount = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this];
            });
        });
    };
    Wall.prototype.addMount = function () {
        return this;
    };
    Wall.prototype.removeMount = function () {
        return Promise.resolve();
    };
    Wall.prototype.getInteractivePositionList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, []];
            });
        });
    };
    Wall.prototype.destroy = function () {
        this.removeDisplay();
        // this.mElementManager.removeFromMap(this.mModel);
        _super.prototype.destroy.call(this);
    };
    Wall.prototype.createDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var currentAnimation;
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
                        return [4 /*yield*/, this.mRoomService.game.peer.render.createTerrainDisplay(this.id, this.mDisplayInfo, this.mModel.layer)];
                    case 1:
                        _a.sent();
                        currentAnimation = this.mModel.currentAnimation;
                        if (!currentAnimation) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: 
                    // const scene = this.mElementManager.scene;
                    // if (scene) {
                    //     this.mDisplay = new TerrainDisplay(scene, this.mElementManager.roomService, this);
                    //     this.setPosition45(this.model.pos);
                    //     this.addToBlock();
                    //     // this.mDisplay.load(this.mDisplayInfo);
                    // }
                    return [2 /*return*/, this.addToBlock()];
                }
            });
        });
    };
    Wall.prototype.addDisplay = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pos;
            return __generator(this, function (_a) {
                _super.prototype.addDisplay.call(this);
                pos = this.mModel.pos;
                return [2 /*return*/, this.setPosition(pos)];
            });
        });
    };
    Wall.prototype.removeDisplay = function () {
        this.mCreatedDisplay = false;
        return this.mRoomService.game.peer.render.removeBlockObject(this.id);
    };
    Wall.prototype.setDepth = function () {
    };
    Object.defineProperty(Wall.prototype, "id", {
        get: function () {
            return this.mId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wall.prototype, "dir", {
        get: function () {
            return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wall.prototype, "model", {
        get: function () {
            return this.mModel;
        },
        set: function (val) {
            this.setModel(val);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wall.prototype, "currentAnimationName", {
        get: function () {
            if (this.mModel) {
                return this.mModel.currentAnimationName;
            }
            return "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Wall.prototype, "created", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return Wall;
}(BlockObject));
export { Wall };
//# sourceMappingURL=wall.js.map