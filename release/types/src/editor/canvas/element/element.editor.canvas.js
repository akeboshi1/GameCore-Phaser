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
import { EditorCanvas } from "../editor.canvas";
import ElementEditorGrids from "./element.editor.grids";
import ElementEditorResourceManager from "./element.editor.resource.manager";
import { ElementFramesDisplay } from "./element.frames.display";
import { Logger } from "structure";
import { ElementEditorBrushType } from "./element.editor.type";
/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn1Ez79LjYywnNiAGbaP35Tc
 */
var ElementEditorCanvas = /** @class */ (function (_super) {
    __extends_1(ElementEditorCanvas, _super);
    function ElementEditorCanvas(config) {
        var _this = _super.call(this, config) || this;
        _this.SCENEKEY = "ElementEditorScene";
        _this.ERROR_UNINITED = "canvas not inited";
        _this.GAME_SIZE = { w: 1600, h: 900 };
        Logger.getInstance().debug("ElementEditorCanvas.constructor()");
        _this.mGame.scene.add(_this.SCENEKEY, ElementEditorScene);
        // start
        _this.mData = config.node; // ElementNode
        _this.mResManager = new ElementEditorResourceManager(_this.mData, _this.mEmitter, _this.mConfig.LOCAL_HOME_PATH);
        _this.mGame.scene.start(_this.SCENEKEY, _this);
        return _this;
    }
    ElementEditorCanvas.prototype.destroy = function () {
        Logger.getInstance().debug("ElementEditorCanvas.destroy()");
        if (this.mData) {
            this.mData = null;
        }
        if (this.mResManager) {
            if (this.mAnimations) {
                this.mResManager.removeResourcesChangeListener(this.mAnimations);
            }
            this.mResManager.destroy();
        }
        if (this.mGrids) {
            this.mGrids.clear();
            this.mGrids.destroy();
        }
        if (this.mAnimations) {
            this.mAnimations.clear();
            this.mAnimations.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    ElementEditorCanvas.prototype.getScene = function () {
        if (this.mGame)
            return this.mGame.scene.getScene(this.SCENEKEY);
        return null;
    };
    ElementEditorCanvas.prototype.onSceneCreated = function () {
        // this.mGame.scale.setGameSize(this.GAME_SIZE.w, this.GAME_SIZE.h);
        var scene = this.getScene();
        this.mGrids = new ElementEditorGrids(scene, this.mData.animations.getDefaultAnimationData());
        this.mAnimations = new ElementFramesDisplay(scene, this.mData.animations.getDefaultAnimationData(), this.mGrids, this.mEmitter, this.mConfig);
        // this.mAnimations = new ElementEditorAnimations(scene, this.mData.animations.getDefaultAnimationData(), this.mGrids, this.mEmitter);
        this.mResManager.init(scene);
        this.mResManager.addResourcesChangeListener(this.mAnimations);
        // this.initCameraPosition();
    };
    ElementEditorCanvas.prototype.onSceneDestroy = function () {
        if (this.mGrids)
            this.mGrids.clear();
        if (this.mAnimations)
            this.mAnimations.clear();
    };
    //#region command from game-editor
    // 监听事件
    ElementEditorCanvas.prototype.on = function (event, fn, context) {
        this.mEmitter.on(event, fn, context);
    };
    ElementEditorCanvas.prototype.off = function (event, fn, context, once) {
        this.mEmitter.off(event, fn, context, once);
    };
    // 解析数据
    ElementEditorCanvas.prototype.deserializeDisplay = function () {
        return this.mResManager.deserializeDisplay();
    };
    // 合图
    ElementEditorCanvas.prototype.generateSpriteSheet = function (images) {
        return this.mResManager.generateSpriteSheet(images);
    };
    // 重新加载DisplayNode
    ElementEditorCanvas.prototype.reloadDisplayNode = function () {
        this.mResManager.loadResources();
    };
    // 切换动画
    ElementEditorCanvas.prototype.changeAnimationData = function (animationDataId) {
        if (!this.mGrids || !this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        var aniData = this.mData.animations.getAnimationData(animationDataId);
        this.mGrids.setAnimationData(aniData);
        this.mAnimations.setAnimationData(aniData);
    };
    // 控制播放帧
    ElementEditorCanvas.prototype.selectFrame = function (frameIndex) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.setFrame(frameIndex);
    };
    // 控制播放
    ElementEditorCanvas.prototype.playAnimation = function () {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.setPlay(true);
    };
    ElementEditorCanvas.prototype.stopAnimation = function () {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.setPlay(false);
    };
    // 切换画笔信息
    ElementEditorCanvas.prototype.changeBrush = function (mode) {
        if (!this.mGrids || !this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mGrids.changeBrush(mode);
        this.mAnimations.setInputEnabled(mode === ElementEditorBrushType.Drag);
    };
    // 选择动画图层
    ElementEditorCanvas.prototype.selectAnimationLayer = function (layerIndexs) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.setSelectedAnimationLayer(layerIndexs);
    };
    // 选择挂载点图层
    ElementEditorCanvas.prototype.selectMountLayer = function (mountPointIndex) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.setSelectedMountLayer(mountPointIndex);
    };
    // 更新深度
    ElementEditorCanvas.prototype.updateDepth = function () {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.updateDepth();
    };
    // 更新动画层
    ElementEditorCanvas.prototype.updateAnimationLayer = function () {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.updateAnimationLayer();
    };
    // 控制挂载点动画播放
    ElementEditorCanvas.prototype.toggleMountPointAnimationPlay = function (playerAnimationName, mountPointIndex) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.setMountAnimation(playerAnimationName, mountPointIndex);
    };
    // 更新挂载层
    ElementEditorCanvas.prototype.updateMountLayer = function () {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.updateMountDisplay();
    };
    ElementEditorCanvas.prototype.updateOffsetLoc = function (layerIndexs) {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        this.mAnimations.updateOffsetLoc(layerIndexs);
    };
    // 生成缩略图
    ElementEditorCanvas.prototype.generateThumbnail = function () {
        if (!this.mAnimations) {
            Logger.getInstance().error(this.ERROR_UNINITED);
            return;
        }
        return this.mAnimations.generateThumbnail();
    };
    //#endregion
    ElementEditorCanvas.prototype.initCameraPosition = function () {
        var gameSize = this.mGame.scale.gameSize;
        var cam = this.getScene().cameras.main;
        cam.setPosition(-(gameSize.width / 2 - this.mConfig.width / 2), -(gameSize.height / 2 - this.mConfig.height / 2));
    };
    return ElementEditorCanvas;
}(EditorCanvas));
export { ElementEditorCanvas };
var ElementEditorScene = /** @class */ (function (_super) {
    __extends_1(ElementEditorScene, _super);
    function ElementEditorScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ElementEditorScene.prototype.init = function (canvas) {
        this.mCanvas = canvas;
    };
    ElementEditorScene.prototype.create = function (game) {
        if (this.mCanvas)
            this.mCanvas.onSceneCreated();
    };
    ElementEditorScene.prototype.destroy = function () {
        if (this.mCanvas)
            this.mCanvas.onSceneDestroy();
    };
    return ElementEditorScene;
}(Phaser.Scene));
//# sourceMappingURL=element.editor.canvas.js.map