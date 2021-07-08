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
import { DynamicNinepatch } from "../../ui/components/dynamic.ninepatch";
import { BBCodeText } from "apowophaserui";
import { Font } from "structure";
var Bubble = /** @class */ (function (_super) {
    __extends_1(Bubble, _super);
    function Bubble(scene, scale, url) {
        var _this = _super.call(this, scene) || this;
        _this.url = url;
        _this.mMinWidth = 0;
        _this.mMinHeight = 0;
        _this.mScale = scale;
        return _this;
        // this.x = 40 * scale;
    }
    Bubble.prototype.show = function (text, bubble) {
        this.mChatContent = new BBCodeText(this.scene, 0, 0, text, {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 14 * this.mScale,
            color: "#000000",
            origin: { x: 0, y: 0 },
            wrap: { width: 200 * this.mScale, mode: "character" }
        }).setOrigin(0.5, 0.5);
        this.add(this.mChatContent);
        var _minH = 50 * this.mScale;
        var _minW = 100 * this.mScale;
        this.mMinHeight = this.mChatContent.height + 30 * this.mScale;
        this.mMinHeight = this.mMinHeight < _minH ? _minH : this.mMinHeight;
        this.mMinWidth = this.mChatContent.width + 30 * this.mScale;
        this.mMinWidth = this.mMinWidth < _minW ? _minW : this.mMinWidth;
        this.y = this.mMinHeight;
        this.mBubbleBg = new DynamicNinepatch(this.scene, this);
        var path_back = bubble.bubbleResource || "platformitem/thumbnail/bubble_01.png";
        var res = this.url.getOsdRes(path_back);
        this.mBubbleBg.load(res, {
            width: this.mMinWidth / this.mScale,
            height: this.mMinHeight / this.mScale,
            key: res,
            scale: 1,
            config: {
                left: 20,
                top: 28,
                right: 20,
                bottom: 10
            }
        }, this.onComplete, this);
    };
    Bubble.prototype.tweenTo = function (toY) {
        toY += this.mMinHeight;
        this.mToY = toY;
        this.scene.tweens.add({
            targets: this,
            y: toY,
            alpha: 1,
            duration: 200
        });
    };
    Bubble.prototype.durationRemove = function (duration, callback, callbackContext) {
        var _this = this;
        this.mTweenCompleteCallback = callback;
        this.mTweenCallContext = callbackContext;
        this.mRemoveDelay = setTimeout(function () {
            _this.removeTween();
        }, duration);
    };
    Bubble.prototype.removeTween = function () {
        var _this = this;
        var endY = this.mToY - 30;
        var tween = this.scene.tweens.add({
            targets: this,
            y: endY,
            alpha: 0,
            duration: 200,
            onComplete: function () {
                if (_this.mTweenCompleteCallback) {
                    _this.mTweenCompleteCallback.call(_this.mTweenCallContext, _this);
                }
            }
        });
    };
    Bubble.prototype.destroy = function () {
        // if (this.mChatContent) {
        //     this.mChatContent.destroy(true);
        // }
        // this.mChatContent = null;
        this.mMinWidth = 0;
        this.mMinHeight = 0;
        this.mToY = 0;
        this.mTweenCompleteCallback = null;
        this.mTweenCallContext = null;
        if (this.mRemoveDelay) {
            clearTimeout(this.mRemoveDelay);
        }
        _super.prototype.destroy.call(this, true);
    };
    Bubble.prototype.onComplete = function (img) {
        if (img && this.scene) {
            img.scale = this.mScale;
            this.addAt(img, 0);
            img.y = -img.displayHeight >> 1;
            this.mChatContent.y = -(img.displayHeight >> 1) + 8 * this.mScale;
            // img.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    };
    Object.defineProperty(Bubble.prototype, "minWidth", {
        get: function () {
            return this.mMinWidth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bubble.prototype, "minHeight", {
        get: function () {
            return this.mMinHeight;
        },
        enumerable: true,
        configurable: true
    });
    return Bubble;
}(Phaser.GameObjects.Container));
export { Bubble };
//# sourceMappingURL=bubble.js.map