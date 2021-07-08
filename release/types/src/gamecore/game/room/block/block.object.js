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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { InputEnable } from "../element/input.enable";
import { LogicPos, Position45 } from "structure";
import { op_def } from "pixelpai_proto";
import { MoveControll } from "../../collsion";
var BlockObject = /** @class */ (function () {
    function BlockObject(id, mRoomService) {
        this.mRoomService = mRoomService;
        this.isUsed = false;
        this.mRenderable = false;
        this.mBlockable = false;
        this.isUsed = true;
        if (id && this.mRoomService)
            this.moveControll = new MoveControll(id, this.mRoomService);
    }
    BlockObject.prototype.setRenderable = function (isRenderable, delay) {
        if (delay === void 0) { delay = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.mRenderable !== isRenderable)) return [3 /*break*/, 3];
                        this.mRenderable = isRenderable;
                        if (!isRenderable) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.addDisplay()];
                    case 1:
                        _a.sent();
                        if (delay > 0) {
                            return [2 /*return*/, this.fadeIn()];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        if (delay > 0) {
                            this.fadeOut(function () {
                                return _this.removeDisplay();
                            });
                        }
                        else {
                            return [2 /*return*/, this.removeDisplay()];
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BlockObject.prototype.getPosition = function () {
        var pos = this.mModel && this.mModel.pos ? this.mModel.pos : new LogicPos();
        return pos;
    };
    BlockObject.prototype.getPosition45 = function () {
        var pos = this.getPosition();
        if (!pos)
            return new LogicPos();
        return this.mRoomService.transformToMini45(pos);
    };
    BlockObject.prototype.getRenderable = function () {
        return this.mRenderable;
    };
    BlockObject.prototype.fadeIn = function (callback) {
        return this.mRoomService.game.peer.render.fadeIn(this.id, this.type);
    };
    BlockObject.prototype.fadeOut = function (callback) {
        return this.mRoomService.game.peer.render.fadeOut(this.id, this.type);
    };
    BlockObject.prototype.fadeAlpha = function (alpha) {
        this.mRoomService.game.peer.render.fadeAlpha(this.id, this.type, alpha);
    };
    BlockObject.prototype.setInputEnable = function (val) {
        // if (this.mInputEnable !== val) {
        this.mInputEnable = val;
        if (!this.mRoomService)
            return;
        switch (val) {
            case InputEnable.Interactive:
                if (this.mModel && (this.mModel.hasInteractive || this.mModel.nodeType === op_def.NodeType.ElementNodeType)) {
                    this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
                }
                else {
                    this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
                }
                break;
            case InputEnable.Enable:
                this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
                break;
            default:
                this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
                break;
        }
        // }
    };
    BlockObject.prototype.setBlockable = function (val) {
        if (this.mBlockable !== val) {
            this.mBlockable = val;
            if (this.mRoomService) {
                if (val) {
                    // Logger.getInstance().debug("block addBlockObject");
                    this.mRoomService.addBlockObject(this);
                }
                else {
                    // Logger.getInstance().debug("block removeBlockObject");
                    this.mRoomService.removeBlockObject(this);
                }
            }
        }
        return this;
    };
    BlockObject.prototype.destroy = function () {
        // this.mRoomService.game.peer.render.displayDestroy(this.id, this.type);
        if (this.moveControll)
            this.moveControll.removePolygon();
    };
    BlockObject.prototype.moveBasePos = function () {
        return this.moveControll ? this.moveControll.position : undefined;
    };
    BlockObject.prototype.clear = function () {
        this.isUsed = false;
    };
    BlockObject.prototype.disableBlock = function () {
        this.removeFromBlock();
        this.mBlockable = false;
        this.mRenderable = false;
    };
    BlockObject.prototype.enableBlock = function () {
        this.mBlockable = true;
        this.addToBlock();
    };
    BlockObject.prototype.getProjectionSize = function () {
        var miniSize = this.mRoomService.miniSize;
        var collision = this.mModel.getCollisionArea();
        var origin = this.mModel.getOriginPoint();
        if (!collision)
            return;
        var rows = collision.length;
        var cols = collision[0].length;
        var width = cols;
        var height = rows;
        var offset = this.mRoomService.transformToMini90(new LogicPos(origin.x, origin.y));
        return { offset: offset, width: width, height: height };
    };
    BlockObject.prototype.load = function (displayInfo) {
        this.addDisplay();
    };
    BlockObject.prototype.addDisplay = function () {
        if (this.mCreatedDisplay)
            return;
        return this.createDisplay();
    };
    BlockObject.prototype.createDisplay = function () {
        this.mCreatedDisplay = true;
        return Promise.resolve();
    };
    BlockObject.prototype.removeDisplay = function () {
        // Logger.getInstance().debug("removeDisplay ====>", this);
        this.mCreatedDisplay = false;
        if (!this.mRoomService)
            return;
        // this.removeBody();
        return this.mRoomService.game.peer.render.removeBlockObject(this.id);
    };
    BlockObject.prototype.changeDisplay = function (displayInfo) {
        this.mCreatedDisplay = false;
        this.load(displayInfo);
    };
    BlockObject.prototype.addToBlock = function () {
        if (this.mBlockable) {
            return this.mRoomService.addBlockObject(this).then(function (resolve) {
                return Promise.resolve();
            });
        }
        else {
            this.addDisplay();
            return Promise.resolve();
        }
    };
    BlockObject.prototype.removeFromBlock = function (remove) {
        if (this.mBlockable) {
            this.mRoomService.removeBlockObject(this);
            if (remove) {
                this.setRenderable(false);
            }
        }
    };
    BlockObject.prototype.updateBlock = function () {
        if (this.mBlockable) {
            this.mRoomService.updateBlockObject(this);
        }
    };
    BlockObject.prototype.addBody = function () {
        this.drawBody();
    };
    BlockObject.prototype.removeBody = function () {
        if (!this.moveControll)
            return;
        this.moveControll.removePolygon();
    };
    BlockObject.prototype.drawBody = function () {
        if (!this.moveControll)
            return;
        if (!this.mModel)
            return;
        // super.addBody();
        var collision = this.mModel.getCollisionArea();
        if (!collision) {
            // body = Bodies.circle(this._tempVec.x * this._scale, this._tempVec.y * this._scale, 10);
            return;
        }
        var collisionArea = __spreadArrays(collision);
        var walkableArea = this.mModel.getWalkableArea();
        if (!walkableArea) {
            walkableArea = [];
        }
        var cols = collisionArea.length;
        var rows = collisionArea[0].length;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                if (walkableArea[i] && walkableArea[i][j] === 1) {
                    collisionArea[i][j] = 0;
                }
            }
        }
        var walkable = function (val) { return val === 0; };
        var resule = collisionArea.some(function (val) { return val.some(walkable); });
        var paths = [];
        var miniSize = this.mRoomService.miniSize;
        if (resule) {
            paths = this.calcBodyPath(collisionArea, miniSize);
        }
        else {
            paths = [Position45.transformTo90(new LogicPos(0, 0), miniSize), Position45.transformTo90(new LogicPos(rows, 0), miniSize), Position45.transformTo90(new LogicPos(rows, cols), miniSize), Position45.transformTo90(new LogicPos(0, cols), miniSize)];
        }
        if (paths.length < 1) {
            this.removeBody();
            return;
        }
        var origin = Position45.transformTo90(this.mModel.getOriginPoint(), miniSize);
        this.moveControll.drawPolygon(paths, { x: -origin.x, y: -origin.y });
    };
    BlockObject.prototype.updateBody = function (model) {
        // if (this.mRootMount) {
        //     return;
        // }
        // super.updateBody(model);
    };
    BlockObject.prototype.calcBodyPath = function (collisionArea, miniSize) {
        var _this = this;
        var allpoints = this.prepareVertices(collisionArea).reduce(function (acc, p) { return acc.concat(_this.transformBodyPath(p[1], p[0], miniSize)); }, []);
        var convexHull = require("monotone-convex-hull-2d");
        var resultIndices = convexHull(allpoints);
        return resultIndices.map(function (i) { return ({ x: allpoints[i][0], y: allpoints[i][1] }); });
    };
    BlockObject.prototype.prepareVertices = function (collisionArea) {
        var allpoints = [];
        for (var i = 0; i < collisionArea.length; i++) {
            var leftMost = void 0, rightMost = void 0;
            for (var j = 0; j < collisionArea[i].length; j++) {
                if (collisionArea[i][j] === 1) {
                    if (!leftMost) {
                        leftMost = [i, j];
                        allpoints.push(leftMost);
                    }
                    else {
                        rightMost = [i, j];
                    }
                }
            }
            if (rightMost) {
                allpoints.push(rightMost);
            }
        }
        return allpoints;
    };
    BlockObject.prototype.transformBodyPath = function (x, y, miniSize) {
        var pos = Position45.transformTo90(new LogicPos(x, y), miniSize);
        var result = [[pos.x, -miniSize.tileHeight * 0.5 + pos.y], [pos.x + miniSize.tileWidth * 0.5, pos.y], [pos.x, pos.y + miniSize.tileHeight * 0.5], [pos.x - miniSize.tileWidth * 0.5, pos.y]];
        return result;
    };
    Object.defineProperty(BlockObject.prototype, "id", {
        get: function () {
            return -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BlockObject.prototype, "type", {
        get: function () {
            return -1;
        },
        enumerable: true,
        configurable: true
    });
    return BlockObject;
}());
export { BlockObject };
//# sourceMappingURL=block.object.js.map