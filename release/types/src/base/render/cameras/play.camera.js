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
var PlayCamera = /** @class */ (function (_super) {
    __extends_1(PlayCamera, _super);
    function PlayCamera(x, y, width, height, pixelRatio, moveRatio) {
        var _this = _super.call(this, x, y, width, height) || this;
        _this.pixelRatio = pixelRatio;
        _this.moveRatio = moveRatio || 1;
        return _this;
    }
    PlayCamera.prototype.setPixelRatio = function (val) {
        this.pixelRatio = val;
    };
    PlayCamera.prototype.startFollow = function (target, roundPixels, lerpX, lerpY, offsetX, offsetY) {
        if (roundPixels === undefined) {
            roundPixels = false;
        }
        if (lerpX === undefined) {
            lerpX = 1;
        }
        if (lerpY === undefined) {
            lerpY = lerpX;
        }
        if (offsetX === undefined) {
            offsetX = 0;
        }
        if (offsetY === undefined) {
            offsetY = offsetX;
        }
        this._follow = target;
        this.roundPixels = roundPixels;
        // lerpX = Clamp(lerpX, 0, 1);
        // lerpY = Clamp(lerpY, 0, 1);
        this.lerp.set(lerpX, lerpY);
        this.followOffset.set(offsetX, offsetY);
        var originX = this.width / 2;
        var originY = this.height / 2;
        var pos = this._follow.getPosition();
        var fx = pos.x * this.pixelRatio * this.moveRatio - offsetX;
        var fy = pos.y * this.pixelRatio * this.moveRatio - offsetY;
        this.midPoint.set(fx, fy);
        this.scrollX = fx - originX;
        this.scrollY = fy - originY;
        if (this.useBounds) {
            this.scrollX = this.clampX(this.scrollX);
            this.scrollY = this.clampY(this.scrollY);
        }
        return this;
    };
    PlayCamera.prototype.preRender = function () {
        var width = this.width;
        var height = this.height;
        var halfWidth = width * 0.5;
        var halfHeight = height * 0.5;
        var zoom = this.zoom;
        var matrix = this.matrix;
        var originX = width * this.originX;
        var originY = height * this.originY;
        var follow = this._follow;
        var deadzone = this.deadzone;
        var sx = this.scrollX;
        var sy = this.scrollY;
        if (deadzone) {
            // CenterOn(deadzone, this.midPoint.x, this.midPoint.y);
        }
        if (follow && !this.panEffect.isRunning) {
            var pos = follow.getPosition();
            var fx = (pos.x * this.pixelRatio * this.moveRatio - this.followOffset.x);
            var fy = (pos.y * this.pixelRatio * this.moveRatio - this.followOffset.y);
            if (deadzone) {
                if (fx < deadzone.x) {
                    sx = this.linear(sx, sx - (deadzone.x - fx), this.lerp.x);
                }
                else if (fx > deadzone.right) {
                    sx = this.linear(sx, sx + (fx - deadzone.right), this.lerp.x);
                }
                if (fy < deadzone.y) {
                    sy = this.linear(sy, sy - (deadzone.y - fy), this.lerp.y);
                }
                else if (fy > deadzone.bottom) {
                    sy = this.linear(sy, sy + (fy - deadzone.bottom), this.lerp.y);
                }
            }
            else {
                sx = this.linear(sx, fx - originX, this.lerp.x);
                sy = this.linear(sy, fy - originY, this.lerp.y);
            }
        }
        if (this.useBounds) {
            sx = this.clampX(sx);
            sy = this.clampY(sy);
        }
        if (this.roundPixels) {
            originX = Math.round(originX);
            originY = Math.round(originY);
        }
        //  Values are in pixels and not impacted by zooming the Camera
        this.scrollX = sx;
        this.scrollY = sy;
        var midX = sx + halfWidth;
        var midY = sy + halfHeight;
        //  The center of the camera, in world space, so taking zoom into account
        //  Basically the pixel value of what it's looking at in the middle of the cam
        this.midPoint.set(midX, midY);
        var displayWidth = width / zoom;
        var displayHeight = height / zoom;
        this.worldView.setTo(midX - (displayWidth / 2), midY - (displayHeight / 2), displayWidth, displayHeight);
        matrix.applyITRS(this.x + originX, this.y + originY, this.rotation, zoom, zoom);
        matrix.translate(-originX, -originY);
        this.shakeEffect.preRender();
    };
    PlayCamera.prototype.linear = function (p0, p1, t) {
        return (p1 - p0) * t + p0;
    };
    return PlayCamera;
}(Phaser.Cameras.Scene2D.Camera));
export { PlayCamera };
//# sourceMappingURL=play.camera.js.map