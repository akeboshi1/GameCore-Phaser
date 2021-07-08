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
import { BaseUI } from "apowophaserui";
import { UiUtils } from "utils";
var ThreeSlicePath = /** @class */ (function (_super) {
    __extends_1(ThreeSlicePath, _super);
    function ThreeSlicePath(scene, x, y, width, height, key, frame, dpr, scale, correct) {
        var _this = _super.call(this, scene, dpr, scale) || this;
        _this.mCorrection = 4;
        _this.dpr = dpr || UiUtils.baseDpr;
        _this.scale = scale || UiUtils.baseScale;
        _this.mCorrection = correct === undefined ? 4 : correct;
        _this.imgs = [];
        _this.setTexture(key, frame);
        _this.setSize(width, height);
        _this.setPosition(x, y);
        return _this;
    }
    ThreeSlicePath.prototype.resize = function (width, height) {
        width = Math.round(width);
        height = Math.round(height);
        if (this.width === width && this.height === height) {
            return this;
        }
        this.setSize(width, height);
        return;
    };
    Object.defineProperty(ThreeSlicePath.prototype, "correctValue", {
        set: function (value) {
            this.mCorrection = value;
        },
        enumerable: true,
        configurable: true
    });
    ThreeSlicePath.prototype.setTexture = function (key, frame) {
        if (!this.imgs[0]) {
            this.imgs[0] = this.scene.make.image({ key: key, frame: frame[0] });
            this.add(this.imgs[0]);
        }
        else
            this.imgs[0].setTexture(key, frame[0]);
        if (!this.imgs[2]) {
            this.imgs[2] = this.scene.make.image({ key: key, frame: frame[2] });
            this.add(this.imgs[2]);
        }
        else
            this.imgs[2].setTexture(key, frame[2]);
        if (!this.imgs[1]) {
            this.imgs[1] = this.scene.make.image({ key: key, frame: frame[1] });
            this.add(this.imgs[1]);
        }
        else
            this.imgs[1].setTexture(key, frame[1]);
        return this;
    };
    ThreeSlicePath.prototype.setFrame = function (frame) {
        this.imgs[0].setFrame(frame[0]);
        this.imgs[1].setFrame(frame[1]);
        this.imgs[2].setFrame(frame[2]);
        return this;
    };
    ThreeSlicePath.prototype.setSize = function (width, height) {
        _super.prototype.setSize.call(this, width, height);
        this.imgs[0].scale = 1;
        this.imgs[2].scale = 1;
        var midWidth = width - (this.imgs[0].displayWidth + this.imgs[2].displayWidth) + this.mCorrection;
        if (midWidth < 0) {
            midWidth = 0;
            this.imgs[0].displayWidth = width * 0.5;
            this.imgs[2].displayWidth = width * 0.5;
        }
        this.imgs[0].x = -width * 0.5 + this.imgs[0].displayWidth * 0.5;
        this.imgs[2].x = width * 0.5 - this.imgs[2].displayWidth * 0.5;
        this.imgs[1].displayWidth = midWidth;
        return this;
    };
    ThreeSlicePath.prototype.setTint = function (tint) {
        this.tint = tint;
        return this;
    };
    ThreeSlicePath.prototype.setTintFill = function (tint) {
        this.tint = tint;
        this.tintFill = true;
        return this;
    };
    Object.defineProperty(ThreeSlicePath.prototype, "tintFill", {
        get: function () {
            return this.first && this.first.tintFill;
        },
        set: function (value) {
            this.imgs.forEach(function (patch) { return patch.tintFill = value; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ThreeSlicePath.prototype, "tint", {
        set: function (value) {
            this.imgs.forEach(function (patch) { return patch.setTint(value); });
            this.internalTint = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ThreeSlicePath.prototype, "isTinted", {
        get: function () {
            return this.first && this.first.isTinted;
        },
        enumerable: true,
        configurable: true
    });
    ThreeSlicePath.prototype.clearTint = function () {
        this.each(function (patch) { return patch.clearTint(); });
        this.internalTint = undefined;
        this.tintFill = false;
    };
    ThreeSlicePath.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.imgs)
            this.imgs.length = 0;
        this.imgs = undefined;
    };
    return ThreeSlicePath;
}(BaseUI));
export { ThreeSlicePath };
//# sourceMappingURL=three.slice.path.js.map