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
var DynamicSprite = /** @class */ (function (_super) {
    __extends_1(DynamicSprite, _super);
    function DynamicSprite(scene, x, y) {
        var _this = _super.call(this, scene, x, y, undefined) || this;
        scene.sys.updateList.add(_this);
        return _this;
    }
    DynamicSprite.prototype.load = function (textureURL, atlasURL, loadContext, completeCallBack, errorCallBack) {
        this.mLoadCompleteCallbak = completeCallBack;
        this.mLoadErrorCallback = errorCallBack;
        this.mLoadContext = loadContext;
        this.mUrl = textureURL + atlasURL;
        if (this.scene.cache.obj.get(this.mUrl)) {
            this.onLoadComplete();
        }
        else {
            this.scene.load.atlas(this.mUrl, textureURL, atlasURL);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
            this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
            this.scene.load.start();
        }
    };
    DynamicSprite.prototype.destroy = function (fromScene) {
        this.scene.sys.updateList.remove(this);
        _super.prototype.destroy.call(this, fromScene);
    };
    DynamicSprite.prototype.onLoadComplete = function () {
        if (this.mLoadCompleteCallbak) {
            var cb = this.mLoadCompleteCallbak;
            this.mLoadCompleteCallbak = null;
            cb.call(this.mLoadContext);
            this.mLoadContext = null;
        }
        this.scene.anims.create({
            key: this.mUrl,
            frames: this.scene.anims.generateFrameNames(this.mUrl),
            repeat: 1
        });
        this.play(this.mUrl);
        // this.setTexture(this.mUrl);
    };
    DynamicSprite.prototype.onLoadError = function (file) {
        if (this.mUrl === file.url) {
            if (this.mLoadErrorCallback) {
                var cb = this.mLoadErrorCallback;
                this.mLoadErrorCallback = null;
                cb.call(this.mLoadContext);
                this.mLoadContext = null;
            }
        }
    };
    return DynamicSprite;
}(Phaser.GameObjects.Sprite));
export { DynamicSprite };
//# sourceMappingURL=dynamic.sprite.js.map