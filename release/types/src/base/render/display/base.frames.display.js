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
import { BaseDisplay } from "./base.display";
import { Direction, Logger, DisplayField } from "structure";
/**
 * 序列帧显示对象
 */
var BaseFramesDisplay = /** @class */ (function (_super) {
    __extends_1(BaseFramesDisplay, _super);
    function BaseFramesDisplay(scene, pathObj, id, nodeType) {
        var _this = _super.call(this, scene, id) || this;
        _this.pathObj = pathObj;
        _this.mDisplayDatas = new Map();
        // protected mDisplays: Array<Phaser.GameObjects.Sprite | Phaser.GameObjects.Image> = [];
        _this.mDisplays = new Map();
        _this.mIsSetInteractive = false;
        _this.mIsInteracitve = false;
        _this.mNodeType = nodeType;
        _this.mID = id;
        return _this;
    }
    BaseFramesDisplay.prototype.load = function (displayInfo, field) {
        var _this = this;
        field = !field ? DisplayField.STAGE : field;
        this.mField = field;
        this.mDisplayInfo = displayInfo;
        if (!this.framesInfo || !this.framesInfo.gene) {
            return Promise.reject("framesInfo error" + displayInfo.id);
        }
        var currentDisplay = this.mDisplayDatas.get(field);
        if (!currentDisplay || currentDisplay.gene !== displayInfo.gene) {
            this.mDisplayDatas.set(field, this.framesInfo);
        }
        if (this.scene.textures.exists(this.framesInfo.gene)) {
            this.onLoadCompleted(field);
        }
        else {
            var display = this.framesInfo.display;
            if (!display) {
                Logger.getInstance().debug("update frame loadError", "display is undefined");
                this.displayCreated();
                return;
            }
            if (display.texturePath === "" || display.dataPath === "") {
                Logger.getInstance().debug("update frame loadError", "动画资源报错：", this.displayInfo);
                this.displayCreated();
            }
            else {
                this.scene.load.atlas(this.framesInfo.gene, this.pathObj.osdPath + display.texturePath, this.pathObj.osdPath + display.dataPath);
                var onAdd_1 = function (key) {
                    if (key !== _this.framesInfo.gene)
                        return;
                    _this.onAddTextureHandler(key, field, onAdd_1);
                    if (_this.scene) {
                        _this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError_1, _this);
                    }
                };
                var onLoadError_1 = function (imageFile) {
                    var key = imageFile.multiFile ? imageFile.multiFile.key : imageFile.key;
                    if (key !== _this.framesInfo.gene)
                        return;
                    Logger.getInstance().debug("update frame loadError " + imageFile.url);
                    _this.displayCreated();
                };
                this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError_1, this);
                this.scene.textures.on(Phaser.Textures.Events.ADD, onAdd_1, this);
                this.scene.load.start();
            }
        }
        return Promise.resolve(null);
    };
    BaseFramesDisplay.prototype.play = function (animation, field) {
        _super.prototype.play.call(this, animation);
        if (!animation)
            return;
        var times = animation.times;
        field = !field ? DisplayField.STAGE : field;
        var data = this.mDisplayDatas.get(field);
        if (!this.scene || !data)
            return;
        if (this.scene.textures.exists(data.gene) === false) {
            return;
        }
        var aniDatas = data.animations;
        this.mCurAnimation = aniDatas.get(animation.name);
        if (!this.mCurAnimation)
            return;
        var layer = this.mCurAnimation.layer;
        // if (!this.someLayer(aniDatas, this.mPreAnimation ? this.mPreAnimation.name : undefined, animation.name)) {
        //     this.createDisplays(data.gene, this.mCurAnimation);
        // }
        this.tryCreateDisplay(data.gene, aniDatas, this.mCurAnimation);
        var display = null;
        for (var i = 0; i < layer.length; i++) {
            var _a = layer[i], frameName = _a.frameName, offsetLoc = _a.offsetLoc;
            display = this.mDisplays.get(layer[i].id || i);
            if (!display) {
                // 空地块不会创建display
                // Logger.getInstance().error(`display ${this.mID} play fail, display does not exist!`);
                continue;
            }
            if (frameName.length > 1) {
                var key = data.gene + "_" + animation.name + "_" + i;
                this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible, this.mCurAnimation.frameRate, this.mCurAnimation.loop, this.mCurAnimation.frameDuration);
                var anis = display.anims;
                anis.play(key);
                // times为0为默认行为。按undefined处理
                if (typeof times === "number" && times !== 0) {
                    // setRepeat 播放一次后，播放的次数
                    anis.setRepeat(times > 0 ? times - 1 : times);
                }
            }
            else {
                display.setFrame(frameName[0]);
            }
            display.scaleX = animation.flip ? -1 : 1;
            this.updateBaseLoc(display, animation.flip, offsetLoc);
        }
        this.emit("updateAnimation");
        if (this.mMainSprite) {
            this.mMainSprite.on(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
        }
        if (this.mMountContainer && this.mMountContainer.parentContainer && this.mCurAnimation.mountLayer) {
            var stageContainer = this.mSprites.get(DisplayField.STAGE);
            stageContainer.moveTo(this.mMountContainer, this.mCurAnimation.mountLayer.index);
        }
        this.mPreAnimation = animation;
    };
    BaseFramesDisplay.prototype.playEffect = function () {
        var data = this.mDisplayDatas.get(DisplayField.Effect);
        if (!data) {
            return;
        }
        var anis = data.animations;
        var aniName = data.animationName;
        if (!anis) {
            return;
        }
        // TODO
        var ani = anis.get(aniName);
        if (!ani) {
            return;
        }
        var layer = ani.layer;
        var effects = [];
        for (var i = 0; i < layer.length; i++) {
            var display = void 0;
            var _a = layer[i], frameName = _a.frameName, offsetLoc = _a.offsetLoc;
            if (frameName.length > 1) {
                var key = data.gene + "_" + aniName + "_" + i;
                this.makeAnimation(data.gene, key, layer[i].frameName, layer[i].frameVisible, ani.frameRate, ani.loop, ani.frameDuration);
                display = this.scene.make.sprite(undefined, false).play(key);
            }
            else {
                display = this.scene.make.image(undefined, false).setTexture(data.gene, frameName[0]);
            }
            display.x = offsetLoc.x + display.width * 0.5;
            display.y = offsetLoc.y + display.height * 0.5;
            effects.push(display);
        }
        if (effects.length > 1) {
            this.addAt(effects[1], DisplayField.BACKEND);
            this.mSprites.set(DisplayField.BACKEND, effects[1]);
        }
        this.addAt(effects[0], DisplayField.FRONTEND);
        this.mSprites.set(DisplayField.FRONTEND, effects[0]);
    };
    BaseFramesDisplay.prototype.fadeIn = function (callback) {
        if (this.mAlpha === 0) {
            return;
        }
        this.alpha = 0;
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: this.mAlpha,
            duration: 1200,
            onComplete: function () {
                if (callback)
                    callback();
            },
        });
    };
    BaseFramesDisplay.prototype.fadeOut = function (callback) {
        this.clearFadeTween();
        this.mFadeTween = this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 1200,
            onComplete: function () {
                if (callback)
                    callback();
            },
        });
    };
    BaseFramesDisplay.prototype.setInteractive = function (shape, callback, dropZone) {
        this.mIsInteracitve = true;
        this.mDisplays.forEach(function (display) {
            display.setInteractive({ pixelPerfect: true });
        });
        return this;
    };
    BaseFramesDisplay.prototype.disableInteractive = function () {
        // super.disableInteractive();
        this.mIsInteracitve = false;
        this.mDisplays.forEach(function (display) {
            display.disableInteractive();
        });
        return this;
    };
    BaseFramesDisplay.prototype.removeDisplay = function (field) {
        var display = this.mSprites.get(field);
        if (display) {
            this.mSprites.delete(field);
            display.destroy();
        }
    };
    BaseFramesDisplay.prototype.mount = function (display, targetIndex) {
        if (!display)
            return;
        // if (this.mDisplays.size <= 0) {
        //     return;
        // }
        if (!this.mCurAnimation) {
            return;
        }
        if (!this.mCurAnimation.mountLayer) {
            Logger.getInstance().error("mountLayer does not exist: ", this.mCurAnimation);
            return;
        }
        if (targetIndex !== undefined && this.mMountList.get(targetIndex) && this.mMountList.get(targetIndex) === display) {
            return;
        }
        var _a = this.mCurAnimation.mountLayer, index = _a.index, mountPoint = _a.mountPoint;
        if (!mountPoint) {
            Logger.getInstance().error("mount mountPoint does not exist,id:", this.id);
            return;
        }
        if (targetIndex === undefined)
            targetIndex = 0;
        if (targetIndex >= mountPoint.length) {
            Logger.getInstance().error("mount index does not exist");
            return;
        }
        var x = mountPoint[targetIndex].x;
        if (this.mAnimation.flip) {
            x = 0 - x;
        }
        display.x = x;
        display.y = mountPoint[targetIndex].y;
        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        if (!this.mMountContainer.parentContainer) {
            var container = this.mSprites.get(DisplayField.STAGE);
            if (container)
                container.addAt(this.mMountContainer, index);
        }
        this.mMountContainer.addAt(display, targetIndex);
        display.setRootMount(this);
        this.mMountList.set(targetIndex, display);
        if (this.mMainSprite) {
            // 侦听前先移除，避免重复添加
            // this.mMainSprite.off("animationupdate", this.onAnimationUpdateHandler, this);
            // this.mMainSprite.on("animationupdate", this.onAnimationUpdateHandler, this);
        }
    };
    BaseFramesDisplay.prototype.unmount = function (display) {
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
        var list = this.mMountContainer.list;
        if (list.length <= 0 && this.mDisplays.size > 0) {
            // this.mDisplays[0].off("animationupdate", this.onAnimationUpdateHandler, this);
        }
    };
    BaseFramesDisplay.prototype.destroy = function () {
        this.clearDisplay();
        if (this.mFadeTween) {
            this.clearFadeTween();
            this.mFadeTween = undefined;
        }
        if (this.mScaleTween) {
            this.mScaleTween.stop();
            this.mScaleTween = undefined;
        }
        this.mDisplayDatas.clear();
        _super.prototype.destroy.call(this);
    };
    BaseFramesDisplay.prototype.createDisplays = function (key, ani) {
        // const ani = data.getAnimations(animationName);
        // 清楚上一个显示对象的贴图数据
        this.clearDisplay();
        var layer = ani.layer;
        var display;
        for (var i = 0; i < layer.length; i++) {
            display = this.createDisplay(key, layer[i]);
            if (display) {
                this.mDisplays.set(layer[i].id || i, display);
                this.addToStageContainer(display);
            }
        }
        this.mIsInteracitve ? this.setInteractive() : this.disableInteractive();
        this.mIsSetInteractive = true;
    };
    BaseFramesDisplay.prototype.createDisplay = function (key, layer) {
        var display;
        var frameName = layer.frameName;
        if (frameName.length > 1) {
            display = this.scene.make.sprite(undefined, false);
            if (!this.mMainSprite) {
                this.mMainSprite = display;
            }
        }
        else if (frameName.length === 1) {
            display = this.scene.make.image({ key: key, frame: frameName[0] });
        }
        else {
            return;
        }
        display.setData("id", this.mID);
        return display;
    };
    BaseFramesDisplay.prototype.clearFadeTween = function () {
        if (this.mFadeTween) {
            this.mFadeTween.stop();
            this.mFadeTween.remove();
        }
    };
    BaseFramesDisplay.prototype.completeFrameAnimationQueue = function () {
    };
    BaseFramesDisplay.prototype.tryCreateDisplay = function (key, animations, newAni) {
        if (!this.mPreAnimation) {
            this.createDisplays(key, newAni);
            return;
        }
        if (this.mPreAnimation.name === newAni.name) {
            return;
        }
        var oldAni = animations.get(this.mPreAnimation.name);
        if (!oldAni) {
            return;
        }
        var oldLayer = oldAni.layer;
        var newLayer = newAni.layer;
        if (oldLayer.length !== newLayer.length) {
            this.createDisplays(key, newAni);
            return;
        }
        for (var i = 0; i < oldLayer.length; i++) {
            var oldFrames = oldLayer[i].frameName;
            var newFrames = newLayer[i].frameName;
            if (oldFrames.length !== newFrames.length) {
                this.createDisplays(key, newAni);
                return;
            }
            else {
                var oldId = oldLayer[i].id;
                var newId = newLayer[i].id;
                if (oldId === newId)
                    continue;
                var oldDisplay = this.mDisplays.get(oldId);
                if (oldDisplay) {
                    this.mDisplays.set(newId, oldDisplay);
                    this.mDisplays.delete(oldId);
                }
            }
        }
    };
    BaseFramesDisplay.prototype.clearDisplay = function () {
        // for (const display of this.mDisplays) {
        //     display.destroy();
        // }
        this.mDisplays.forEach(function (display) { return display.destroy(); });
        this.mMountList.clear();
        this.mDisplays.clear();
        this.mMainSprite = null;
        this.mPreAnimation = null;
    };
    BaseFramesDisplay.prototype.onAddTextureHandler = function (key, field, cb) {
        if (field === undefined) {
            field = DisplayField.STAGE;
        }
        var data = this.mDisplayDatas.get(field);
        if (data && data.gene === key) {
            this.scene.textures.off(Phaser.Textures.Events.ADD, cb, this);
            this.onLoadCompleted(field);
        }
        else {
            Logger.getInstance().debug("no addtexture", this, data, field);
        }
    };
    BaseFramesDisplay.prototype.mAllLoadCompleted = function () {
        this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.mAllLoadCompleted, this);
        this.onLoadCompleted(this.mField);
    };
    BaseFramesDisplay.prototype.onLoadCompleted = function (field) {
        this.clearDisplay();
        var data = this.mDisplayDatas.get(field);
        if (!data) {
            return;
        }
        if (this.scene.textures.exists(data.gene)) {
            if (field === DisplayField.STAGE) {
                if (this.mAnimation) {
                    this.play(this.mAnimation);
                }
                else {
                    var flip = false;
                    switch (data.avatarDir) {
                        case Direction.south_east:
                        case Direction.east_north:
                            flip = true;
                            break;
                        case Direction.west_south:
                        case Direction.north_west:
                            break;
                    }
                    this.play({ name: data.animationName, flip: flip });
                }
            }
            else {
                this.playEffect();
            }
        }
        this.displayCreated();
    };
    BaseFramesDisplay.prototype.makeAnimation = function (gen, key, frameName, frameVisible, frameRate, loop, frameDuration) {
        if (frameVisible && frameName.length !== frameVisible.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameVisible.length: " + frameVisible.length);
            return;
        }
        if (frameDuration && frameName.length !== frameDuration.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameDuration.length: " + frameDuration.length);
            return;
        }
        if (this.scene.anims.exists(key)) {
            return;
        }
        var frames = [];
        for (var i = 0; i < frameName.length; i++) {
            var frame = frameName[i];
            var visible = frameVisible ? frameVisible[i] : true;
            if (frameDuration) {
                frames.push({ key: gen, frame: frame, duration: frameDuration[i] * 1000, visible: visible });
            }
            else {
                frames.push({ key: gen, frame: frame, visible: visible });
            }
        }
        var repeat = loop ? -1 : 0;
        var config = {
            key: key,
            frames: frames,
            frameRate: frameRate,
            repeat: repeat,
        };
        this.scene.anims.create(config);
    };
    BaseFramesDisplay.prototype.updateBaseLoc = function (display, flip, offsetLoc) {
        if (!offsetLoc)
            offsetLoc = { x: 0, y: 0 };
        var x = offsetLoc.x;
        var y = offsetLoc.y;
        if (flip) {
            x = (0 - (display.width + x));
        }
        display.x = x + display.width * 0.5;
        display.y = y + display.height * 0.5;
    };
    BaseFramesDisplay.prototype.onAnimationRepeatHander = function () {
        var queue = this.mAnimation.playingQueue;
        if (!queue)
            return;
        if (queue.playedTimes === undefined) {
            queue.playedTimes = 1;
        }
        else {
            queue.playedTimes++;
        }
        if (queue.playedTimes >= queue.playTimes) {
            if (this.mMainSprite) {
                this.mMainSprite.off(Phaser.Animations.Events.ANIMATION_REPEAT, this.onAnimationRepeatHander, this);
            }
            // this.emit("animationComplete");
            this.completeFrameAnimationQueue();
        }
    };
    BaseFramesDisplay.prototype.addToStageContainer = function (display) {
        if (!display) {
            return;
        }
        var container = this.mSprites.get(DisplayField.STAGE);
        if (!container) {
            container = this.scene.make.container(undefined, false);
            container.setData("id", this.mID);
            this.addAt(container, DisplayField.STAGE);
            this.mSprites.set(DisplayField.STAGE, container);
        }
        container.add(display);
    };
    Object.defineProperty(BaseFramesDisplay.prototype, "framesInfo", {
        get: function () {
            return this.mDisplayInfo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseFramesDisplay.prototype, "spriteWidth", {
        get: function () {
            var width = 0;
            if (this.mDisplays) {
                // for (const display of this.mDisplays) {
                //     if (display.width > width) width = display.width;
                // }
                this.mDisplays.forEach(function (display) {
                    if (display.width > width)
                        width = display.width;
                });
            }
            return width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseFramesDisplay.prototype, "spriteHeight", {
        get: function () {
            var height = 0;
            if (this.mDisplays) {
                // for (const display of this.mDisplays) {
                //     if (display.height > height) height = display.height;
                // }
                this.mDisplays.forEach(function (display) {
                    if (display.width > height)
                        height = display.height;
                });
            }
            return height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseFramesDisplay.prototype, "topPoint", {
        get: function () {
            return new Phaser.Geom.Point(0, -this.spriteHeight);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseFramesDisplay.prototype, "nodeType", {
        get: function () {
            return this.mNodeType;
        },
        enumerable: true,
        configurable: true
    });
    return BaseFramesDisplay;
}(BaseDisplay));
export { BaseFramesDisplay };
//# sourceMappingURL=base.frames.display.js.map