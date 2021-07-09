var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class PlayCamera extends Phaser.Cameras.Scene2D.Camera {
  constructor(x, y, width, height, pixelRatio, moveRatio) {
    super(x, y, width, height);
    __publicField(this, "_follow");
    __publicField(this, "matrix");
    __publicField(this, "rotation");
    __publicField(this, "pixelRatio");
    __publicField(this, "moveRatio");
    this.pixelRatio = pixelRatio;
    this.moveRatio = moveRatio || 1;
  }
  setPixelRatio(val) {
    this.pixelRatio = val;
  }
  startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY) {
    if (roundPixels === void 0) {
      roundPixels = false;
    }
    if (lerpX === void 0) {
      lerpX = 1;
    }
    if (lerpY === void 0) {
      lerpY = lerpX;
    }
    if (offsetX === void 0) {
      offsetX = 0;
    }
    if (offsetY === void 0) {
      offsetY = offsetX;
    }
    this._follow = target;
    this.roundPixels = roundPixels;
    this.lerp.set(lerpX, lerpY);
    this.followOffset.set(offsetX, offsetY);
    const originX = this.width / 2;
    const originY = this.height / 2;
    const pos = this._follow.getPosition();
    const fx = pos.x * this.pixelRatio * this.moveRatio - offsetX;
    const fy = pos.y * this.pixelRatio * this.moveRatio - offsetY;
    this.midPoint.set(fx, fy);
    this.scrollX = fx - originX;
    this.scrollY = fy - originY;
    if (this.useBounds) {
      this.scrollX = this.clampX(this.scrollX);
      this.scrollY = this.clampY(this.scrollY);
    }
    return this;
  }
  preRender() {
    const width = this.width;
    const height = this.height;
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;
    const zoom = this.zoom;
    const matrix = this.matrix;
    let originX = width * this.originX;
    let originY = height * this.originY;
    const follow = this._follow;
    const deadzone = this.deadzone;
    let sx = this.scrollX;
    let sy = this.scrollY;
    if (deadzone) {
    }
    if (follow && !this.panEffect.isRunning) {
      const pos = follow.getPosition();
      const fx = pos.x * this.pixelRatio * this.moveRatio - this.followOffset.x;
      const fy = pos.y * this.pixelRatio * this.moveRatio - this.followOffset.y;
      if (deadzone) {
        if (fx < deadzone.x) {
          sx = this.linear(sx, sx - (deadzone.x - fx), this.lerp.x);
        } else if (fx > deadzone.right) {
          sx = this.linear(sx, sx + (fx - deadzone.right), this.lerp.x);
        }
        if (fy < deadzone.y) {
          sy = this.linear(sy, sy - (deadzone.y - fy), this.lerp.y);
        } else if (fy > deadzone.bottom) {
          sy = this.linear(sy, sy + (fy - deadzone.bottom), this.lerp.y);
        }
      } else {
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
    this.scrollX = sx;
    this.scrollY = sy;
    const midX = sx + halfWidth;
    const midY = sy + halfHeight;
    this.midPoint.set(midX, midY);
    const displayWidth = width / zoom;
    const displayHeight = height / zoom;
    this.worldView.setTo(midX - displayWidth / 2, midY - displayHeight / 2, displayWidth, displayHeight);
    matrix.applyITRS(this.x + originX, this.y + originY, this.rotation, zoom, zoom);
    matrix.translate(-originX, -originY);
    this.shakeEffect.preRender();
  }
  linear(p0, p1, t) {
    return (p1 - p0) * t + p0;
  }
}
