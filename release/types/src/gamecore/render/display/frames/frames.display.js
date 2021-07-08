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
import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { Logger, DisplayField, LayerName, TitleMask } from "structure";
import { ElementTopDisplay } from "../element.top.display";
/**
 * 序列帧显示对象
 */
var FramesDisplay = /** @class */ (function (_super) {
    __extends_1(FramesDisplay, _super);
    function FramesDisplay(scene, render, id, type) {
        var _this = _super.call(this, scene, { resPath: render.url.RES_PATH, osdPath: render.url.OSD_PATH }, type) || this;
        _this.render = render;
        _this.mID = undefined;
        _this.mName = undefined;
        _this.mNodeType = type;
        _this.mID = id;
        return _this;
    }
    FramesDisplay.prototype.startLoad = function () {
        this.scene.load.start();
        return Promise.resolve(null);
    };
    FramesDisplay.prototype.destroy = function () {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mTopDisplay) {
            this.mTopDisplay.destroy();
        }
        if (this.mStartFireTween) {
            this.mStartFireTween.stop();
            this.mStartFireTween = undefined;
        }
        if (this.mDebugPoint) {
            this.mDebugPoint.destroy();
            this.mDebugPoint = undefined;
        }
        if (this.mGrids) {
            this.mGrids.destroy();
            this.mGrids = undefined;
        }
        _super.prototype.destroy.call(this);
    };
    Object.defineProperty(FramesDisplay.prototype, "titleMask", {
        get: function () {
            return this.mTitleMask;
        },
        set: function (val) {
            this.mTitleMask = val;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FramesDisplay.prototype, "hasInteractive", {
        get: function () {
            return this.mHasInteractive;
        },
        set: function (val) {
            this.mHasInteractive = val;
        },
        enumerable: true,
        configurable: true
    });
    FramesDisplay.prototype.update = function () {
        _super.prototype.update.call(this);
        this.updateTopDisplay();
    };
    FramesDisplay.prototype.checkCollision = function (sprite) {
        var currentCollisionArea = sprite.currentCollisionArea;
        if (currentCollisionArea && currentCollisionArea.length > 0)
            return true;
        return false;
    };
    FramesDisplay.prototype.showRefernceArea = function (area, origin, conflictMap) {
        return __awaiter(this, void 0, void 0, function () {
            var roomSize, drawArea;
            return __generator(this, function (_a) {
                if (!area || area.length <= 0 || !origin)
                    return [2 /*return*/];
                roomSize = this.render.roomSize;
                if (!this.mReferenceArea) {
                    this.mReferenceArea = new ReferenceArea(this.scene);
                }
                drawArea = area;
                if (conflictMap !== undefined && conflictMap.length > 0) {
                    drawArea = conflictMap;
                }
                this.mReferenceArea.draw(drawArea, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
                this.addAt(this.mReferenceArea, 0);
                return [2 /*return*/];
            });
        });
    };
    FramesDisplay.prototype.hideRefernceArea = function () {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    };
    FramesDisplay.prototype.showGrids = function () {
        if (this.mGrids) {
            this.mGrids.destroy();
            this.mGrids = undefined;
        }
        // const roomSize = this.render.roomSize;
        //
        // this.mGrids = this.scene.make.graphics(undefined, false);
        // this.mGrids.lineStyle(1, 0xffffff, 0.1);
        // this.mGrids.beginPath();
        // let point = new LogicPos(startX, endX);
        // point = Position45.transformTo90(point, roomSize);
        // this.mGrids.moveTo(point.x, point.y);
        // point = new LogicPos(startY, endY);
        // point = Position45.transformTo90(point);
        // this.mGrids.lineTo(point.x, point.y);
        // this.mGrids.closePath();
        // this.mGrids.strokePath();
        // this.addAt(this.mGrids, 0);
    };
    FramesDisplay.prototype.hideGrids = function () {
        if (this.mGrids) {
            this.mGrids.destroy();
            this.mGrids = undefined;
        }
    };
    FramesDisplay.prototype.updateTopDisplay = function () {
        if (this.mTopDisplay)
            this.mTopDisplay.update();
    };
    FramesDisplay.prototype.showNickname = function (name) {
        if (name === undefined) {
            name = this.mName;
        }
        this.mName = name;
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        }
        if (!this.checkShowNickname())
            return;
        this.mTopDisplay.showNickname(name);
        // debug
        // if (name !== "透明") {
        //     this.mTopDisplay.showNickname(name + "; " + this.mID + "; " + this.x + "; " + this.y);
        //     this.setAlpha(0.2);
        //     if (this.mDebugPoint) this.mDebugPoint.destroy();
        //     this.mDebugPoint = this.scene.make.graphics(undefined, false);
        //     this.mDebugPoint.clear();
        //     this.mDebugPoint.fillStyle(0xFF0000, 1);
        //     this.mDebugPoint.fillCircle(0, 0, 2);
        //
        //     this.add(this.mDebugPoint);
        // }
    };
    FramesDisplay.prototype.showTopDisplay = function (data) {
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
    FramesDisplay.prototype.showBubble = function (text, setting) {
        if (!this.mTopDisplay) {
            this.mTopDisplay = new ElementTopDisplay(this.scene, this, this.render);
        }
        this.mTopDisplay.showBubble(text, setting);
    };
    FramesDisplay.prototype.clearBubble = function () {
        if (!this.mTopDisplay)
            return;
        this.mTopDisplay.clearBubble();
    };
    FramesDisplay.prototype.displayCreated = function () {
        _super.prototype.displayCreated.call(this);
        if (this.mTopDisplay) {
            this.mTopDisplay.updateOffset();
        }
        this.render.mainPeer.elementDisplayReady(this.id);
    };
    FramesDisplay.prototype.play = function (val) {
        _super.prototype.play.call(this, val);
        this.fetchProjection();
    };
    FramesDisplay.prototype.doMove = function (moveData) {
    };
    FramesDisplay.prototype.startFireMove = function (pos) {
        var _this = this;
        Logger.getInstance().log("startFireMove ===>", pos, this.x, this.y);
        this.mStartFireTween = this.scene.tweens.add({
            targets: this,
            duration: 900,
            ease: "Expo.Out",
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
    FramesDisplay.prototype.setPosition = function (x, y, z, w) {
        _super.prototype.setPosition.call(this, x, y, z, w);
        this.updateTopDisplay();
        return this;
    };
    FramesDisplay.prototype.addEffect = function (display) {
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
    FramesDisplay.prototype.removeEffect = function (display) {
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
    // public mount(display: FramesDisplay | DragonbonesDisplay, targetIndex?: number) {
    //     if (!display) return;
    //     if (this.mDisplays.size <= 0) {
    //         return;
    //     }
    //     if (!this.mCurAnimation) {
    //         return;
    //     }
    //     if (!this.mCurAnimation.mountLayer) {
    //         Logger.getInstance().error(`mountLyaer does not exist ${this.mAnimation}`);
    //         return;
    //     }
    //     const {index, mountPoint} = this.mCurAnimation.mountLayer;
    //     if (targetIndex === undefined) targetIndex = 0;
    //     if (targetIndex >= mountPoint.length) {
    //         Logger.getInstance().error("mount index does not exist");
    //         return;
    //     }
    //     let {x} = mountPoint[targetIndex];
    //     if (this.mAnimation.flip) {
    //         x = 0 - x;
    //     }
    //     display.x = x;
    //     display.y = mountPoint[targetIndex].y;
    //     if (!this.mMountContainer) {
    //         this.mMountContainer = this.scene.make.container(undefined, false);
    //     }
    //     if (!this.mMountContainer.parentContainer) {
    //         const container = <Phaser.GameObjects.Container> this.mSprites.get(DisplayField.STAGE);
    //         if (container) container.addAt(this.mMountContainer, index);
    //     }
    //     this.mMountContainer.addAt(display, targetIndex);
    //     display.setRootMount(this);
    //     this.mMountList[targetIndex] = display;
    //     if (this.mMainSprite) {
    //         // 侦听前先移除，避免重复添加
    //         this.mMainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
    //         this.mMainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
    //     }
    // }
    FramesDisplay.prototype.unmount = function (display) {
        if (!this.mMountContainer) {
            return;
        }
        _super.prototype.unmount.call(this, display);
        this.render.displayManager.addToLayer(LayerName.SURFACE, display);
        //     display.setRootMount(undefined);
        //     const index = this.mMountList.indexOf(display);
        //     display.visible = true;
        //     if (index > -1) {
        //         this.mMountList.splice(index, 1);
        //     }
        //     const list = this.mMountContainer.list;
        //     if (list.length <= 0 && this.mDisplays.size > 0) {
        //         this.mDisplays[0].off("animationupdate", this.onAnimationUpdateHandler, this);
        //     }
    };
    FramesDisplay.prototype.scaleTween = function () {
        var _this = this;
        if (this.mMountContainer && this.mMountContainer.list.length > 0) {
            return;
        }
        if (this.mScaleTween) {
            return;
        }
        var tmp = this.scale;
        this.mScaleTween = this.scene.tweens.add({
            targets: this,
            duration: 100,
            scale: tmp * 1.25,
            yoyo: true,
            repeat: 0,
            onComplete: function () {
                _this.scale = 1;
                if (_this.mScaleTween) {
                    // this.mScaleTween.destroy();
                    _this.mScaleTween = undefined;
                }
            },
        });
    };
    FramesDisplay.prototype.fetchProjection = function () {
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
                        this.updateSort();
                        return [2 /*return*/];
                }
            });
        });
    };
    FramesDisplay.prototype.completeFrameAnimationQueue = function () {
        _super.prototype.completeFrameAnimationQueue.call(this);
        this.render.mainPeer.completeFrameAnimationQueue(this.id);
    };
    FramesDisplay.prototype.checkShowNickname = function () {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    };
    // protected clearDisplay() {
    //     super.clearDisplay();
    // if (this.mMountContainer && this.mMountContainer.parentContainer) {
    //     this.mMountContainer.parentContainer.remove(this.mMountContainer);
    // }
    // }
    FramesDisplay.prototype.onAnimationUpdateHandler = function (ani, frame) {
        var _this = this;
        if (!this.mMountContainer || !this.mCurAnimation)
            return;
        var frameVisible = this.mCurAnimation.mountLayer.frameVisible;
        if (!frameVisible) {
            return;
        }
        var index = frame.index - 1;
        if (index > frameVisible.length) {
            return;
        }
        this.mMountList.forEach(function (value, key) {
            value.visible = _this.getMaskValue(frameVisible[index], key);
        });
    };
    FramesDisplay.prototype.getMaskValue = function (mask, idx) {
        return ((mask >> idx) % 2) === 1;
    };
    Object.defineProperty(FramesDisplay.prototype, "nickname", {
        get: function () {
            return this.mName;
        },
        enumerable: true,
        configurable: true
    });
    return FramesDisplay;
}(BaseFramesDisplay));
export { FramesDisplay };
//# sourceMappingURL=frames.display.js.map