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
import { NodeType } from "../managers";
import { MainUIScene } from "../scenes/main.ui.scene";
import { SceneName, LogicPos } from "structure";
var MotionManager = /** @class */ (function () {
    // private curDirection: number = 0;
    function MotionManager(render) {
        this.render = render;
        this.isHolding = false;
        this.holdDelay = 200;
        this.isRunning = true;
        this.scaleRatio = render.scaleRatio;
    }
    MotionManager.prototype.addListener = function () {
        if (!this.scene) {
            return;
        }
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
        this.scene.input.on("gameobjectup", this.onGameObjectUpHandler, this);
        if (this.uiScene)
            this.uiScene.input.on("gameobjectdown", this.onUiGameObjectDownHandler, this);
    };
    MotionManager.prototype.removeListener = function () {
        if (!this.scene) {
            return;
        }
        this.scene.input.off("pointerup", this.onPointerUpHandler, this);
        this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
        this.scene.input.off("gameobjectup", this.onGameObjectUpHandler, this);
        if (this.uiScene)
            this.uiScene.input.off("gameobjectdown", this.onUiGameObjectDownHandler, this);
    };
    MotionManager.prototype.resize = function (width, height) {
        this.scaleRatio = this.render.scaleRatio;
    };
    MotionManager.prototype.update = function (time, delta) {
        if (!this.isRunning)
            return;
        if (this.isHolding === false)
            return;
        this.curtime += delta;
        if (this.curtime < 200) {
            return;
        }
        this.curtime = 0;
        var pointer = this.scene.input.activePointer;
        if (pointer.camera) {
            if (pointer.camera.scene && pointer.camera.scene.sys.settings.key === MainUIScene.name) {
                this.isHolding = false;
                this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
                this.clearGameObject();
                return;
            }
        }
        if (!pointer || !this.render.displayManager || !this.render.displayManager.user || !this.render.displayManager.user.visible)
            return;
        var position = this.getPreUserPos(pointer);
        this.start(position.x / this.scaleRatio, position.y / this.scaleRatio);
    };
    MotionManager.prototype.setScene = function (scene) {
        this.removeListener();
        this.scene = scene;
        if (!this.scene) {
            return;
        }
        this.uiScene = this.render.game.scene.getScene(SceneName.MAINUI_SCENE);
        this.addListener();
    };
    MotionManager.prototype.pauser = function () {
        this.isRunning = false;
        this.isHolding = false;
        this.clearGameObject();
    };
    MotionManager.prototype.resume = function () {
        this.isRunning = true;
    };
    MotionManager.prototype.destroy = function () {
        this.removeListener();
    };
    MotionManager.prototype.onGuideOnPointUpHandler = function (pointer, id) {
        return __awaiter(this, void 0, void 0, function () {
            var ele, targets, x, y;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
                        if (!id) return [3 /*break*/, 3];
                        if (!id) return [3 /*break*/, 2];
                        ele = this.render.displayManager.getDisplay(id);
                        if (ele.nodeType === NodeType.CharacterNodeType) {
                            // TODO
                            this.render.mainPeer.activePlayer(id);
                            this.clearGameObject();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.render.mainPeer.getInteractivePosition(id)];
                    case 1:
                        targets = _a.sent();
                        if (!targets || targets.length === 0) {
                            x = ele.x, y = ele.y;
                            targets = [{ x: x, y: y }];
                        }
                        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
                        _a.label = 4;
                    case 4:
                        this.clearGameObject();
                        return [2 /*return*/];
                }
            });
        });
    };
    MotionManager.prototype.onPointerDownHandler = function (pointer) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (!this.isRunning)
                    return [2 /*return*/];
                if (!this.render.guideManager || this.render.guideManager.canInteractive())
                    return [2 /*return*/];
                this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
                this.holdTime = setTimeout(function () {
                    _this.isHolding = true;
                }, this.holdDelay);
                return [2 /*return*/];
            });
        });
    };
    MotionManager.prototype.onPointerUpHandler = function (pointer) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isRunning)
                            return [2 /*return*/];
                        this.isHolding = false;
                        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
                        if (!this.render.guideManager || this.render.guideManager.canInteractive())
                            return [2 /*return*/];
                        if (!(Math.abs(pointer.downX - pointer.upX) >= 5 * this.render.scaleRatio && Math.abs(pointer.downY - pointer.upY) >= 5 * this.render.scaleRatio || pointer.upTime - pointer.downTime > this.holdDelay)) return [3 /*break*/, 1];
                        this.stop();
                        return [3 /*break*/, 5];
                    case 1:
                        if (!this.gameObject) return [3 /*break*/, 4];
                        id = this.gameObject.getData("id");
                        if (!id) return [3 /*break*/, 3];
                        if (!this.render.guideManager || this.render.guideManager.canInteractive(id))
                            return [2 /*return*/];
                        return [4 /*yield*/, this.getEleMovePath(id, pointer)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        // if (this.render.guideManager.canInteractive()) {
                        //     const curGuide = this.render.guideManager.curGuide;
                        //     Logger.getInstance().log("pointerup ====>", curGuide);
                        //     const id = (<BasePlaySceneGuide>curGuide).data;
                        //     await this.getEleMovePath(id, pointer);
                        // } else {
                        // }
                        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
                        _a.label = 5;
                    case 5:
                        this.clearGameObject();
                        return [2 /*return*/];
                }
            });
        });
    };
    MotionManager.prototype.getEleMovePath = function (id, pointer) {
        return __awaiter(this, void 0, void 0, function () {
            var ele, targets, x, y;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ele = this.render.displayManager.getDisplay(id);
                        if (!ele || !ele.hasInteractive) { // 无交互数据的家具走点击地面逻辑
                            this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
                            return [2 /*return*/];
                        }
                        if (ele.nodeType === NodeType.CharacterNodeType) {
                            // TODO
                            this.render.mainPeer.activePlayer(id);
                            this.clearGameObject();
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.render.mainPeer.getInteractivePosition(this.getMountId(id))];
                    case 1:
                        targets = _a.sent();
                        if (!targets || targets.length === 0) {
                            x = ele.x, y = ele.y;
                            targets = [{ x: x, y: y }];
                        }
                        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
                        return [2 /*return*/];
                }
            });
        });
    };
    MotionManager.prototype.onPointerMoveHandler = function (pointer) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.isRunning)
                    return [2 /*return*/];
                this.isHolding = true;
                return [2 /*return*/];
            });
        });
    };
    MotionManager.prototype.onUiGameObjectDownHandler = function (pointer) {
        if (!this.isRunning)
            return;
        if (!this.render.guideManager || this.render.guideManager.canInteractive())
            return;
        this.isHolding = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        // const position = this.getPreUserPos(pointer);
        // if (!position) return;
        this.stop();
        clearTimeout(this.holdTime);
    };
    MotionManager.prototype.onGameObjectDownHandler = function (pointer, gameObject) {
        if (!this.isRunning)
            return;
        var id = gameObject ? gameObject.getData("id") : undefined;
        if (!this.render.guideManager || this.render.guideManager.canInteractive(id))
            return;
        this.gameObject = gameObject;
    };
    MotionManager.prototype.onGameObjectUpHandler = function (pointer, gameObject) {
        if (!this.isRunning)
            return;
        if (!this.render.guideManager || this.render.guideManager.canInteractive())
            return;
    };
    MotionManager.prototype.getMountId = function (id) {
        var ele = this.render.displayManager.getDisplay(id);
        if (!ele)
            return -1;
        if (ele.rootMount) {
            return this.getMountId(ele.rootMount.id);
        }
        return ele.id;
    };
    MotionManager.prototype.start = function (worldX, worldY, id) {
        this.render.mainPeer.moveMotion(worldX, worldY, id);
    };
    MotionManager.prototype.movePath = function (x, y, z, targets, id) {
        this.render.mainPeer.findPath(targets, id);
        // this.render.physicalPeer.findPath(targets, id);
    };
    MotionManager.prototype.stop = function () {
        this.render.mainPeer.stopSelfMove();
    };
    MotionManager.prototype.getPreUserPos = function (pointer) {
        if (!this.scene || !this.scene.cameras || !this.scene.cameras.main)
            return null;
        var _a = this.render.displayManager.user, x = _a.x, y = _a.y;
        var tmpX = pointer.worldX / this.scaleRatio - x;
        var tmpY = pointer.worldY / this.scaleRatio - y;
        return this.scene.cameras.main.getWorldPoint(pointer.x - tmpX, pointer.y - tmpY);
    };
    MotionManager.prototype.clearGameObject = function () {
        this.gameObject = null;
        clearTimeout(this.holdTime);
    };
    return MotionManager;
}());
export { MotionManager };
//# sourceMappingURL=motion.manager.js.map