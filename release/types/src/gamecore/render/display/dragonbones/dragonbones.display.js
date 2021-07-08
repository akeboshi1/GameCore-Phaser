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
import { BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
import { Logger, DisplayField, LayerName, TitleMask } from "structure";
import { LoadQueue } from "../../loadqueue";
import { ElementTopDisplay } from "../element.top.display";
var DragonbonesDisplay = /** @class */ (function (_super) {
    __extends_1(DragonbonesDisplay, _super);
    function DragonbonesDisplay(scene, render, id, uuid, type) {
        var _this = _super.call(this, scene, { resPath: render.url.RES_PATH, osdPath: render.url.OSD_PATH }, id) || this;
        _this.render = render;
        _this.uuid = uuid;
        _this.mNodeType = undefined;
        _this.mSortX = 0;
        _this.mSortY = 0;
        _this.mName = undefined;
        _this.mNodeType = type;
        _this.mLoadQueue = new LoadQueue(scene);
        _this.mLoadQueue.on("QueueProgress", _this.fileComplete, _this);
        _this.mLoadQueue.on("QueueError", _this.fileError, _this);
        _this.mHasInteractive = true;
        return _this;
    }
    DragonbonesDisplay.prototype.load = function (display, field, useRenderTex) {
        if (useRenderTex === void 0) { useRenderTex = true; }
        field = !field ? DisplayField.STAGE : field;
        if (field !== DisplayField.STAGE) {
            return Promise.reject("field is not STAGE");
        }
        return _super.prototype.load.call(this, display, field, useRenderTex);
    };
    Object.defineProperty(DragonbonesDisplay.prototype, "hasInteractive", {
        get: function () {
            return this.mHasInteractive;
        },
        set: function (val) {
            this.mHasInteractive = val;
        },
        enumerable: true,
        configurable: true
    });
    DragonbonesDisplay.prototype.startLoad = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mLoadQueue || _this.mCreated) {
                resolve(null);
                return;
            }
            _this.mLoadQueue.once("QueueComplete", function () {
                resolve(null);
            }, _this);
            _this.mLoadQueue.startLoad();
        });
    };
    DragonbonesDisplay.prototype.destroy = function () {
        if (this.mLoadQueue) {
            this.mLoadQueue.off("QueueProgress", this.fileComplete, this);
            this.mLoadQueue.off("QueueError", this.fileError, this);
            this.mLoadQueue.destroy();
        }
        if (this.mStartFireTween) {
            this.mStartFireTween.stop();
            this.mStartFireTween = undefined;
        }
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mTopDisplay) {
            this.mTopDisplay.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    Object.defineProperty(DragonbonesDisplay.prototype, "nodeType", {
        get: function () {
            return this.mNodeType;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragonbonesDisplay.prototype, "titleMask", {
        get: function () {
            return this.mTitleMask;
        },
        set: function (val) {
            this.mTitleMask = val;
        },
        enumerable: true,
        configurable: true
    });
    DragonbonesDisplay.prototype.checkCollision = function (sprite) {
        var currentCollisionArea = sprite.currentCollisionArea;
        if (currentCollisionArea && currentCollisionArea.length > 0)
            return true;
        return false;
    };
    DragonbonesDisplay.prototype.showRefernceArea = function (area, origin) {
        return __awaiter(this, void 0, void 0, function () {
            var roomSize;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!area || area.length <= 0 || !origin)
                            return [2 /*return*/];
                        if (!this.mReferenceArea) {
                            this.mReferenceArea = new ReferenceArea(this.scene);
                        }
                        return [4 /*yield*/, this.render.mainPeer.getCurrentRoomSize()];
                    case 1:
                        roomSize = _a.sent();
                        this.mReferenceArea.draw(area, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
                        this.addAt(this.mReferenceArea, 0);
                        return [2 /*return*/];
                }
            });
        });
    };
    DragonbonesDisplay.prototype.hideRefernceArea = function () {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    };
    DragonbonesDisplay.prototype.showGrids = function () {
    };
    DragonbonesDisplay.prototype.hideGrids = function () {
    };
    DragonbonesDisplay.prototype.updateTopDisplay = function () {
        if (this.mTopDisplay)
            this.mTopDisplay.update();
    };
    DragonbonesDisplay.prototype.setVisible = function (value) {
        if (this.mTopDisplay) {
            if (value)
                this.mTopDisplay.showNickname(this.mName);
            else
                this.mTopDisplay.hideNickname();
        }
        return _super.prototype.setVisible.call(this, value);
    };
    DragonbonesDisplay.prototype.showNickname = function (name) {
        if (name === undefined) {
            name = this.mName;
        }
        this.mName = name;
        if (!this.checkShowNickname())
            return;
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        }
        this.mTopDisplay.showNickname(name);
    };
    DragonbonesDisplay.prototype.showTopDisplay = function (data) {
        if (!data) {
            if (this.mTopDisplay)
                this.mTopDisplay.destroy();
            this.mTopDisplay = undefined;
            return;
        }
        if (!this.mTopDisplay)
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        this.mTopDisplay.loadState(data);
    };
    DragonbonesDisplay.prototype.showBubble = function (text, setting) {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        }
        this.mTopDisplay.showBubble(text, setting);
    };
    DragonbonesDisplay.prototype.clearBubble = function () {
        if (!this.mTopDisplay)
            return;
        this.mTopDisplay.clearBubble();
    };
    DragonbonesDisplay.prototype.displayCreated = function () {
        _super.prototype.displayCreated.call(this);
        if (this.mTopDisplay) {
            this.mTopDisplay.updateOffset();
        }
        this.render.mainPeer.elementDisplayReady(this.id);
        this.render.renderEmitter("dragonBones_initialized");
    };
    Object.defineProperty(DragonbonesDisplay.prototype, "projectionSize", {
        get: function () {
            if (!this.mProjectionSize) {
                this.mProjectionSize = { offset: { x: 0, y: 0 }, width: 0, height: 0 };
            }
            return this.mProjectionSize;
        },
        enumerable: true,
        configurable: true
    });
    DragonbonesDisplay.prototype.play = function (val) {
        _super.prototype.play.call(this, val);
        this.fetchProjection();
    };
    DragonbonesDisplay.prototype.startFireMove = function (pos) {
        var _this = this;
        this.mStartFireTween = this.scene.tweens.add({
            targets: this,
            duration: 5000,
            ease: "Linear",
            props: {
                x: pos.x,
                y: pos.y
            },
            onComplete: function () {
                if (_this.mStartFireTween)
                    _this.mStartFireTween.stop();
                if (_this.mStartFireTween)
                    _this.mStartFireTween = undefined;
            },
            onCompleteParams: [this]
        });
    };
    DragonbonesDisplay.prototype.doMove = function (moveData) {
    };
    DragonbonesDisplay.prototype.update = function () {
        _super.prototype.update.call(this);
        this.updateTopDisplay();
    };
    DragonbonesDisplay.prototype.addEffect = function (display) {
        if (!display) {
            return Logger.getInstance().error("Failed to add effect, display does not exist");
        }
        var backend = display.getSprite(DisplayField.BACKEND);
        if (backend) {
            this.addAt(backend, DisplayField.BACKEND);
        }
        var frontend = display.getSprite(DisplayField.FRONTEND);
        if (frontend) {
            this.addAt(frontend, DisplayField.FRONTEND);
        }
    };
    DragonbonesDisplay.prototype.removeEffect = function (display) {
        if (!display) {
            return Logger.getInstance().error("Failed to remove effect, display does not exist");
        }
        var backend = display.getSprite(DisplayField.BACKEND);
        if (backend) {
            this.remove(backend, true);
        }
        var frontend = display.getSprite(DisplayField.FRONTEND);
        if (frontend) {
            this.remove(frontend, true);
        }
    };
    DragonbonesDisplay.prototype.mount = function (display, index) {
        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        display.x = this.topPoint.x;
        display.y = this.topPoint.y;
        if (!this.mMountContainer.parentContainer) {
            // const container = <Phaser.GameObjects.Container>this.mSprites.get(DisplayField.STAGE);
            // if (container) container.addAt(this.mMountContainer, index);
            this.add(this.mMountContainer);
        }
        this.mMountContainer.addAt(display, index);
        this.mMountList.set(index, display);
        display.setRootMount(this);
    };
    DragonbonesDisplay.prototype.unmount = function (display) {
        if (!this.mMountContainer) {
            return;
        }
        display.setRootMount(undefined);
        display.visible = true;
        var index = -1;
        this.mMountList.forEach(function (val, key) {
            if (val === display) {
                index = key;
            }
        });
        if (index >= 0) {
            this.mMountList.delete(index);
        }
        this.mMountContainer.remove(display, false);
        this.render.displayManager.addToLayer(LayerName.SURFACE, display);
    };
    Object.defineProperty(DragonbonesDisplay.prototype, "sortX", {
        get: function () {
            return this.mSortX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DragonbonesDisplay.prototype, "sortY", {
        get: function () {
            return this.mSortY;
        },
        enumerable: true,
        configurable: true
    });
    DragonbonesDisplay.prototype.fetchProjection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.id)
                            return [2 /*return*/];
                        _a = this;
                        return [4 /*yield*/, this.render.mainPeer.fetchProjectionSize(this.id)];
                    case 1:
                        _a.mProjectionSize = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DragonbonesDisplay.prototype.fileComplete = function (progress, key, type) {
        if (key !== this.resourceName || type !== "image") {
            return;
        }
        this.createArmatureDisplay();
    };
    DragonbonesDisplay.prototype.fileError = function (key) {
        if (key !== this.resourceName)
            return;
        // TODO: 根据请求错误类型，retry或catch
        this.displayCreated();
    };
    DragonbonesDisplay.prototype.onArmatureLoopComplete = function (event) {
        _super.prototype.onArmatureLoopComplete.call(this, event);
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        var queue = this.mAnimation.playingQueue;
        var times = queue.playTimes === undefined ? -1 : queue.playTimes;
        if (queue.playedTimes >= times && times > 0) {
            this.render.mainPeer.completeDragonBonesAnimationQueue(this.id);
        }
    };
    DragonbonesDisplay.prototype.checkShowNickname = function () {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    };
    Object.defineProperty(DragonbonesDisplay.prototype, "nickname", {
        get: function () {
            return this.mName;
        },
        enumerable: true,
        configurable: true
    });
    return DragonbonesDisplay;
}(BaseDragonbonesDisplay));
export { DragonbonesDisplay };
//# sourceMappingURL=dragonbones.display.js.map