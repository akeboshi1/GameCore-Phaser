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
import { ClickEvent } from "apowophaserui";
import { UiUtils } from "utils";
import { ButtonEventDispatcher } from "./button.event.dispatch";
var BackgroundScaleButton = /** @class */ (function (_super) {
    __extends_1(BackgroundScaleButton, _super);
    function BackgroundScaleButton(scene, width, height, key, frame, downFrame, text, dpr, scale, tweenBoo, music) {
        var _this = _super.call(this, scene, 0, 0) || this;
        _this.mDownTime = 0;
        _this.dpr = dpr || UiUtils.baseDpr;
        // this.scale = scale || 1;
        _this.zoom = scale || UiUtils.baseScale;
        _this.soundGroup = {
            up: {
                key: "click",
            }
        };
        if (tweenBoo === undefined)
            tweenBoo = true;
        _this.mTweenBoo = tweenBoo;
        Object.assign(_this.soundGroup, music);
        _this.mKey = key;
        _this.mFrame = frame;
        _this.mDownFrame = downFrame;
        _this.setSize(width, height);
        _this.createBackground();
        if (text) {
            _this.mText = _this.scene.make.text({ style: { color: "#ffffff", fontSize: 16 * dpr + "px" } }, false)
                .setOrigin(0.5, 0.5)
                .setText(text);
            if (_this.mBackground) {
                _this.mText.setSize(_this.mBackground.width, _this.mBackground.height);
            }
            _this.add(_this.mText);
        }
        _this.setInteractive();
        _this.addListen();
        return _this;
    }
    Object.defineProperty(BackgroundScaleButton.prototype, "background", {
        get: function () {
            return this.mBackground;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BackgroundScaleButton.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    BackgroundScaleButton.prototype.setEnable = function (value, tint) {
        if (tint === void 0) { tint = true; }
        if (value) {
            if (this.mBackground) {
                this.mBackground.clearTint();
                if (this.mText)
                    this.mText.clearTint();
            }
            this.setInteractive();
        }
        else {
            if (this.mBackground && tint) {
                this.mBackground.setTintFill(0x666666);
                if (this.mText)
                    this.mText.setTintFill(0x777777);
            }
            this.removeInteractive();
        }
    };
    Object.defineProperty(BackgroundScaleButton.prototype, "tweenEnable", {
        set: function (value) {
            this.mTweenBoo = value;
        },
        enumerable: true,
        configurable: true
    });
    BackgroundScaleButton.prototype.mute = function (boo) {
        this.silent = boo;
    };
    BackgroundScaleButton.prototype.changeNormal = function () {
        this.setBgFrame(this.mFrame);
    };
    BackgroundScaleButton.prototype.changeDown = function () {
        if (this.mDownFrame) {
            this.setBgFrame(this.mDownFrame);
        }
    };
    BackgroundScaleButton.prototype.setFrame = function (frame) {
        this.setBgFrame(frame);
    };
    BackgroundScaleButton.prototype.setText = function (val) {
        if (this.mText) {
            this.mText.setText(val);
        }
    };
    BackgroundScaleButton.prototype.setTextStyle = function (style) {
        if (this.mText) {
            this.mText.setStyle(style);
        }
    };
    BackgroundScaleButton.prototype.setFontStyle = function (val) {
        if (this.mText) {
            this.mText.setFontStyle(val);
        }
    };
    BackgroundScaleButton.prototype.setTextOffset = function (x, y) {
        if (this.mText) {
            this.mText.setPosition(x, y);
        }
    };
    BackgroundScaleButton.prototype.setTextColor = function (color) {
        if (this.mText) {
            this.mText.setColor(color);
        }
    };
    BackgroundScaleButton.prototype.setFrameNormal = function (normal, down) {
        this.mFrame = normal;
        this.mDownFrame = (down ? down : normal);
        this.changeNormal();
        return this;
    };
    BackgroundScaleButton.prototype.createBackground = function () {
        if (this.mFrame) {
            this.mBackground = this.scene.make.image({ key: this.mKey, frame: this.mFrame });
            this.mBackground.displayWidth = this.width;
            this.mBackground.displayHeight = this.height;
            this.add(this.mBackground);
        }
    };
    BackgroundScaleButton.prototype.setBgFrame = function (frame) {
        if (this.mBackground) {
            this.mBackground.setFrame(frame);
            this.mBackground.displayWidth = this.width;
            this.mBackground.displayHeight = this.height;
        }
    };
    BackgroundScaleButton.prototype.EventStateChange = function (state) {
        switch (state) {
            case ClickEvent.Up:
                this.changeNormal();
                break;
            case ClickEvent.Down:
                this.changeDown();
                break;
            case ClickEvent.Tap:
                this.changeNormal();
                break;
            case ClickEvent.Out:
                this.changeNormal();
                break;
        }
    };
    return BackgroundScaleButton;
}(ButtonEventDispatcher));
export { BackgroundScaleButton };
//# sourceMappingURL=background.scale.button.js.map