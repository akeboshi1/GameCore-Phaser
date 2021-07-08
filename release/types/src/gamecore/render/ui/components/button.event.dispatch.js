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
var ButtonEventDispatcher = /** @class */ (function (_super) {
    __extends_1(ButtonEventDispatcher, _super);
    function ButtonEventDispatcher(scene, dpr, zoom, tweenBoo, music) {
        var _this = _super.call(this, scene) || this;
        _this.mDownTime = 0;
        _this.mPressDelay = 1000;
        _this.mIsMove = false;
        _this.mTweening = false;
        _this.tweenScale = 0.9;
        _this.mTweenBoo = true;
        _this.mDuration = 45;
        _this.zoom = 1;
        _this.dpr = dpr || _this.dpr;
        _this.zoom = zoom || _this.zoom;
        _this.soundGroup = {
            up: {
                key: "click",
            }
        };
        if (tweenBoo === undefined)
            tweenBoo = true;
        _this.mTweenBoo = tweenBoo;
        Object.assign(_this.soundGroup, music);
        return _this;
    }
    ButtonEventDispatcher.prototype.addListen = function () {
        this.removeListen();
        this.on("pointerdown", this.onPointerDownHandler, this);
        this.on("pointerup", this.onPointerUpHandler, this);
        this.on("pointerout", this.onPointerOutHandler, this);
        this.on("pointermove", this.onPointerMoveHandler, this);
    };
    ButtonEventDispatcher.prototype.removeListen = function () {
        this.off("pointerdown", this.onPointerDownHandler, this);
        this.off("pointerup", this.onPointerUpHandler, this);
        this.off("pointerout", this.onPointerOutHandler, this);
        this.off("pointermove", this.onPointerMoveHandler, this);
    };
    Object.defineProperty(ButtonEventDispatcher.prototype, "enable", {
        set: function (value) {
            if (value) {
                this.addListen();
                this.setInteractive();
            }
            else {
                this.removeListen();
                this.removeInteractive();
            }
        },
        enumerable: true,
        configurable: true
    });
    ButtonEventDispatcher.prototype.resize = function (width, height) {
        this.setSize(width, height);
        if (this.input && this.input.hitArea)
            this.input.hitArea.setSize(width, height);
    };
    ButtonEventDispatcher.prototype.onPointerMoveHandler = function (pointer) {
        if (this.soundGroup && this.soundGroup.move)
            this.playSound(this.soundGroup.move);
        if (!this.interactiveBoo)
            return;
        this.mIsMove = true;
        this.EventStateChange(ClickEvent.Move);
        this.emit(ClickEvent.Move);
    };
    ButtonEventDispatcher.prototype.onPointerUpHandler = function (pointer) {
        if (!this.interactiveBoo) {
            if (this.soundGroup && this.soundGroup.disabled)
                this.playSound(this.soundGroup.disabled);
            return;
        }
        if (this.mTweenBoo) {
            this.tween(false, this.pointerUp.bind(this, pointer));
        }
        else {
            this.pointerUp(pointer);
        }
    };
    ButtonEventDispatcher.prototype.pointerUp = function (pointer) {
        var isdown = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        this.EventStateChange(ClickEvent.Up);
        this.emit(ClickEvent.Up, this);
        if (isdown && this.mIsDown) {
            if (this.soundGroup && this.soundGroup.up)
                this.playSound(this.soundGroup.up);
            this.EventStateChange(ClickEvent.Tap);
            this.emit(ClickEvent.Tap, pointer, this);
        }
        clearTimeout(this.mPressTime);
        this.mIsMove = false;
        this.mIsDown = false;
        this.mDownTime = 0;
    };
    ButtonEventDispatcher.prototype.onPointerOutHandler = function (pointer) {
        if (this.mTweenBoo && pointer.isDown) {
            this.tween(false);
        }
        var isint = this.checkPointerInBounds(this, pointer.worldX, pointer.worldY);
        if (!isint)
            this.EventStateChange(ClickEvent.Out);
    };
    ButtonEventDispatcher.prototype.onPointerDownHandler = function (pointer) {
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
        this.mDownTime = Date.now();
        this.mPressTime = setTimeout(function () {
            _this.EventStateChange(ClickEvent.Hold);
            _this.emit(ClickEvent.Hold, _this);
        }, this.mPressDelay);
        if (this.mTweenBoo)
            this.tween(true);
        this.EventStateChange(ClickEvent.Down);
        this.emit(ClickEvent.Down, this);
        this.mIsDown = true;
    };
    ButtonEventDispatcher.prototype.checkPointerInBounds = function (gameObject, pointerx, pointery) {
        if (!this.mRectangle) {
            this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
        }
        var worldMatrix = gameObject.getWorldTransformMatrix();
        var zoom = worldMatrix.scaleX;
        this.mRectangle.left = -gameObject.width / 2;
        this.mRectangle.right = gameObject.width / 2;
        this.mRectangle.top = -gameObject.height / 2;
        this.mRectangle.bottom = gameObject.height / 2;
        var x = (pointerx - worldMatrix.tx) / zoom;
        var y = (pointery - worldMatrix.ty) / zoom;
        if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
            return true;
        }
        return false;
    };
    ButtonEventDispatcher.prototype.EventStateChange = function (state) {
    };
    ButtonEventDispatcher.prototype.tween = function (show, callback) {
        var _this = this;
        this.mTweening = true;
        var scale = show ? this.tweenScale : 1;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        this.mTween = this.scene.tweens.add({
            targets: this,
            duration: this.mDuration,
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
    ButtonEventDispatcher.prototype.tweenComplete = function (show) {
        this.mTweening = false;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
    };
    return ButtonEventDispatcher;
}(BaseUI));
export { ButtonEventDispatcher };
//# sourceMappingURL=button.event.dispatch.js.map