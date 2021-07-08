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
var BaseAnimation = /** @class */ (function (_super) {
    __extends_1(BaseAnimation, _super);
    function BaseAnimation(scene) {
        var _this = _super.call(this, scene) || this;
        _this.loaded = false;
        _this.isPlaying = false;
        _this.loop = false;
        return _this;
    }
    BaseAnimation.prototype.load = function (resName, textureUrl, jsonUrl) {
        this.clear();
        this.resName = resName ? resName : textureUrl;
        this.curAniName = resName;
        this.textureUrl = textureUrl;
    };
    BaseAnimation.prototype.play = function (aniName) {
        if (aniName)
            this.curAniName = aniName;
        this.isPlaying = true;
    };
    BaseAnimation.prototype.clear = function () {
        if (this.animUrlData)
            this.animUrlData.dispose();
        this.animUrlData = undefined;
        this.curAniName = undefined;
        this.isPlaying = false;
        this.loaded = false;
        this.loop = false;
    };
    BaseAnimation.prototype.destroy = function () {
        this.clear();
        _super.prototype.destroy.call(this);
    };
    BaseAnimation.prototype.onLoadComplete = function (loader, totalComplete, totalFailed) {
    };
    return BaseAnimation;
}(Phaser.GameObjects.Container));
export { BaseAnimation };
//# sourceMappingURL=base.animation.js.map