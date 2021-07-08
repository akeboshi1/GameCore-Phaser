import { NineSlicePatch } from "apowophaserui";
var DynamicNinepatch = /** @class */ (function () {
    function DynamicNinepatch(mScene, mParent) {
        this.mScene = mScene;
        this.mParent = mParent;
    }
    DynamicNinepatch.prototype.load = function (value, config, completeCallBack, loadContext) {
        this.mLoadCompleteCallBack = completeCallBack;
        this.mLoadContext = loadContext;
        this.mConfig = config;
        this.mUrl = value;
        if (this.mScene.cache.obj.get(value)) {
            this.onLoadCompleteHandler();
        }
        else {
            this.mScene.load.image(this.mUrl, this.mUrl);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        }
    };
    DynamicNinepatch.prototype.onLoadCompleteHandler = function () {
        // x: number, y: number, width: number, height: number, key: string, frame: string
        this.mImage = new NineSlicePatch(this.mScene, 0, 0, this.mConfig.width, this.mConfig.height, this.mConfig.key, undefined, this.mConfig.config, this.mConfig.scale);
        if (this.mLoadCompleteCallBack) {
            this.mLoadCompleteCallBack.call(this.mLoadContext, this.mImage);
            this.mLoadCompleteCallBack = null;
            this.mLoadContext = null;
        }
    };
    Object.defineProperty(DynamicNinepatch.prototype, "image", {
        get: function () {
            return this.mImage;
        },
        enumerable: true,
        configurable: true
    });
    return DynamicNinepatch;
}());
export { DynamicNinepatch };
//# sourceMappingURL=dynamic.ninepatch.js.map