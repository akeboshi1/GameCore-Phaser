var TweenCompent = /** @class */ (function () {
    function TweenCompent(scene, gameobject, config) {
        this.mTweening = false;
        this.mScale = 1;
        this.mPingpang = false;
        this.mTempPing = false;
        this.mScene = scene;
        this.mTarget = gameobject;
        this.mScale = config.scale || gameobject.scale;
        this.mX = config.x === undefined ? gameobject.x : config.x;
        this.mY = config.y === undefined ? gameobject.y : config.y;
        this.mPingpang = config.pingpang || false;
        this.mOnce = config.once || false;
        this.tempData = { scale: gameobject.scale, x: gameobject.x, y: gameobject.y };
    }
    TweenCompent.prototype.setObject = function (obj) {
        this.mTarget = obj;
    };
    TweenCompent.prototype.zoomIn = function () {
        this.mTempPing = false;
        this.tween();
    };
    TweenCompent.prototype.zoomOut = function (once) {
        this.mOnce = once || false;
        this.mTempPing = true;
        this.tween();
    };
    TweenCompent.prototype.tween = function () {
        var _this = this;
        this.mTweening = true;
        if (this.mTween) {
            this.mTween.stop();
            this.mTween.remove();
            this.mTween = undefined;
        }
        var tempScale = this.mTempPing ? this.tempData.scale : this.mScale;
        var tempX = this.mTempPing ? this.tempData.x : this.mX;
        var tempY = this.mTempPing ? this.tempData.y : this.mY;
        this.mTween = this.mScene.tweens.add({
            targets: this.mTarget,
            x: { value: tempX, duration: 45, ease: "Bounce.easeOut" },
            y: { value: tempY, duration: 45, ease: "Bounce.easeOut" },
            scaleX: { value: tempScale, duration: 45, ease: "Bounce.easeOut" },
            scaleY: { value: tempScale, duration: 45, ease: "Bounce.easeOut" },
            onComplete: function () {
                _this.tweenComplete();
            },
            onCompleteParams: [this.mTarget]
        });
    };
    TweenCompent.prototype.tweenComplete = function () {
        this.mTweening = false;
        if (this.mPingpang && !this.mTempPing) {
            this.mTempPing = true;
            this.tween();
        }
        else {
            if (this.mTween) {
                this.mTween.stop();
                this.mTween.remove();
                this.mTween = undefined;
            }
            this.mTempPing = false;
            if (this.mOnce) {
                this.mTarget = undefined;
                this.tempData = undefined;
            }
        }
    };
    return TweenCompent;
}());
export { TweenCompent };
//# sourceMappingURL=tween.compent.js.map