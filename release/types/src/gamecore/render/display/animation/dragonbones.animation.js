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
import { BaseAnimation } from "./base.animation";
import { AnimationUrlData } from "./ianimationbase";
var DragonbonesAnimation = /** @class */ (function (_super) {
    __extends_1(DragonbonesAnimation, _super);
    function DragonbonesAnimation(scene) {
        return _super.call(this, scene) || this;
    }
    DragonbonesAnimation.prototype.load = function (resName, textureUrl, jsonUrl, boneUrl) {
        _super.prototype.load.call(this, resName, textureUrl, jsonUrl);
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, this.textureUrl, boneUrl, ".dbbin");
        else
            this.animUrlData.setDisplayData(textureUrl, jsonUrl);
        this.scene.load.dragonbone(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl, this.animUrlData.boneUrl, this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings, this.animUrlData.boneXhrSettings);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
        this.scene.load.start();
    };
    DragonbonesAnimation.prototype.play = function (aniName) {
        _super.prototype.play.call(this, aniName);
        if (!this.armatureDisplay)
            return;
        this.armatureDisplay.animation.play(aniName);
    };
    DragonbonesAnimation.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.armatureDisplay)
            this.armatureDisplay.destroy();
        this.armatureDisplay = null;
    };
    // TODO ：功能暂未完成 armature->规格暂定
    DragonbonesAnimation.prototype.onLoadComplete = function (loader, totalComplete, totalFailed) {
        this.loaded = true;
        this.armatureDisplay = this.scene.add.armature("mecha_1002_101d", this.resName);
        this.add(this.armatureDisplay);
        if (this.isPlaying)
            this.play(this.curAniName);
    };
    return DragonbonesAnimation;
}(BaseAnimation));
export { DragonbonesAnimation };
//# sourceMappingURL=dragonbones.animation.js.map