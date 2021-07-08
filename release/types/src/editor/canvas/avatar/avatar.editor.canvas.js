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
import { AvatarEditorDragonbone } from "./avatar.editor.dragonbone";
import { Logger } from "structure";
/**
 * api:https://dej4esdop1.feishu.cn/docs/doccn2zhhTyXaB3HYm69a0sIYhh
 * 尺寸规范链接：https://dej4esdop1.feishu.cn/docs/doccn5QVnqQ9XQz5baCBayOy49f?from=from_copylink
 */
var AvatarEditorCanvas = /** @class */ (function (_super) {
    __extends_1(AvatarEditorCanvas, _super);
    function AvatarEditorCanvas(config) {
        var _this = _super.call(this, config) || this;
        _this.SCENEKEY = "AvatarEditorScene";
        _this.SCENEKEY_SNAPSHOT = "AvatarEditorSnapshotScene";
        Logger.getInstance().debug("AvatarEditorCanvas.constructor()");
        _this.mGame.scene.add(_this.SCENEKEY, AvatarEditorScene);
        // start
        _this.mData = config.node;
        _this.mGame.scene.start(_this.SCENEKEY, { onCreated: _this.onSceneCreated.bind(_this), onUpdate: _this.update.bind(_this), onDestroy: _this.onSceneDestroy.bind(_this), resPath: _this.mConfig.LOCAL_HOME_PATH });
        return _this;
    }
    AvatarEditorCanvas.prototype.destroy = function () {
        Logger.getInstance().debug("AvatarEditorCanvas.destroy()");
        if (this.mData) {
            this.mData = null;
        }
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
        _super.prototype.destroy.call(this);
    };
    AvatarEditorCanvas.prototype.getScene = function () {
        if (this.mGame)
            return this.mGame.scene.getScene(this.SCENEKEY);
        return null;
    };
    AvatarEditorCanvas.prototype.onSceneCreated = function (scene) {
        this.mDragonbone = new AvatarEditorDragonbone(scene, this.mConfig.LOCAL_HOME_PATH, this.mConfig.osd, this.mEmitter, true);
    };
    AvatarEditorCanvas.prototype.update = function () {
    };
    AvatarEditorCanvas.prototype.onSceneDestroy = function () {
        this.mData = null;
        if (this.mDragonbone) {
            this.mDragonbone.destroy();
        }
    };
    AvatarEditorCanvas.prototype.loadLocalResources = function (img, part, dir, layer) {
        if (this.mDragonbone)
            return this.mDragonbone.loadLocalResources(img, part, dir);
        return Promise.reject("not init yet");
    };
    AvatarEditorCanvas.prototype.toggleFacing = function (dir) {
        if (this.mDragonbone)
            this.mDragonbone.setDir(dir);
    };
    AvatarEditorCanvas.prototype.play = function (animationName) {
        if (this.mDragonbone)
            this.mDragonbone.play(animationName);
    };
    AvatarEditorCanvas.prototype.clearParts = function () {
        if (this.mDragonbone)
            this.mDragonbone.clearParts();
    };
    AvatarEditorCanvas.prototype.mergeParts = function (sets) {
        if (this.mDragonbone)
            this.mDragonbone.mergeParts(sets);
    };
    AvatarEditorCanvas.prototype.cancelParts = function (sets) {
        if (this.mDragonbone)
            this.mDragonbone.cancelParts(sets);
    };
    AvatarEditorCanvas.prototype.generateShopIcon = function (width, height) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // 使用width height 创建新的场景
            var curScene = _this.getScene();
            var curSets = _this.mDragonbone.curSets;
            if (_this.mGame.scene.getScene(_this.SCENEKEY_SNAPSHOT)) {
                // is running
                Logger.getInstance().error("generating!");
                reject("generating!");
                return;
            }
            // resize game
            _this.mGame.scale.resize(width, height);
            _this.mGame.scene.add(_this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            curScene.scene.launch(_this.SCENEKEY_SNAPSHOT, {
                onCreated: function (s) {
                    var a = new AvatarEditorDragonbone(s, _this.mConfig.LOCAL_HOME_PATH, _this.mConfig.osd, _this.mEmitter, true, curSets, function (dragonbone) {
                        dragonbone.generateShopIcon(width, height).then(function (src) {
                            resolve(src);
                            // resize game
                            _this.mGame.scale.resize(_this.mConfig.width, _this.mConfig.height);
                            _this.mGame.scene.stop(_this.SCENEKEY_SNAPSHOT);
                            _this.mGame.scene.remove(_this.SCENEKEY_SNAPSHOT);
                        });
                    });
                }
            });
        });
    };
    AvatarEditorCanvas.prototype.generateHeadIcon = function (width, height) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // 使用width height 创建新的场景
            var curScene = _this.getScene();
            var curSets = _this.mDragonbone.curSets;
            if (_this.mGame.scene.getScene(_this.SCENEKEY_SNAPSHOT)) {
                // is running
                Logger.getInstance().error("generating!");
                reject("generating!");
                return;
            }
            _this.mGame.scene.add(_this.SCENEKEY_SNAPSHOT, AvatarEditorScene, false);
            curScene.scene.launch(_this.SCENEKEY_SNAPSHOT, {
                onCreated: function (s) {
                    _this.mGame.scene.sendToBack(_this.SCENEKEY_SNAPSHOT);
                    var a = new AvatarEditorDragonbone(s, _this.mConfig.LOCAL_HOME_PATH, _this.mConfig.osd, _this.mEmitter, false, curSets, function (dragonbone) {
                        dragonbone.generateHeadIcon().then(function (src) {
                            resolve(src);
                            _this.mGame.scene.stop(_this.SCENEKEY_SNAPSHOT);
                            _this.mGame.scene.remove(_this.SCENEKEY_SNAPSHOT);
                        });
                    });
                }
            });
        });
    };
    // 监听事件
    AvatarEditorCanvas.prototype.on = function (event, fn, context) {
        this.mEmitter.on(event, fn, context);
    };
    AvatarEditorCanvas.prototype.off = function (event, fn, context, once) {
        this.mEmitter.off(event, fn, context, once);
    };
    return AvatarEditorCanvas;
}(EditorCanvas));
export { AvatarEditorCanvas };
var AvatarEditorScene = /** @class */ (function (_super) {
    __extends_1(AvatarEditorScene, _super);
    function AvatarEditorScene() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AvatarEditorScene.prototype.preload = function () {
        Logger.getInstance().debug("AvatarEditorScene preload");
        this.game.plugins.installScenePlugin("DragonBones", dragonBones.phaser.plugin.DragonBonesScenePlugin, "dragonbone", this, true);
        this.load.image("avatar_placeholder", this.resPath + "dragonbones/avatar.png");
    };
    AvatarEditorScene.prototype.init = function (data) {
        this.onSceneCreated = data.onCreated;
        this.onSceneUpdate = data.onUpdate;
        this.onSceneDestroy = data.onDestroy;
        this.resPath = data.resPath;
    };
    AvatarEditorScene.prototype.create = function () {
        if (this.onSceneCreated)
            this.onSceneCreated(this);
    };
    AvatarEditorScene.prototype.update = function () {
        if (this.onSceneUpdate)
            this.onSceneUpdate();
    };
    AvatarEditorScene.prototype.destroy = function () {
        if (this.onSceneDestroy)
            this.onSceneDestroy();
    };
    return AvatarEditorScene;
}(Phaser.Scene));
export { AvatarEditorScene };
export var AvatarEditorEmitType;
(function (AvatarEditorEmitType) {
    AvatarEditorEmitType["ERROR"] = "error";
})(AvatarEditorEmitType || (AvatarEditorEmitType = {}));
//# sourceMappingURL=avatar.editor.canvas.js.map