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
import { BaseUI, ClickEvent } from "apowophaserui";
import { UiUtils } from "utils";
import { ThreeSlicePath } from "./three.slice.path";
export var ButtonState;
(function (ButtonState) {
    ButtonState["Normal"] = "normal";
    ButtonState["Over"] = "over";
    ButtonState["Select"] = "select";
    ButtonState["Disable"] = "disable";
})(ButtonState || (ButtonState = {}));
var ThreeSliceButton = /** @class */ (function (_super) {
    __extends_1(ThreeSliceButton, _super);
    function ThreeSliceButton(scene, width, height, key, frame, downFrame, text, dpr, scale, tweenBoo, music) {
        var _this = _super.call(this, scene) || this;
        _this.mDownTime = 0;
        _this.mPressDelay = 1000;
        _this.mIsMove = false;
        _this.mTweening = false;
        _this.tweenScale = 0.9;
        _this.mTweenBoo = true;
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
    Object.defineProperty(ThreeSliceButton.prototype, "background", {
        get: function () {
            return this.mBackground;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ThreeSliceButton.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    ThreeSliceButton.prototype.addListen = function () {
        this.removeListen();
        this.on("pointerdown", this.onPointerDownHandler, this);
        this.on("pointerup", this.onPointerUpHandler, this);
        this.on("pointerout", this.onPointerOutHandler, this);
        this.on("pointermove", this.onPointerMoveHandler, this);
    };
    ThreeSliceButton.prototype.removeListen = function () {
        this.off("pointerdown", this.onPointerDownHandler, this);
        this.off("pointerup", this.onPointerUpHandler, this);
        this.off("pointerout", this.onPointerOutHandler, this);
        this.off("pointermove", this.onPointerMoveHandler, this);
    };
    ThreeSliceButton.prototype.setEnable = function (value, tint) {
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
    Object.defineProperty(ThreeSliceButton.prototype, "tweenEnable", {
        set: function (value) {
            this.mTweenBoo = value;
        },
        enumerable: true,
        configurable: true
    });
    ThreeSliceButton.prototype.mute = function (boo) {
        this.silent = boo;
    };
    ThreeSliceButton.prototype.changeNormal = function () {
        this.setBgFrame(this.mFrame);
    };
    ThreeSliceButton.prototype.changeDown = function () {
        if (this.mDownFrame) {
            this.setBgFrame(this.mDownFrame);
        }
    };
    ThreeSliceButton.prototype.setFrame = function (frame) {
        this.setBgFrame(frame);
    };
    ThreeSliceButton.prototype.setText = function (val) {
        if (this.mText) {
            this.mText.setText(val);
        }
    };
    ThreeSliceButton.prototype.setTextStyle = function (style) {
        if (this.mText) {
            this.mText.setStyle(style);
        }
    };
    ThreeSliceButton.prototype.setFontStyle = function (val) {
        if (this.mText) {
            this.mText.setFontStyle(val);
        }
    };
    ThreeSliceButton.prototype.setTextOffset = function (x, y) {
        if (this.mText) {
            this.mText.setPosition(x, y);
        }
    };
    ThreeSliceButton.prototype.setTextColor = function (color) {
        if (this.mText) {
            this.mText.setColor(color);
        }
    };
    ThreeSliceButton.prototype.setFrameNormal = function (normal, down) {
        this.mFrame = normal;
        this.mDownFrame = (down ? down : normal);
        this.changeNormal();
        return this;
    };
    ThreeSliceButton.prototype.createBackground = function () {
        if (this.mFrame) {
            this.mBackground = new ThreeSlicePath(this.scene, 0, 0, this.width, this.height, this.mKey, this.mFrame, this.dpr, this.zoom, 4);
            this.add(this.mBackground);
        }
    };
    ThreeSliceButton.prototype.setBgFrame = function (frame) {
        if (this.mBackground) {
            this.mBackground.setFrame(frame);
        }
    };
    ThreeSliceButton.prototype.buttonStateChange = function (state) {
        switch (state) {
            case ButtonState.Normal:
                this.changeNormal();
                break;
            case ButtonState.Over:
                break;
            case ButtonState.Select:
                this.changeDown();
                break;
            case ButtonState.Disable:
                break;
        }
    };
    ThreeSliceButton.prototype.onPointerMoveHandler = function (pointer) {
        if (this.soundGroup && this.soundGroup.move)
            this.playSound(this.soundGroup.move);
        if (!this.interactiveBoo)
            return;
        this.mIsMove = true;
        this.emit(ClickEvent.Move);
    };
    ThreeSliceButton.prototype.onPointerUpHandler = function (pointer) {
        // if (this.mTweening) return;
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.mTweenBoo) {
            // this.tween(false).then(() => {
            //     this.pointerDown(pointer);
            // });
            this.tween(false, this.pointerUp.bind(this, pointer));
        }
        else {
            this.pointerUp(pointer);
        }
    };
    ThreeSliceButton.prototype.pointerUp = function (pointer) {
        this.buttonStateChange(ButtonState.Normal);
        // if (!this.mIsMove || (Date.now() - this.mDownTime > this.mPressTime)) {
        var isdown = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        this.emit(ClickEvent.Up, this);
        // if (Math.abs(pointer.downX - pointer.upX) < this.width && Math.abs(pointer.downY - pointer.upY) < this.height) {
        if (isdown && this.mIsDown) {
            if (this.soundGroup && this.soundGroup.up)
                this.playSound(this.soundGroup.up);
            this.emit(ClickEvent.Tap, pointer, this);
        }
        // }
        clearTimeout(this.mPressTime);
        this.mIsMove = false;
        this.mIsDown = false;
        this.mDownTime = 0;
    };
    ThreeSliceButton.prototype.onPointerOutHandler = function (pointer) {
        if (this.mTweenBoo && pointer.isDown) {
            this.tween(false);
        }
    };
    ThreeSliceButton.prototype.onPointerDownHandler = function (pointer) {
        var _this = this;
        if (this.mTweening)
            return;
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.soundGroup && this.soundGroup.down)
            this.playSound(this.soundGroup.down);
        this.buttonStateChange(ButtonState.Select);
        this.mDownTime = Date.now();
        this.mPressTime = setTimeout(function () {
            _this.emit(ClickEvent.Hold, _this);
        }, this.mPressDelay);
        if (this.mTweenBoo)
            this.tween(true);
        this.emit(ClickEvent.Down, this);
        // this.mIsDownObject = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        this.mIsDown = true;
    };
    ThreeSliceButton.prototype.checkPointerInBounds = function (gameObject, pointerx, pointery) {
        if (!this.mRectangle) {
            this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
        }
        var zoom = this.zoom ? this.zoom : 1;
        this.mRectangle.left = -gameObject.width / 2;
        this.mRectangle.right = gameObject.width / 2;
        this.mRectangle.top = -gameObject.height / 2;
        this.mRectangle.bottom = gameObject.height / 2;
        var worldMatrix = gameObject.getWorldTransformMatrix();
        var x = (pointerx - worldMatrix.tx) / zoom;
        var y = (pointery - worldMatrix.ty) / zoom;
        if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
            return true;
        }
        return false;
    };
    ThreeSliceButton.prototype.tween = function (show, callback) {
        var _this = this;
        this.mTweening = true;
        var scale = show ? this.tweenScale : 1;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        this.mTween = this.scene.tweens.add({
            targets: this.list,
            duration: 45,
            ease: "Linear",
            props: {
                scaleX: { value: scale },
                scaleY: { value: scale },
            },
            onComplete: function () {
                _this.tweenComplete(show);
                if (callback)
                    callback();
            },
            onCompleteParams: [this]
        });
    };
    ThreeSliceButton.prototype.tweenComplete = function (show) {
        this.mTweening = false;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
    };
    return ThreeSliceButton;
}(BaseUI));
export { ThreeSliceButton };
//# sourceMappingURL=three.button.js.map