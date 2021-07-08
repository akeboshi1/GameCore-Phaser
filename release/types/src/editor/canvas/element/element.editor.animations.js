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
import * as path from "path";
import * as os from "os";
import { SPRITE_SHEET_KEY, IMAGE_BLANK_KEY } from "./element.editor.resource.manager";
import version from "../../../../version";
import { Logger } from "structure";
import { ElementEditorEmitType } from "./element.editor.type";
export var LOCAL_HOME_PATH = path.resolve(os.homedir(), ".pixelpai");
var ElementEditorAnimations = /** @class */ (function (_super) {
    __extends_1(ElementEditorAnimations, _super);
    function ElementEditorAnimations(scene, node, grids, emitter) {
        var _this = _super.call(this, scene) || this;
        _this.MOUNT_ARMATURE_KEY = "Armature";
        _this.MOUNT_DRAGONBONES_KEY = "bones_human01";
        _this.MOUNT_ANIMATION_TIME_SCALE = 1000 / 12;
        _this.mDisplays = new Map();
        _this.mSelectedGameObjects = [];
        _this.mMountArmatures = []; // 互动模拟骨架
        _this.mDragonBonesLoaded = false;
        _this.mCurFrameIdx = 0;
        _this.mPlaying = false;
        _this.mInteractive = true;
        _this.mGrids = grids;
        _this.mEmitter = emitter;
        var parentContainer = scene.add.container(0, 0);
        parentContainer.add(_this);
        _this.mMountArmatureParent = scene.add.container(0, 0);
        _this.add(_this.mMountArmatureParent);
        _this.scene.input.on("dragstart", _this.onDragStartHandler, _this);
        _this.scene.input.on("drag", _this.onDragHandler, _this);
        _this.scene.input.on("dragend", _this.onDragEndHandler, _this);
        _this.scene.input.keyboard.on("keydown", _this.keyboardEvent, _this);
        _this.loadMountDragonBones();
        // init data
        _this.setAnimationData(node);
        return _this;
    }
    ElementEditorAnimations.prototype.setAnimationData = function (data) {
        this.clear();
        this.mAnimationData = data;
        this.mCurFrameIdx = 0;
        this.mPlaying = false;
        this.mInteractive = true;
        if (!this.mAnimationData) {
            Logger.getInstance().warn("选择动画错误!");
            return;
        }
        Logger.getInstance().debug("setAnimationData: ", data);
        this.createDisplays();
        this.createMountDisplay();
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.onResourcesLoaded = function () {
        this.clearDisplays();
        this.createDisplays();
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.onResourcesCleared = function () {
        this.clearDisplays();
    };
    ElementEditorAnimations.prototype.setFrame = function (frameIdx) {
        this.mCurFrameIdx = frameIdx;
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.setMountAnimation = function (aniName, idx) {
        if (idx !== undefined) {
            if (this.mMountArmatures.length <= idx) {
                Logger.getInstance().warn("wrong idx: " + idx + "; length: " + this.mMountArmatures.length);
                return;
            }
            var arm = this.mMountArmatures[idx];
            if (aniName && arm.animation.hasAnimation(aniName)) {
                arm.animation.play(aniName);
            }
            else {
                arm.animation.stop();
            }
        }
        else {
            this.mMountArmatures.forEach(function (arm) {
                if (aniName && arm.animation.hasAnimation(aniName)) {
                    arm.animation.play(aniName);
                }
                else {
                    arm.animation.stop();
                }
            });
        }
    };
    ElementEditorAnimations.prototype.updateMountDisplay = function () {
        this.createMountDisplay();
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.setPlay = function (playing) {
        this.mPlaying = playing;
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.setInputEnabled = function (val) {
        this.mInteractive = val;
        this.updateInputEnabled();
        // clear selected
        if (!val)
            this.mSelectedGameObjects.length = 0;
    };
    // 根据图层索引设置选中图层
    // public setSelectedGameObjectsByLevelIdx(idxs: number[]) {
    //     let gos = [];
    //     idxs.forEach((idx) => {
    //         const layer = this.getLayerByLayerIdx(idx);
    //         if (layer.length > 0) gos = gos.concat(layer);
    //     });
    //     this.setSelectedGameObjects(gos);
    // }
    ElementEditorAnimations.prototype.setSelectedAnimationLayer = function (idxs) {
        var _this = this;
        var gos = [];
        idxs.forEach(function (idx) {
            if (_this.mDisplays.has(idx)) {
                gos = gos.concat(_this.mDisplays.get(idx));
            }
        });
        this.setSelectedGameObjects(gos);
    };
    ElementEditorAnimations.prototype.setSelectedMountLayer = function (mountPointIndex) {
        if (mountPointIndex !== undefined) {
            if (this.mMountArmatures.length <= mountPointIndex) {
                Logger.getInstance().warn("wrong idx: " + mountPointIndex + "; length: " + this.mMountArmatures.length);
                return;
            }
            this.setSelectedGameObjects(this.mMountArmatures[mountPointIndex]);
        }
        else {
            // 全选所有挂载点
            this.setSelectedGameObjects(this.mMountArmatures);
        }
    };
    ElementEditorAnimations.prototype.updateDepth = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        this.mAnimationData.layerDict.forEach(function (val, key) {
            if (!_this.mDisplays.has(key))
                return;
            var display = _this.mDisplays.get(key);
            if (display && display.parentContainer) {
                display.parentContainer.setDepth(val.depth);
            }
        });
        if (!this.mAnimationData.mountLayer)
            return;
        if (this.mMountArmatureParent) {
            this.mMountArmatureParent.setDepth(this.mAnimationData.mountLayer.index);
        }
        this.updateChildrenIdxByDepth();
    };
    ElementEditorAnimations.prototype.updatePerAnimationLayerVisible = function (idx) {
        if (!this.mAnimationData)
            return;
        if (!this.mAnimationData.layerDict.has(idx) || !this.mDisplays.has(idx))
            return;
        if (this.mPlaying)
            return;
        var display = this.mDisplays.get(idx);
        var data = this.mAnimationData.layerDict.get(idx);
        if (data.frameVisible && this.mCurFrameIdx >= data.frameVisible.length)
            return;
        if (display) {
            display.visible = data.frameVisible ? data.frameVisible[this.mCurFrameIdx] : true;
        }
    };
    // public addAnimationLayer(idx: number) {
    //     this.createDisplay(idx);
    //     this.updatePlay();
    // }
    // public deleteAnimationLayer(idx: number) {
    //     if (!this.mDisplays.has(idx)) return;
    //     const display = this.mDisplays.get(idx);
    //     if (display) {
    //         display.parentContainer.destroy();
    //         display.destroy();
    //     }
    //     this.mDisplays.delete(idx);
    // }
    ElementEditorAnimations.prototype.updateAnimationLayer = function () {
        this.clearDisplays();
        this.createDisplays();
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.updateOffsetLoc = function (idx) {
        var display = this.mDisplays.get(idx);
        if (!display) {
            return;
        }
        if (!this.mAnimationData) {
            return;
        }
        var data = this.mAnimationData.layerDict.get(idx);
        if (!data) {
            return;
        }
        var originPos = this.mGrids.getAnchor90Point();
        var baseLoc = data.offsetLoc || { x: 0, y: 0 };
        display.x = originPos.x + baseLoc.x;
        display.y = originPos.y + baseLoc.y;
    };
    ElementEditorAnimations.prototype.generateThumbnail = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.mAnimationData) {
                reject(null);
                return;
            }
            if (_this.mAnimationData.layerDict.size === 0) {
                reject(null);
                return;
            }
            var firstLayer = _this.mAnimationData.layerDict.values().next().value;
            if (firstLayer.frameName.length === 0) {
                reject(null);
                return;
            }
            var frameName = firstLayer.frameName[0];
            if (!_this.scene.textures.exists(SPRITE_SHEET_KEY)) {
                reject(null);
                return;
            }
            if (!_this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
                reject(null);
                return;
            }
            if (frameName === IMAGE_BLANK_KEY) {
                reject(null);
                return;
            }
            var image = _this.scene.make.image({ key: SPRITE_SHEET_KEY, frame: frameName }).setOrigin(0, 0);
            var scaleRatio = 1;
            if (image.width > 48 || image.height > 48) {
                if (image.width > image.height) {
                    scaleRatio = 48 / image.width;
                }
                else {
                    scaleRatio = 48 / image.height;
                }
                image.scale = scaleRatio;
            }
            var render = _this.scene.make.renderTexture({
                width: image.displayWidth >> 0,
                height: image.displayHeight >> 0
            }, false);
            render.draw(image);
            render.snapshot(function (img) {
                resolve(img.src);
                image.destroy();
                render.destroy();
            });
        });
    };
    ElementEditorAnimations.prototype.clear = function () {
        this.clearDisplays();
        length = this.mMountArmatures.length;
        for (var i = length - 1; i >= 0; i--) {
            var element = this.mMountArmatures[i];
            element.destroy();
        }
        this.mMountArmatures.length = 0;
        this.mSelectedGameObjects.length = 0;
        if (this.mMountAnimationTimer) {
            this.mMountAnimationTimer.remove();
            this.mMountAnimationTimer = null;
        }
    };
    ElementEditorAnimations.prototype.clearDisplays = function () {
        this.mDisplays.forEach(function (element) {
            if (element) {
                element.parentContainer.destroy();
                element.destroy();
            }
        });
        this.mDisplays.clear();
    };
    ElementEditorAnimations.prototype.loadMountDragonBones = function () {
        // const res = Url.getRes("dragonbones");
        var res = "./resources_v" + version + "/dragonbones";
        var pngUrl = res + "/" + this.MOUNT_DRAGONBONES_KEY + "_tex.png";
        var jsonUrl = res + "/" + this.MOUNT_DRAGONBONES_KEY + "_tex.json";
        var dbbinUrl = res + "/" + this.MOUNT_DRAGONBONES_KEY + "_ske.dbbin";
        this.scene.load.dragonbone(this.MOUNT_DRAGONBONES_KEY, pngUrl, jsonUrl, dbbinUrl, null, null, { responseType: "arraybuffer" });
        this.scene.load.addListener(Phaser.Loader.Events.COMPLETE, this.dragonBoneLoaded, this);
        this.scene.load.start();
    };
    ElementEditorAnimations.prototype.dragonBoneLoaded = function () {
        if (!this.scene.textures.exists(this.MOUNT_DRAGONBONES_KEY))
            return;
        this.scene.load.removeListener(Phaser.Loader.Events.COMPLETE, this.dragonBoneLoaded, this);
        this.mDragonBonesLoaded = true;
        this.createMountDisplay();
        this.updatePlay();
    };
    ElementEditorAnimations.prototype.createMountDisplay = function () {
        if (!this.mAnimationData)
            return;
        if (!this.mDragonBonesLoaded)
            return;
        var data = this.mAnimationData.mountLayer;
        if (!data) {
            this.mMountArmatures.forEach(function (element) {
                element.visible = false;
            });
            return;
        }
        if (!this.mDragonBonesLoaded)
            return;
        if (data.mountPoint && this.mMountArmatures.length < data.mountPoint.length) {
            var count = data.mountPoint.length - this.mMountArmatures.length;
            for (var i = 0; i < count; i++) {
                var arm = this.scene.add.armature(this.MOUNT_ARMATURE_KEY, this.MOUNT_DRAGONBONES_KEY);
                this.cleatArmatureUnusedSlots(arm);
                this.mMountArmatureParent.add(arm);
                this.mMountArmatures.push(arm);
                arm.setInteractive(new Phaser.Geom.Rectangle(-42, -85, 85, 85), Phaser.Geom.Rectangle.Contains);
                this.updatePerInputEnabled(arm);
            }
        }
        var originPos = this.mGrids.getAnchor90Point();
        for (var i = 0; i < this.mMountArmatures.length; i++) {
            var element = this.mMountArmatures[i];
            if (!data.mountPoint || i >= data.mountPoint.length) {
                element.visible = false;
                continue;
            }
            var pos = { x: data.mountPoint[i].x + originPos.x, y: data.mountPoint[i].y + originPos.y };
            element.setPosition(pos.x, pos.y);
            element.visible = true;
        }
        this.mMountArmatureParent.setDepth(data.index);
        this.updateChildrenIdxByDepth();
    };
    ElementEditorAnimations.prototype.keyboardEvent = function (value) {
        if (!this.mAnimationData || this.mSelectedGameObjects.length <= 0) {
            return;
        }
        var operated = false;
        switch (value.keyCode) {
            case 37:
                this.mSelectedGameObjects.forEach(function (element) {
                    element.x--;
                });
                operated = true;
                break;
            case 38:
                this.mSelectedGameObjects.forEach(function (element) {
                    element.y--;
                });
                operated = true;
                break;
            case 39:
                this.mSelectedGameObjects.forEach(function (element) {
                    element.x++;
                });
                operated = true;
                break;
            case 40:
                this.mSelectedGameObjects.forEach(function (element) {
                    element.y++;
                });
                operated = true;
                break;
        }
        if (operated)
            this.syncPositionData();
    };
    ElementEditorAnimations.prototype.onDragStartHandler = function (pointer, gameObject) {
        var _this = this;
        // gameObject.alpha = 1;
        if (!this.mSelectedGameObjects.includes(gameObject)) {
            this.setSelectedGameObjects(gameObject);
        }
        if (gameObject instanceof Phaser.GameObjects.Sprite) {
            var sprite_1 = gameObject;
            this.mDisplays.forEach(function (val, key) {
                if (val === sprite_1) {
                    _this.mEmitter.emit(ElementEditorEmitType.Active_Animation_Layer, key);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Animation_Layer, key);
                    return;
                }
            });
        }
        else if (gameObject instanceof dragonBones.phaser.display.ArmatureDisplay) {
            var arm = gameObject;
            for (var i = 0; i < this.mMountArmatures.length; i++) {
                var element = this.mMountArmatures[i];
                if (element === arm) {
                    this.mEmitter.emit(ElementEditorEmitType.Active_Mount_Layer, i);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Mount_Layer, i);
                    return;
                }
            }
        }
    };
    ElementEditorAnimations.prototype.onDragHandler = function (pointer, gameObject, dragX, dragY) {
        var delta = { x: 0, y: 0 };
        this.mSelectedGameObjects.forEach(function (element) {
            if (element === gameObject) {
                delta.x = dragX - element.x;
                delta.y = dragY - element.y;
            }
        });
        this.mSelectedGameObjects.forEach(function (element) {
            element.x = element.x + delta.x;
            element.y = element.y + delta.y;
        });
    };
    ElementEditorAnimations.prototype.onDragEndHandler = function (pointer, gameobject) {
        // gameobject.alpha = 0.7;
        this.syncPositionData();
        // if (!this.mPlaying) this.generateFrameSumb();
    };
    ElementEditorAnimations.prototype.syncPositionData = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        var originPos = this.mGrids.getAnchor90Point();
        this.mDisplays.forEach(function (val, key) {
            var data = _this.mAnimationData.layerDict.get(key);
            var point = { x: val.x - originPos.x, y: val.y - originPos.y };
            if (!data.offsetLoc || data.offsetLoc.x !== point.x || data.offsetLoc.y !== point.y) {
                data.setOffsetLoc(point.x, point.y);
            }
        });
        var mountPoints = this.mAnimationData.mountLayer ? this.mAnimationData.mountLayer.mountPoint : null;
        if (mountPoints) {
            for (var i = 0; i < mountPoints.length; i++) {
                var data = mountPoints[i];
                var armature = this.mMountArmatures[i];
                var point = { x: armature.x - originPos.x, y: armature.y - originPos.y };
                if (point.x !== data.x || point.y !== data.y) {
                    data.x = point.x;
                    data.y = point.y;
                }
            }
        }
    };
    ElementEditorAnimations.prototype.createDisplays = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY))
            return;
        this.mAnimationData.layerDict.forEach(function (val, key) {
            _this.createDisplay(key);
        });
    };
    ElementEditorAnimations.prototype.createDisplay = function (idx) {
        if (!this.mAnimationData)
            return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY))
            return;
        if (!this.mAnimationData.layerDict.has(idx))
            return;
        if (this.mDisplays.has(idx))
            return;
        var data = this.mAnimationData.layerDict.get(idx);
        var originPos = this.mGrids.getAnchor90Point();
        var parentCon = this.scene.add.container(0, 0);
        this.add(parentCon);
        parentCon.setDepth(data.depth);
        this.updateChildrenIdxByDepth();
        var display = this.scene.make
            .sprite(undefined, false)
            .setOrigin(0, 0);
        // .setAlpha(0.7);
        parentCon.add(display);
        this.mDisplays.set(idx, display);
        var baseLoc = data.offsetLoc || { x: 0, y: 0 };
        display.x = originPos.x + baseLoc.x;
        display.y = originPos.y + baseLoc.y;
    };
    ElementEditorAnimations.prototype.updatePlay = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        if (!this.scene) {
            Logger.getInstance().error("no scene created");
            return;
        }
        if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
            this.mAnimationData.layerDict.forEach(function (val, key) {
                if (!_this.mDisplays.has(key))
                    return;
                var display = _this.mDisplays.get(key);
                if (!val.layerVisible) {
                    display.visible = false;
                    return;
                }
                if (_this.mPlaying) {
                    var animationName = _this.mAnimationData.name + "_" + key;
                    _this.makeAnimation(animationName, val.frameName, val.frameVisible, _this.mAnimationData.frameRate, _this.mAnimationData.frameDuration, _this.mAnimationData.loop);
                    display.visible = true;
                    display.play(animationName);
                }
                else {
                    display.anims.stop();
                    if (_this.mCurFrameIdx >= val.frameName.length) {
                        Logger.getInstance().warn("wrong frame idx: " + _this.mCurFrameIdx + "; frameName.length: " + val.frameName.length);
                        display.visible = false;
                        return;
                    }
                    var frameName = val.frameName[_this.mCurFrameIdx];
                    if (!_this.scene.textures.get(SPRITE_SHEET_KEY).has(frameName)) {
                        Logger.getInstance().warn("donot have frame: " + frameName);
                        display.visible = false;
                        return;
                    }
                    display.setTexture(SPRITE_SHEET_KEY, frameName);
                    if (display.input) {
                        display.input.hitArea.setSize(display.displayWidth, display.displayHeight);
                    }
                    else {
                        display.setInteractive();
                    }
                    _this.updatePerInputEnabled(display);
                    if (!val.frameVisible || _this.mCurFrameIdx < val.frameVisible.length) {
                        display.visible = val.frameVisible ? val.frameVisible[_this.mCurFrameIdx] : true;
                    }
                }
            });
        }
        if (this.mMountAnimationTimer) {
            this.mMountAnimationTimer.remove();
            this.mMountAnimationTimer = null;
        }
        var mountlayer = this.mAnimationData.mountLayer;
        if (!mountlayer || !mountlayer.mountPoint)
            return;
        var firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (mountlayer.frameVisible && mountlayer.frameVisible.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; mountlayer.frameVisible.length: " + mountlayer.frameVisible.length);
            return;
        }
        for (var i = 0; i < mountlayer.mountPoint.length; i++) {
            if (i >= this.mMountArmatures.length)
                continue;
            var armature = this.mMountArmatures[i];
            if (this.mPlaying) {
                this.mMountAnimationTimer = this.scene.time.addEvent({
                    delay: 0,
                    timeScale: this.MOUNT_ANIMATION_TIME_SCALE,
                    callback: this.onMountTimerEvent,
                    callbackScope: this,
                    loop: this.mAnimationData.loop
                });
            }
            else {
                if (mountlayer.frameVisible && this.mCurFrameIdx < mountlayer.frameVisible.length) {
                    var mountPointsVisible = mountlayer.frameVisible[this.mCurFrameIdx];
                    var visible = this.getMaskValue(mountPointsVisible, i);
                    armature.visible = visible;
                }
                else {
                    armature.visible = true;
                }
            }
        }
        // if (!this.mPlaying) this.generateFrameSumb();
    };
    ElementEditorAnimations.prototype.onMountTimerEvent = function () {
        var _this = this;
        if (!this.mAnimationData || !this.mAnimationData.mountLayer || !this.mAnimationData.mountLayer.mountPoint) {
            Logger.getInstance().error("no data");
            return;
        }
        var mountlayer = this.mAnimationData.mountLayer;
        var frameDuration = [];
        var firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (!firstLayer) {
            Logger.getInstance().error("no layer data");
            return;
        }
        if (firstLayer.frameName.length === 0) {
            Logger.getInstance().error("wrong frame length");
            return;
        }
        if (this.mAnimationData.frameDuration && this.mAnimationData.frameDuration.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; frameDuration.length: " + this.mAnimationData.frameDuration.length);
            return;
        }
        for (var i = 0; i < firstLayer.frameName.length; i++) {
            var dur = this.mAnimationData.frameDuration ? this.mAnimationData.frameDuration[i] : 0;
            frameDuration.push(1 / this.mAnimationData.frameRate + dur);
        }
        var t = 0;
        var f = 0;
        var curFrame = 0;
        frameDuration.forEach(function (dur) {
            t += dur;
            if (_this.mMountAnimationTimer.getElapsedSeconds() < t) {
                curFrame = f;
                return;
            }
            f++;
        });
        if (mountlayer.frameVisible && mountlayer.frameVisible.length <= curFrame) {
            Logger.getInstance().error("wrong frame idx: " + curFrame);
            return;
        }
        for (var i = 0; i < mountlayer.mountPoint.length; i++) {
            if (i >= this.mMountArmatures.length)
                continue;
            var armature = this.mMountArmatures[i];
            if (mountlayer.frameVisible) {
                var mountPointsVisible = mountlayer.frameVisible[curFrame];
                var visible = this.getMaskValue(mountPointsVisible, i);
                armature.visible = visible;
            }
            else {
                armature.visible = true;
            }
        }
    };
    ElementEditorAnimations.prototype.makeAnimation = function (animationName, frameName, frameVisible, frameRate, frameDuration, loop) {
        if (frameVisible && frameName.length !== frameVisible.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameVisible.length: " + frameVisible.length);
            return;
        }
        if (frameDuration && frameName.length !== frameDuration.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + frameName.length + "; frameDuration.length: " + frameDuration.length);
            return;
        }
        if (this.scene.anims.exists(animationName)) {
            this.scene.anims.remove(animationName);
        }
        var frames = [];
        for (var i = 0; i < frameName.length; i++) {
            var frame = frameName[i];
            var visible = frameVisible ? frameVisible[i] : true;
            if (frameDuration) {
                frames.push({ key: SPRITE_SHEET_KEY, frame: frame, duration: frameDuration[i] * 1000, visible: visible });
            }
            else {
                frames.push({ key: SPRITE_SHEET_KEY, frame: frame, visible: visible });
            }
        }
        var repeat = loop ? -1 : 1;
        var config = {
            key: animationName,
            frames: frames,
            frameRate: frameRate,
            repeat: repeat
        };
        this.scene.anims.create(config);
    };
    ElementEditorAnimations.prototype.setSelectedGameObjects = function (gos) {
        this.mSelectedGameObjects.length = 0;
        this.mSelectedGameObjects = [].concat(gos);
        // 显示选中状态
        Logger.getInstance().debug("select game objects: ", this.mSelectedGameObjects);
    };
    // // 转换数组idx为深度/层序列
    // private getDepthByArrayIdx(idx: number): number {
    //     if (!this.mAnimationData) return 0;
    //     if (!this.mAnimationData.mountLayer) return idx;
    //     const mountIdx = this.mAnimationData.mountLayer.index;
    //     const depth = idx <= mountIdx ? idx : idx + 1;
    //     return depth;
    // }
    // // 根据换层序列获取层（序列帧层/互动点层）
    // private getLayerByLayerIdx(val: number) {
    //     let layers = [];
    //     if (!this.mAnimationData) return layers;
    //     if (!this.mAnimationData.mountLayer) {
    //         if (val < this.mDisplays.length) layers.push(this.mDisplays[val]);
    //     }
    //     const mountIdx = this.mAnimationData.mountLayer.index;
    //     if (val === mountIdx + 1) {
    //         layers = layers.concat(this.mMountArmatures);
    //     } else if (val < mountIdx + 1) {
    //         if (val < this.mDisplays.length) layers.push(this.mDisplays[val]);
    //     } else {// val > mountIdx + 1
    //         val = val - 1;
    //         if (val < this.mDisplays.length) layers.push(this.mDisplays[val]);
    //     }
    //     return layers;
    // }
    ElementEditorAnimations.prototype.getMaskValue = function (mask, idx) {
        return ((mask >> idx) % 2) === 1;
    };
    ElementEditorAnimations.prototype.generateFrameSumb = function () {
        var _this = this;
        this.mGrids.visible = false;
        this.scene.game.renderer.snapshot(function (img) {
            _this.mEmitter.emit(ElementEditorEmitType.Update_Frame_Sumb, _this.mCurFrameIdx, img.src);
            _this.mGrids.visible = true;
        });
    };
    ElementEditorAnimations.prototype.updateInputEnabled = function () {
        var _this = this;
        this.mDisplays.forEach(function (display) {
            _this.updatePerInputEnabled(display);
        });
        this.mMountArmatures.forEach(function (arm) {
            _this.updatePerInputEnabled(arm);
        });
    };
    ElementEditorAnimations.prototype.updatePerInputEnabled = function (element) {
        if (element.input)
            this.scene.input.setDraggable(element, this.mInteractive);
    };
    ElementEditorAnimations.prototype.updateChildrenIdxByDepth = function () {
        this.list = this.list.sort(function (a, b) {
            var ac = a;
            var bc = b;
            return ac.depth - bc.depth;
        });
    };
    ElementEditorAnimations.prototype.cleatArmatureUnusedSlots = function (armatureDisplay) {
        armatureDisplay.armature.getSlots().forEach(function (slot) {
            if (slot) {
                var visible = slot.name.includes("base") ||
                    slot.name.includes("eyes") ||
                    slot.name.includes("mous") ||
                    (slot.name.includes("hair") && !slot.name.includes("back"));
                slot.display.visible = visible;
            }
        });
    };
    return ElementEditorAnimations;
}(Phaser.GameObjects.Container));
export default ElementEditorAnimations;
//# sourceMappingURL=element.editor.animations.js.map