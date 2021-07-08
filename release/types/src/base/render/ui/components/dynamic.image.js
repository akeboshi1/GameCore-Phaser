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
import { Logger } from "structure";
var DynamicImage = /** @class */ (function (_super) {
    __extends_1(DynamicImage, _super);
    function DynamicImage(scene, x, y, key, frame) {
        return _super.call(this, scene, x, y, key, frame) || this;
    }
    DynamicImage.prototype.load = function (value, loadContext, completeCallBack, errorCallBack) {
        if (!value)
            return Logger.getInstance().error("load value is undefined");
        this.mLoadCompleteCallbak = completeCallBack;
        this.mLoadErrorCallback = errorCallBack;
        this.mLoadContext = loadContext;
        if (!this.scene) {
            Logger.getInstance().fatal(DynamicImage.name + " Create failed does not exist");
            return;
        }
        this.mUrl = value;
        if (this.scene.textures.exists(value)) {
            this.onLoadComplete(value);
        }
        else {
            this.scene.load.image(value, value);
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        }
    };
    DynamicImage.prototype.destroy = function (fromScene) {
        if (fromScene === void 0) { fromScene = false; }
        this.mLoadCompleteCallbak = null;
        this.mLoadContext = null;
        this.mLoadErrorCallback = null;
        this.mUrl = "";
        if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
        }
        _super.prototype.destroy.call(this, fromScene);
    };
    DynamicImage.prototype.onLoadComplete = function (file) {
        if (file === this.mUrl) {
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.onLoadComplete, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.setTexture(this.mUrl);
            //  this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            if (this.mLoadCompleteCallbak) {
                var cb = this.mLoadCompleteCallbak;
                this.mLoadCompleteCallbak = null;
                cb.call(this.mLoadContext);
                this.mLoadContext = null;
            }
        }
    };
    DynamicImage.prototype.onLoadError = function (file) {
        if (this.mUrl === file.url) {
            if (this.mLoadErrorCallback) {
                var cb = this.mLoadErrorCallback;
                this.mLoadErrorCallback = null;
                cb.call(this.mLoadContext);
                this.mLoadContext = null;
            }
        }
    };
    return DynamicImage;
}(Phaser.GameObjects.Image));
export { DynamicImage };
//# sourceMappingURL=dynamic.image.js.map