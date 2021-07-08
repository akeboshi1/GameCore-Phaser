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
import { Font } from "structure";
import { MainUIScene } from "../scenes";
var GuideEffect = /** @class */ (function (_super) {
    __extends_1(GuideEffect, _super);
    function GuideEffect(scene, tmpScale, url) {
        if (tmpScale === void 0) { tmpScale = 1; }
        var _this = _super.call(this, scene) || this;
        _this.tmpScale = tmpScale;
        _this.url = url;
        _this.mInitialized = false;
        _this.mScale = 1;
        _this.mResources = new Map();
        _this.mScale *= _this.tmpScale;
        _this.preload();
        return _this;
    }
    GuideEffect.prototype.preload = function () {
        var _this = this;
        var index = 0;
        // this.mResources.set("guideMask", { key: "guideMask", url: "guide/mask.png", type: "image" });
        this.mResources.set("guideBg", { key: "guideBg", url: "guide/guideBg.png", type: "image" });
        this.mResources.set("handEffect", { key: "handEffect", url: "ui/fall_effect/falleffect.png", data: "ui/fall_effect/falleffect.json", type: "atlas" });
        if (this.mResources) {
            this.mResources.forEach(function (resource) {
                if (!_this.scene.textures.exists(resource.key)) {
                    index++;
                    if (resource.type) {
                        if (_this.scene.load[resource.type]) {
                            _this.scene.load[resource.type](resource.key, _this.url.getRes(resource.url), _this.url.getRes(resource.data));
                        }
                    }
                }
            }, this);
        }
        if (index > 0) {
            this.addListen();
            this.scene.load.start();
        }
        else {
            if (this.mResources)
                this.mResources.clear();
            this.setInitialize(true);
        }
    };
    GuideEffect.prototype.createGuideEffect = function (pos, text) {
        if (!this.mInitialized) {
            this.mCachePos = pos;
            this.mCacheText = text;
            return;
        }
        var width = this.scene.cameras.main.width;
        var height = this.scene.cameras.main.height;
        this.setSize(width, height);
        if (!this.mGuideEffect) {
            this.mGuideEffect = this.scene.make.image({ x: 0, y: 0, key: "guideBg" });
            this.mGuideEffect.setOrigin(0, 0);
            // image调整尺寸只能调整frame的尺寸
            this.mGuideEffect.frame.setSize(width + 20, height + 20);
            this.mGuideEffect.setPosition(0, 0);
            this.mHandDisplay = new HandDisplay(this.scene, "handEffect");
            this.mHandDisplay.scale = this.tmpScale;
            this.guideText = this.scene.make.text({
                style: {
                    fontSize: 18 * this.tmpScale + "px",
                    fontFamily: Font.DEFULT_FONT,
                    color: "#ffffff"
                }
            }).setOrigin(0.5);
            this.scene.layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mGuideEffect);
            this.scene.layerManager.addToLayer(MainUIScene.LAYER_MASK, this.mHandDisplay);
            this.scene.layerManager.addToLayer(MainUIScene.LAYER_MASK, this.guideText);
        }
        this.setGuideText(text);
        this.updatePos(pos);
        // this.setInteractive(new Phaser.Geom.Rectangle(width >> 1, height >> 1, width, height), Phaser.Geom.Rectangle.Contains);
        this.start();
    };
    GuideEffect.prototype.setGuideText = function (text) {
        this.guideText.text = text;
    };
    GuideEffect.prototype.updatePos = function (pos) {
        if (!this.mMask) {
            this.mMask = this.scene.make.graphics(undefined);
            this.mMask.fillStyle(0);
            this.mMask.fillCircle(0, 0, 50);
            this.mMask.setPosition(pos.x, pos.y);
            var geometryMask = this.mMask.createGeometryMask().setInvertAlpha(true);
            this.mGuideEffect.setMask(geometryMask);
        }
        else {
            this.mMask.setPosition(pos.x, pos.y);
            // const self = this;
            // this.scene.tweens.add({
            //     targets: self.mMask,
            //     duration: 200,
            //     ease: "Linear",
            //     props: {
            //         scaleX: { value: 1 },
            //         scaleY: { value: 1 },
            //     },
            // });
        }
        if (this.mHandDisplay)
            this.mHandDisplay.setPosition(pos.x, pos.y);
        if (this.guideText) {
            var textWidth = this.guideText.width;
            this.guideText.setPosition(pos.x, pos.y + 70 * this.tmpScale);
            var leftx = pos.x - textWidth * 0.5;
            var rightx = pos.x + textWidth * 0.5;
            if (leftx < 0)
                this.guideText.x = pos.x + textWidth * 0.5;
            if (rightx > this.width)
                this.guideText.x = pos.x - textWidth * 0.5;
        }
    };
    GuideEffect.prototype.start = function () {
        this.scaleTween();
    };
    GuideEffect.prototype.stop = function () {
        if (this.mScaleTween) {
            this.mScaleTween.stop();
            this.mScaleTween = null;
        }
    };
    GuideEffect.prototype.scaleTween = function () {
        var _this = this;
        if (this.mScaleTween || !this.scene) {
            return;
        }
        var self = this;
        this.mScaleTween = this.scene.tweens.add({
            targets: self.mMask,
            duration: 700,
            ease: "Linear",
            props: {
                scaleX: { value: self.mScale > 0.5 * this.tmpScale ? 0.5 * this.tmpScale : 1 * this.tmpScale },
                scaleY: { value: self.mScale > 0.5 * this.tmpScale ? 0.5 * this.tmpScale : 1 * this.tmpScale },
            },
            onComplete: function () {
                self.mScale = self.mScale > 0.5 * _this.tmpScale ? 0.5 * _this.tmpScale : 1 * _this.tmpScale;
                if (self.mScaleTween) {
                    self.mScaleTween = undefined;
                }
                self.scaleTween();
            },
        });
    };
    GuideEffect.prototype.destroy = function () {
        this.disableInteractive();
        this.stop();
        if (this.mGuideEffect) {
            this.mGuideEffect.destroy();
            this.mGuideEffect = null;
        }
        if (this.mHandDisplay) {
            this.mHandDisplay.destroy();
            this.mHandDisplay = null;
        }
        if (this.guideText) {
            this.guideText.destroy();
            this.guideText = null;
        }
        if (this.mMask) {
            this.mMask.clear();
            this.mMask.destroy();
            this.mMask = null;
        }
        this.setInitialize(false);
        this.removeListen();
        _super.prototype.destroy.call(this);
    };
    GuideEffect.prototype.setInitialize = function (val) {
        this.mInitialized = val;
        if (val && this.mCachePos)
            this.createGuideEffect(this.mCachePos, this.mCacheText);
    };
    GuideEffect.prototype.addListen = function () {
        if (this.scene) {
            this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
            this.scene.load.on(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
        }
    };
    GuideEffect.prototype.removeListen = function () {
        if (this.scene) {
            this.scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, this.loadError, this);
            this.scene.load.off(Phaser.Loader.Events.FILE_COMPLETE, this.loadImageHandler, this);
        }
    };
    GuideEffect.prototype.loadImageHandler = function (key) {
        if (!this.mResources)
            return;
        if (this.mResources.has(key)) {
            this.mResources.delete(key);
        }
        if (this.mResources.size === 0) {
            this.setInitialize(true);
            this.removeListen();
        }
    };
    GuideEffect.prototype.loadError = function (file) {
        if (!this.mResources) {
            return;
        }
        this.loadImageHandler(file.key);
    };
    return GuideEffect;
}(Phaser.GameObjects.Container));
export { GuideEffect };
var HandDisplay = /** @class */ (function (_super) {
    __extends_1(HandDisplay, _super);
    function HandDisplay(scene, key) {
        var _this = _super.call(this, scene) || this;
        _this.mImage = scene.make.sprite({
            key: key,
            x: 9,
            y: -20
        }, false);
        _this.add(_this.mImage);
        var config = {
            key: "hand_enable",
            frames: _this.scene.anims.generateFrameNames("handEffect", { prefix: "enable", end: 3, zeroPad: 2 }),
            frameRate: 4,
            repeat: -1
        };
        _this.scene.anims.create(config);
        _this.mImage.play("hand_enable");
        return _this;
    }
    return HandDisplay;
}(Phaser.GameObjects.Container));
//# sourceMappingURL=guide.effect.js.map