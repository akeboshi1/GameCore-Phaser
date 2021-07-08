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
var FrameAnimation = /** @class */ (function (_super) {
    __extends_1(FrameAnimation, _super);
    function FrameAnimation(scene) {
        return _super.call(this, scene) || this;
    }
    // this.resName = resName;
    //     this.pngUrl = resUrl + "/" + resName + (!isbone ? ".png" : "_tex.png");
    //     this.jsonUrl = resUrl + "/" + resName + (!isbone ? ".json" : "_tex.json");
    //     if (isbone)
    //         this.boneUrl = resUrl + "/" + resName + "_ske" + extension;
    FrameAnimation.prototype.load = function (resName, textureUrl, jsonUrl, compl) {
        _super.prototype.load.call(this, resName, textureUrl, jsonUrl);
        this.complHandler = compl;
        this.animUrlData = new AnimationUrlData();
        if (resName)
            this.animUrlData.setData(this.resName, textureUrl, jsonUrl);
        else
            this.animUrlData.setDisplayData(textureUrl, jsonUrl);
        if (this.scene.textures.exists(this.resName)) {
            this.onLoadComplete();
        }
        else {
            this.scene.load.atlas(this.resName, this.animUrlData.pngUrl, this.animUrlData.jsonUrl, this.animUrlData.textureXhrSettings, this.animUrlData.atlasXhrSettings);
            this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
            this.scene.load.start();
        }
    };
    FrameAnimation.prototype.play = function (aniName) {
        _super.prototype.play.call(this, aniName);
        if (!this.frameAnim)
            return;
        this.frameAnim.play(this.curAniName);
    };
    FrameAnimation.prototype.destroy = function () {
        this.complHandler = undefined;
        _super.prototype.destroy.call(this);
    };
    FrameAnimation.prototype.onLoadComplete = function (loader, totalComplete, totalFailed) {
        this.loaded = true;
        // this.scene.anims.generateFrameNames(this.resName, { prefix: "diamond_", end: 15, zeroPad: 4 }),
        if (!this.scene.anims.exists(this.curAniName)) {
            this.scene.anims.create({
                key: this.curAniName,
                frames: this.scene.anims.generateFrameNames(this.resName),
                // frames: this.scene.anims.generateFrameNames(this.resName, { prefix: "loading_ui_", start: 1, end: 45, zeroPad: 2 }),
                repeat: -1
            });
        }
        if (!this.frameAnim) {
            this.frameAnim = this.scene.add.sprite(0, 0, this.resName);
            this.add(this.frameAnim);
        }
        if (this.width === 0) {
            this.setSize(this.frameAnim.width, this.frameAnim.height);
            this.scale = 1;
        }
        else {
            this.scale = this.width / this.frameAnim.displayWidth;
        }
        if (!this.isPlaying)
            this.play(this.curAniName);
        if (this.complHandler)
            this.complHandler.run();
    };
    return FrameAnimation;
}(BaseAnimation));
export { FrameAnimation };
//# sourceMappingURL=frame.animation.js.map