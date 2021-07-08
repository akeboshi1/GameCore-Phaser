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
import { LogicPos, Position45 } from "structure";
import { BasicScene } from "baseRender";
var PointsShowType;
(function (PointsShowType) {
    PointsShowType[PointsShowType["None"] = 0] = "None";
    PointsShowType[PointsShowType["All"] = 1] = "All";
    PointsShowType[PointsShowType["OnlyWalkable"] = 2] = "OnlyWalkable";
    PointsShowType[PointsShowType["OnlyNotWalkable"] = 3] = "OnlyNotWalkable"; // 只显示不可行走区域（红点）
})(PointsShowType || (PointsShowType = {}));
var AstarDebugger = /** @class */ (function () {
    function AstarDebugger(render) {
        this.render = render;
        this.isDebug = false;
        this.CIRCLE_RADIUS_POINTS = 2;
        this.CIRCLE_RADIUS_START_POSITION = 4;
        this.CIRCLE_RADIUS_TARGET_POSITION = 4;
        this.CIRCLE_COLOR_POINTS_PASS = 0x00FF00;
        this.CIRCLE_COLOR_POINTS_NOTPASS = 0xFF0000;
        this.CIRCLE_COLOR_START_POSITION = 0xFFFF00;
        this.CIRCLE_COLOR_TARGET_POSITION = 0xFFFF00;
        this.LINE_COLOR_PATH = 0xFFFF00;
        // 是否显示所有可行经点。如果打开会非常消耗性能
        this.mPointsShowType = PointsShowType.None;
        this.mPoints_Walkable = null;
        this.mPoints_NotWalkable = null;
        this.mPath = null;
    }
    AstarDebugger.prototype.q = function () {
        this.isDebug = false;
        this.clearAll();
    };
    AstarDebugger.prototype.v = function () {
        if (!this.isDebug) {
            this.drawPoints();
        }
        this.isDebug = true;
    };
    AstarDebugger.prototype.destroy = function () {
        this.clearAll();
        if (this.mAstarSize)
            this.mAstarSize = null;
    };
    AstarDebugger.prototype.init = function (map, size) {
        this.mAstarSize = size;
        if (this.isDebug) {
            this.drawPoints();
        }
        else {
            this.clearAll();
        }
    };
    AstarDebugger.prototype.update = function (x, y, val) {
        if (!this.mAstarSize)
            return;
        if (this.isDebug) {
            this.drawPoints();
        }
        else {
            this.clearAll();
        }
    };
    AstarDebugger.prototype.showPath = function (start, tar, path) {
        if (!this.mAstarSize)
            return;
        if (this.isDebug) {
            this.drawPath(start, tar, path);
        }
        else {
            this.clearPath();
        }
    };
    AstarDebugger.prototype.drawPoints = function () {
        return __awaiter(this, void 0, void 0, function () {
            var scene, walkablePoses, notWalkablePoses, y, x, walkable, pos, _i, walkablePoses_1, pos, _a, notWalkablePoses_1, pos;
            return __generator(this, function (_b) {
                if (this.mPointsShowType === PointsShowType.None)
                    return [2 /*return*/];
                if (!this.mAstarSize)
                    return [2 /*return*/];
                scene = this.render.sceneManager.getMainScene();
                if (!scene || !(scene instanceof BasicScene)) {
                    return [2 /*return*/];
                }
                this.clearAll();
                walkablePoses = [];
                notWalkablePoses = [];
                for (y = 0; y < this.mAstarSize.rows; y++) {
                    for (x = 0; x < this.mAstarSize.cols; x++) {
                        // todo 删除物理进程
                        throw new Error("删除物理进程");
                        walkable = true;
                        if (this.mPointsShowType === PointsShowType.OnlyWalkable && !walkable)
                            continue;
                        if (this.mPointsShowType === PointsShowType.OnlyNotWalkable && walkable)
                            continue;
                        pos = new LogicPos(x, y);
                        pos = Position45.transformTo90(pos, this.mAstarSize);
                        pos.y += this.mAstarSize.tileHeight / 2;
                        if (walkable) {
                            walkablePoses.push(pos);
                        }
                        else {
                            notWalkablePoses.push(pos);
                        }
                    }
                }
                if (walkablePoses.length > 0) {
                    this.mPoints_Walkable = scene.make.graphics(undefined, false);
                    this.mPoints_Walkable.clear();
                    this.mPoints_Walkable.fillStyle(this.CIRCLE_COLOR_POINTS_PASS, 1);
                    for (_i = 0, walkablePoses_1 = walkablePoses; _i < walkablePoses_1.length; _i++) {
                        pos = walkablePoses_1[_i];
                        this.mPoints_Walkable.fillCircle(pos.x, pos.y, this.CIRCLE_RADIUS_POINTS);
                    }
                    scene.layerManager.addToLayer("middleLayer", this.mPoints_Walkable);
                }
                if (notWalkablePoses.length > 0) {
                    this.mPoints_NotWalkable = scene.make.graphics(undefined, false);
                    this.mPoints_NotWalkable.clear();
                    this.mPoints_NotWalkable.fillStyle(this.CIRCLE_COLOR_POINTS_NOTPASS, 1);
                    for (_a = 0, notWalkablePoses_1 = notWalkablePoses; _a < notWalkablePoses_1.length; _a++) {
                        pos = notWalkablePoses_1[_a];
                        this.mPoints_NotWalkable.fillCircle(pos.x, pos.y, this.CIRCLE_RADIUS_POINTS);
                    }
                    scene.layerManager.addToLayer("middleLayer", this.mPoints_NotWalkable);
                }
                return [2 /*return*/];
            });
        });
    };
    AstarDebugger.prototype.clearAll = function () {
        if (this.mPoints_Walkable) {
            this.mPoints_Walkable.destroy();
            this.mPoints_Walkable = null;
        }
        if (this.mPoints_NotWalkable) {
            this.mPoints_NotWalkable.destroy();
            this.mPoints_NotWalkable = null;
        }
        this.clearPath();
    };
    AstarDebugger.prototype.clearPath = function () {
        if (this.mPath) {
            this.mPath.destroy();
            this.mPath = null;
        }
    };
    AstarDebugger.prototype.drawPath = function (start, tar, path) {
        if (!this.mAstarSize)
            return;
        var scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof BasicScene)) {
            return;
        }
        // this.clearPath();
        if (!this.mPath) {
            this.mPath = scene.make.graphics(undefined, false);
        }
        this.mPath.clear();
        this.mPath.fillStyle(this.CIRCLE_COLOR_START_POSITION, 1);
        this.mPath.fillCircle(start.x, start.y, this.CIRCLE_RADIUS_START_POSITION);
        this.mPath.fillStyle(this.CIRCLE_COLOR_TARGET_POSITION, 1);
        this.mPath.fillCircle(tar.x, tar.y, this.CIRCLE_RADIUS_TARGET_POSITION);
        if (path.length > 1) {
            this.mPath.lineStyle(1, this.LINE_COLOR_PATH);
            this.mPath.beginPath();
            for (var i = 0; i < path.length - 1; i++) {
                var iPo = path[i];
                var point = new LogicPos(iPo.x, iPo.y);
                this.mPath.moveTo(point.x, point.y);
                iPo = path[i + 1];
                point = new LogicPos(iPo.x, iPo.y);
                this.mPath.lineTo(point.x, point.y);
            }
            this.mPath.closePath();
            this.mPath.strokePath();
        }
        scene.layerManager.addToLayer("middleLayer", this.mPath);
    };
    return AstarDebugger;
}());
export { AstarDebugger };
//# sourceMappingURL=astar.js.map