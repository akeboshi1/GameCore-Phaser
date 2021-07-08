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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Panel } from "apowophaserui";
import { MainUIScene } from "../../scenes/main.ui.scene";
import { UiUtils } from "utils";
import { Logger } from "structure";
import { Export } from "webworker-rpc";
var BaseBatchPanel = /** @class */ (function (_super) {
    __extends_1(BaseBatchPanel, _super);
    function BaseBatchPanel(scene, render) {
        var _this = _super.call(this, scene, render) || this;
        _this.mTweening = false;
        _this.mWidth = 0;
        _this.mHeight = 0;
        _this.mReloadTimes = 0;
        _this.key = "";
        _this.uiLayer = MainUIScene.LAYER_UI;
        _this.exported = false;
        _this.exportListeners = [];
        _this.mSynchronize = false;
        if (!scene.sys)
            Logger.getInstance().error("no scene system");
        _this.mScene = scene;
        _this.mWorld = render;
        _this.mInitialized = false;
        _this.render = render;
        if (render) {
            _this.dpr = Math.round(render.uiRatio || UiUtils.baseDpr);
            _this.scale = _this.mWorld.uiScale;
        }
        return _this;
    }
    Object.defineProperty(BaseBatchPanel.prototype, "initialized", {
        get: function () {
            return this.mInitialized;
        },
        enumerable: true,
        configurable: true
    });
    BaseBatchPanel.prototype.resize = function (wid, hei) {
        _super.prototype.resize.call(this, wid, hei);
        this.setSize(wid, hei);
    };
    BaseBatchPanel.prototype.startLoad = function () {
        if (!this.scene) {
            return;
        }
        this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onFileKeyComplete, this);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.loadComplete, this);
        this.scene.load.start();
    };
    BaseBatchPanel.prototype.show = function (param) {
        this.mSynchronize = false;
        _super.prototype.show.call(this, param);
        if (!this.mInitialized)
            return;
        if (!this.mSynchronize)
            this.onShow();
    };
    BaseBatchPanel.prototype.hide = function () {
        this.onHide();
        if (this.soundGroup && this.soundGroup.close)
            this.playSound(this.soundGroup.close);
        if (!this.mTweening && this.mTweenBoo) {
            this.showTween(false);
        }
        else {
            this.destroy();
        }
    };
    BaseBatchPanel.prototype.destroy = function () {
        if (this.render && this.render.hasOwnProperty(this.key))
            delete this.render[this.key];
        this.exportListeners.length = 0;
        _super.prototype.destroy.call(this);
    };
    BaseBatchPanel.prototype.addExportListener = function (f) {
        if (this.exported) {
            f();
            return;
        }
        this.exportListeners.push(f);
    };
    BaseBatchPanel.prototype.preload = function () {
        var _this = this;
        this.mPreLoad = true;
        if (!this.scene) {
            return;
        }
        var index = 0;
        if (this.mResources) {
            this.mResources.forEach(function (resource, key) {
                // if (!this.scene.textures.exists(key)) {
                //     index++;
                //     this.addResources(key, resource);
                // }
                if (!_this.cacheExists(resource.type, key)) {
                    index++;
                    _this.addResources(key, resource);
                }
            }, this);
        }
        if (index > 0) {
            this.startLoad();
        }
        else {
            if (this.mResources)
                this.mResources.clear();
            this.mPreLoad = false;
            this.init();
            this.mSynchronize = true;
        }
    };
    BaseBatchPanel.prototype.init = function () {
        // 异步过程中存在某些ui在销毁之前初始化完成
        if (this.mScene && this.mScene.sys && this.mScene.sys.displayList) {
            this.mScene.layerManager.addToLayer(this.uiLayer, this);
            _super.prototype.init.call(this);
            this.setLinear(this.key);
            Logger.getInstance().debug("init========", this.key);
            this.__exportProperty();
            this.onInitialized();
        }
    };
    BaseBatchPanel.prototype.setLinear = function (key) {
        if (!key) {
            return;
        }
        var frame = this.scene.textures.getFrame(key, "__BASE");
        if (frame)
            frame.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    };
    BaseBatchPanel.prototype.addResources = function (key, resource) {
        var resType = resource.type;
        if (resType) {
            if (this.scene.load[resType]) {
                this.scene.load[resource.type](key, resType !== "video" ? this.render.url.getUIRes(resource.dpr, resource.texture) : this.render.url.getNormalUIRes(resource.texture), resource.data ? (resType !== "video" ? this.render.url.getUIRes(resource.dpr, resource.data) : this.render.url.getNormalUIRes(resource.data)) : undefined);
            }
        }
        _super.prototype.addResources.call(this, key, resource);
    };
    BaseBatchPanel.prototype.cacheExists = function (type, key) {
        if (type === "image" || type === "atlas" || type === "texture") {
            return this.scene.textures.exists(key);
        }
        else if (type === "json" || type === "video") {
            return this.scene.cache[type].exists(key);
        }
        return false;
    };
    Object.defineProperty(BaseBatchPanel.prototype, "scaleWidth", {
        get: function () {
            var width = this.scene.cameras.main.width / this.scale;
            return width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseBatchPanel.prototype, "scaleHeight", {
        get: function () {
            var height = this.scene.cameras.main.height / this.scale;
            return height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseBatchPanel.prototype, "cameraWidth", {
        get: function () {
            var width = this.scene.cameras.main.width;
            return width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BaseBatchPanel.prototype, "cameraHeight", {
        get: function () {
            var height = this.scene.cameras.main.height;
            return height;
        },
        enumerable: true,
        configurable: true
    });
    BaseBatchPanel.prototype.__exportProperty = function () {
        if (!this.render) {
            return;
        }
        return this.render.exportProperty(this, this.render, this.key).onceReady(this.exportComplete.bind(this));
    };
    BaseBatchPanel.prototype.exportComplete = function () {
        this.exported = true;
        for (var _i = 0, _a = this.exportListeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener();
        }
        this.exportListeners.length = 0;
    };
    BaseBatchPanel.prototype.onShow = function () {
    };
    BaseBatchPanel.prototype.onHide = function () {
        this.render.uiManager.hideBatchPanel(this);
    };
    BaseBatchPanel.prototype.onInitialized = function () {
    };
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "initialized", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "resize", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "startLoad", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "show", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "hide", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "destroy", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "addExportListener", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "preload", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "init", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "setLinear", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "addResources", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "cacheExists", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "scaleWidth", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "scaleHeight", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "cameraWidth", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "cameraHeight", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "__exportProperty", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "exportComplete", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "onShow", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "onHide", null);
    __decorate([
        Export()
    ], BaseBatchPanel.prototype, "onInitialized", null);
    return BaseBatchPanel;
}(Panel));
export { BaseBatchPanel };
//# sourceMappingURL=base.batch.panel.js.map