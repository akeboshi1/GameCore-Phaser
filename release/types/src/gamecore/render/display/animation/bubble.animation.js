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
var BubbleAnimation = /** @class */ (function (_super) {
    __extends_1(BubbleAnimation, _super);
    function BubbleAnimation(scene) {
        return _super.call(this, scene) || this;
    }
    BubbleAnimation.prototype.load = function (resName, textureUrl, jsonUrl) {
        _super.prototype.load.call(this, resName, textureUrl, jsonUrl);
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, this.textureUrl, jsonUrl);
        else
            this.animUrlData.setDisplayData(textureUrl, jsonUrl);
        this.scene.load.image(this.resName, this.animUrlData.pngUrl);
        this.scene.load.image(this.animUrlData.jsonUrl, this.animUrlData.jsonUrl);
        this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
        this.scene.load.start();
    };
    BubbleAnimation.prototype.play = function (aniName) {
        _super.prototype.play.call(this, aniName);
        if (!this.frameAnim)
            return;
        this.setScale(0.2, 0.2);
        this.y = 50;
        this.scene.tweens.add({
            targets: this,
            y: { value: -100, duration: 300, ease: "Bounce.easeOut" },
            scaleX: { value: 1, duration: 300, ease: "Bounce.easeOut" },
            scaleY: { value: 1, duration: 300, ease: "Bounce.easeOut" },
        });
    };
    BubbleAnimation.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.frameAnim)
            this.frameAnim.destroy();
        if (this.bubblebg)
            this.bubblebg.destroy();
        this.frameAnim = null;
        this.bubblebg = null;
    };
    BubbleAnimation.prototype.onLoadComplete = function (loader, totalComplete, totalFailed) {
        this.loaded = true;
        this.bubblebg = this.scene.add.image(0, 0, this.resName);
        this.frameAnim = this.scene.add.image(0, 0, this.animUrlData.jsonUrl);
        this.add([this.bubblebg, this.frameAnim]);
        if (this.isPlaying)
            this.play();
    };
    return BubbleAnimation;
}(BaseAnimation));
export { BubbleAnimation };
//# sourceMappingURL=bubble.animation.js.map