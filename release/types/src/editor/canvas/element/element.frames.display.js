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
import { SPRITE_SHEET_KEY, IMAGE_BLANK_KEY } from "./element.editor.resource.manager";
import { Logger } from "structure";
import { BaseFramesDisplay } from "baseRender";
import { AnimationModel } from "structure";
import { DragonbonesEditorDisplay } from "./dragonbones.editor.display";
import { ElementEditorEmitType } from "./element.editor.type";
var ElementFramesDisplay = /** @class */ (function (_super) {
    __extends_1(ElementFramesDisplay, _super);
    function ElementFramesDisplay(scene, node, grids, emitter, mConfig) {
        var _this = _super.call(this, scene, { resPath: mConfig.LOCAL_HOME_PATH, osdPath: mConfig.osd }) || this;
        _this.mConfig = mConfig;
        _this.MOUNT_ANIMATION_TIME_SCALE = 1000 / 12;
        _this.mSelectedGameObjects = [];
        // private mMountArmatureParent: Phaser.GameObjects.Container;
        _this.mCurFrameIdx = 0;
        _this.mPlaying = false;
        _this.mCurMountAnimation = { name: "idle", flip: false };
        _this.mGrids = grids;
        _this.mEmitter = emitter;
        _this.mMountList = new Map();
        var parentContainer = scene.add.container(0, 0);
        parentContainer.add(_this);
        // this.mMountArmatureParent = scene.add.container(0, 0);
        // this.add(this.mMountArmatureParent);
        _this.scene.input.on("dragstart", _this.onDragStartHandler, _this);
        _this.scene.input.on("drag", _this.onDragHandler, _this);
        _this.scene.input.on("dragend", _this.onDragEndHandler, _this);
        _this.scene.input.keyboard.on("keydown", _this.keyboardEvent, _this);
        // init data
        _this.setAnimationData(node);
        return _this;
    }
    ElementFramesDisplay.prototype.setAnimationData = function (data) {
        this.clear();
        this.mAnimationData = data;
        this.mCurFrameIdx = 0;
        this.mPlaying = false;
        this.mIsInteracitve = true;
        if (!this.mAnimationData) {
            Logger.getInstance().warn("选择动画错误!");
            return;
        }
        Logger.getInstance().debug("setAnimationData: ", data);
        // this.play({ name: data.name, flip: false });
        var originPos = this.mGrids.getAnchor90Point();
        this.x = originPos.x;
        this.y = originPos.y;
        this.updatePlay();
    };
    ElementFramesDisplay.prototype.onResourcesLoaded = function () {
        this.clearDisplay();
        this.createDisplays();
        this.updatePlay();
    };
    ElementFramesDisplay.prototype.onResourcesCleared = function () {
        this.clearDisplay();
    };
    ElementFramesDisplay.prototype.setFrame = function (frameIdx) {
        this.mCurFrameIdx = frameIdx;
        this.updatePlay();
    };
    ElementFramesDisplay.prototype.setMountAnimation = function (aniName, idx) {
        var _this = this;
        this.mCurMountAnimation.name = aniName;
        if (idx !== undefined) {
            if (!this.mMountList.get(idx)) {
                Logger.getInstance().warn("wrong idx: " + idx);
                return;
            }
            var arm = this.mMountList.get(idx);
            if (arm)
                arm.play(this.mCurMountAnimation);
        }
        else {
            this.mMountList.forEach(function (val) {
                val.play(_this.mCurMountAnimation);
            });
        }
    };
    ElementFramesDisplay.prototype.updateMountDisplay = function () {
        this.updateMountLayerPlay();
    };
    ElementFramesDisplay.prototype.setPlay = function (playing) {
        this.mPlaying = playing;
        this.updatePlay();
    };
    ElementFramesDisplay.prototype.setInputEnabled = function (val) {
        this.mIsInteracitve = val;
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
    ElementFramesDisplay.prototype.setSelectedAnimationLayer = function (idxs) {
        var _this = this;
        var gos = [];
        idxs.forEach(function (idx) {
            if (_this.mDisplays.has(idx)) {
                gos = gos.concat(_this.mDisplays.get(idx));
            }
        });
        this.setSelectedGameObjects(gos);
    };
    ElementFramesDisplay.prototype.setSelectedMountLayer = function (mountPointIndex) {
        if (mountPointIndex !== undefined) {
            if (!this.mMountList.get(mountPointIndex)) {
                Logger.getInstance().warn("wrong idx: " + mountPointIndex);
                return;
            }
            this.setSelectedGameObjects(this.mMountList.get(mountPointIndex));
        }
        else {
            // 全选所有挂载点
            var arr = Array.from(this.mMountList.values());
            this.setSelectedGameObjects(arr);
        }
    };
    ElementFramesDisplay.prototype.updateDepth = function () {
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
        // if (this.mMountArmatureParent) {
        //     this.mMountArmatureParent.setDepth(this.mAnimationData.mountLayer.index);
        // }
        if (this.mMountContainer) {
            this.mMountContainer.setDepth(this.mAnimationData.mountLayer.index);
        }
        this.updateChildrenIdxByDepth();
    };
    ElementFramesDisplay.prototype.updatePerAnimationLayerVisible = function (idx) {
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
    ElementFramesDisplay.prototype.addAnimationLayer = function (idx) {
        // this.createDisplay(idx);
        throw new Error("todo add AnimationLayer");
        this.updatePlay();
    };
    ElementFramesDisplay.prototype.updateAnimationLayer = function () {
        this.clearDisplay();
        this.createDisplays();
        this.updatePlay();
    };
    ElementFramesDisplay.prototype.updateOffsetLoc = function (idx) {
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
        var baseLoc = data.offsetLoc || { x: 0, y: 0 };
        display.x = baseLoc.x;
        display.y = baseLoc.y;
    };
    ElementFramesDisplay.prototype.generateThumbnail = function () {
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
    ElementFramesDisplay.prototype.clear = function () {
        this.clearDisplay();
        this.mSelectedGameObjects.length = 0;
        this.mDisplayDatas.clear();
    };
    ElementFramesDisplay.prototype.clearDisplay = function () {
        var _this = this;
        this.mDisplays.forEach(function (element) {
            if (element) {
                element.destroy();
            }
        });
        this.mDisplays.clear();
        this.mMountList.forEach(function (val) {
            _this.unmount(val);
            val.destroy(true);
        });
        this.mMountList.clear();
        _super.prototype.clearDisplay.call(this);
    };
    ElementFramesDisplay.prototype.makeAnimation = function (gen, key, frameName, frameVisible, frameRate, loop, frameDuration) {
        if (this.scene.anims.exists(key)) {
            this.scene.anims.remove(key);
        }
        _super.prototype.makeAnimation.call(this, gen, key, frameName, frameVisible, frameRate, loop, frameDuration);
    };
    ElementFramesDisplay.prototype.createDisplays = function (key, ani) {
        if (!this.mAnimationData)
            return;
        if (!this.scene.textures.exists(SPRITE_SHEET_KEY))
            return;
        _super.prototype.createDisplays.call(this, SPRITE_SHEET_KEY, this.mAnimationData.createProtocolObject());
        // this.mAnimationData.layerDict.forEach((val, key) => {
        // this.createDisplay(key);
        // });
    };
    ElementFramesDisplay.prototype.dragonBoneLoaded = function () {
        // if (!this.scene.textures.exists(this.MOUNT_DRAGONBONES_KEY)) return;
        // this.scene.load.removeListener(
        //     Phaser.Loader.Events.COMPLETE,
        //     this.dragonBoneLoaded,
        //     this);
        // this.mDragonBonesLoaded = true;
        // this.createMountDisplay();
        // this.updatePlay();
    };
    ElementFramesDisplay.prototype.keyboardEvent = function (value) {
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
    ElementFramesDisplay.prototype.onDragStartHandler = function (pointer, gameObject) {
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
            var arm_1 = gameObject;
            this.mMountList.forEach(function (val, key) {
                if (val === arm_1) {
                    _this.mEmitter.emit(ElementEditorEmitType.Active_Mount_Layer, key);
                    Logger.getInstance().debug(ElementEditorEmitType.Active_Mount_Layer, key);
                    return;
                }
            });
        }
    };
    ElementFramesDisplay.prototype.onDragHandler = function (pointer, gameObject, dragX, dragY) {
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
    ElementFramesDisplay.prototype.onDragEndHandler = function (pointer, gameobject) {
        // gameobject.alpha = 0.7;
        this.syncPositionData();
        // if (!this.mPlaying) this.generateFrameSumb();
    };
    ElementFramesDisplay.prototype.syncPositionData = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        this.mDisplays.forEach(function (val, key) {
            var data = _this.mAnimationData.layerDict.get(key);
            // const point = { x: val.x, y: val.y };
            var x = val.x, y = val.y;
            x -= val.width * 0.5;
            y -= val.height * 0.5;
            if (!data.offsetLoc || data.offsetLoc.x !== x || data.offsetLoc.y !== y) {
                data.setOffsetLoc(x, y);
            }
        });
        var mountPoints = this.mAnimationData.mountLayer ? this.mAnimationData.mountLayer.mountPoint : null;
        if (mountPoints) {
            for (var i = 0; i < mountPoints.length; i++) {
                var data = mountPoints[i];
                var mountObject = this.mMountList.get(i);
                var x = mountObject.x, y = mountObject.y;
                if (x !== data.x || y !== data.y) {
                    data.x = x;
                    data.y = y;
                }
            }
        }
    };
    ElementFramesDisplay.prototype.updatePlay = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        if (!this.scene) {
            Logger.getInstance().error("no scene created");
            return;
        }
        this.mDisplayDatas.clear();
        var anis = new Map();
        anis.set(this.mAnimationData.name, new AnimationModel(this.mAnimationData.createProtocolObject()));
        this.load({
            discriminator: "FramesModel",
            id: 0,
            gene: SPRITE_SHEET_KEY,
            animations: anis,
            animationName: this.mAnimationData.name
        });
        // this.mCurAnimation = this.mAnimationData.createProtocolObject();
        if (this.scene.textures.exists(SPRITE_SHEET_KEY)) {
            var index_1 = 0;
            this.play({ name: this.mAnimationData.name, flip: false });
            this.mAnimationData.layerDict.forEach(function (val, key) {
                var display = _this.mDisplays.get(key);
                if (!display)
                    return;
                if (!val.layerVisible) {
                    display.visible = false;
                    return;
                }
                var isSprite = display instanceof Phaser.GameObjects.Sprite;
                if (_this.mPlaying) {
                    // const animationName = `${this.framesInfo.gene}_${this.mAnimationData.name}_${index}`;
                    // this.makeAnimation(SPRITE_SHEET_KEY, animationName, val.frameName, val.frameVisible, this.mAnimationData.frameRate, this.mAnimationData.loop, this.mAnimationData.frameDuration);
                    display.visible = true;
                    // if (isSprite) (<Phaser.GameObjects.Sprite>display).play(animationName);
                }
                else {
                    if (isSprite)
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
                    // if (display.input) {
                    // display.input.hitArea.setSize(display.displayWidth, display.displayHeight);
                    // } else {
                    display.setInteractive();
                    // this.updateBaseLoc(display, false, val.offsetLoc);
                    // }
                    _this.updatePerInputEnabled(display);
                    if (!val.frameVisible || _this.mCurFrameIdx < val.frameVisible.length) {
                        display.visible = val.frameVisible ? val.frameVisible[_this.mCurFrameIdx] : true;
                    }
                }
                index_1++;
            });
        }
        this.updateMountLayerPlay();
        // if (!this.mPlaying) this.generateFrameSumb();
    };
    ElementFramesDisplay.prototype.updateMountLayerPlay = function () {
        var _this = this;
        if (!this.mAnimationData)
            return;
        var mountlayer = this.mAnimationData.mountLayer;
        this.mMountList.forEach(function (val) {
            _this.unmount(val);
            val.destroy(true);
        });
        this.mMountList.clear();
        if (!mountlayer || !mountlayer.mountPoint)
            return;
        for (var i = 0; i < mountlayer.mountPoint.length; i++) {
            if (this.mMountList.get(i))
                continue;
            var arm = new DragonbonesEditorDisplay(this.scene, this.mConfig.osd);
            this.mount(arm, i);
            arm.load();
            var pos = { x: mountlayer.mountPoint[i].x, y: mountlayer.mountPoint[i].y };
            arm.setPosition(pos.x, pos.y);
            arm.play(this.mCurMountAnimation);
            arm.visible = true;
        }
        // this.mMountArmatureParent.setDepth(data.index);
        this.updateChildrenIdxByDepth();
        var firstLayer = this.mAnimationData.layerDict.values().next().value;
        if (mountlayer.frameVisible && mountlayer.frameVisible.length !== firstLayer.frameName.length) {
            Logger.getInstance().error("wrong data: frameName.length: " + firstLayer.frameName.length + "; mountlayer.frameVisible.length: " + mountlayer.frameVisible.length);
            return;
        }
        for (var i = 0; i < mountlayer.mountPoint.length; i++) {
            if (!this.mMountList.get(i))
                continue;
            var armature = this.mMountList.get(i);
            if (this.mPlaying) {
                // this.mMountAnimationTimer = this.scene.time.addEvent({
                //     delay: 0,
                //     timeScale: this.MOUNT_ANIMATION_TIME_SCALE,
                //     callback: this.onMountTimerEvent,
                //     callbackScope: this,
                //     loop: this.mAnimationData.loop
                // });
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
    };
    ElementFramesDisplay.prototype.onMountTimerEvent = function () {
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
        // frameDuration.forEach((dur) => {
        //     t += dur;
        //     if (this.mMountAnimationTimer.getElapsedSeconds() < t) {
        //         curFrame = f;
        //         return;
        //     }
        //     f++;
        // });
        // TODO
        // if (mountlayer.frameVisible && mountlayer.frameVisible.length <= curFrame) {
        //     Logger.getInstance().error("wrong frame idx: " + curFrame);
        //     return;
        // }
        for (var i = 0; i < mountlayer.mountPoint.length; i++) {
            if (!this.mMountList.get(i))
                continue;
            var armature = this.mMountList.get(i);
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
    ElementFramesDisplay.prototype.setSelectedGameObjects = function (gos) {
        this.mSelectedGameObjects.length = 0;
        this.mSelectedGameObjects = [].concat(gos);
        // 显示选中状态
        Logger.getInstance().debug("select game objects: ", this.mSelectedGameObjects);
    };
    ElementFramesDisplay.prototype.getMaskValue = function (mask, idx) {
        return ((mask >> idx) % 2) === 1;
    };
    ElementFramesDisplay.prototype.updateInputEnabled = function () {
        var _this = this;
        this.mDisplays.forEach(function (display) {
            _this.updatePerInputEnabled(display);
        });
        this.mMountList.forEach(function (arm) {
            arm.setDraggable(_this.mIsInteracitve);
        });
    };
    ElementFramesDisplay.prototype.updatePerInputEnabled = function (element) {
        if (element.input)
            this.scene.input.setDraggable(element, this.mIsInteracitve);
    };
    ElementFramesDisplay.prototype.updateChildrenIdxByDepth = function () {
        this.list = this.list.sort(function (a, b) {
            var ac = a;
            var bc = b;
            return ac.depth - bc.depth;
        });
    };
    return ElementFramesDisplay;
}(BaseFramesDisplay));
export { ElementFramesDisplay };
//# sourceMappingURL=element.frames.display.js.map