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
import { BaseUI, NineSlicePatch } from "apowophaserui";
var ProgressNineMaskBar = /** @class */ (function (_super) {
    __extends_1(ProgressNineMaskBar, _super);
    function ProgressNineMaskBar(scene, key, background, bar, style, barconfig, bgconfig) {
        var _this = _super.call(this, scene) || this;
        _this.value = 0;
        _this.max = 1;
        _this.zoom = 1;
        _this.createBackgroundBar(key, background, bar, style, barconfig, bgconfig);
        _this.maskGraphics = _this.scene.make.graphics(undefined, false);
        _this.maskGraphics.fillStyle(0, 1);
        _this.maskGraphics.fillRect(0, 0, _this.width, _this.height);
        _this.mBar.setMask(_this.maskGraphics.createGeometryMask());
        if (_this.mBackground)
            _this.add(_this.mBackground);
        if (_this.mBar)
            _this.add(_this.mBar);
        if (_this.mText)
            _this.add(_this.mText);
        _this.disInteractive();
        return _this;
    }
    ProgressNineMaskBar.prototype.setProgress = function (curVal, maxVal) {
        var value = curVal / maxVal;
        if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;
        this.value = value;
        this.max = maxVal;
        this.refreshMask();
    };
    ProgressNineMaskBar.prototype.setText = function (val) {
        if (this.mText) {
            this.mText.text = val;
            if (!this.mText.parentContainer)
                this.add(this.mText);
        }
    };
    ProgressNineMaskBar.prototype.refreshMask = function () {
        var world = this.getWorldTransformMatrix();
        if (this.zoom !== world.scaleX) {
            this.zoom = world.scaleX;
            this.maskGraphics.clear();
            this.maskGraphics.fillRect(0, 0, this.width * this.zoom, this.height * this.zoom);
        }
        var offsetx = world.tx - this.width * this.zoom * 1.5;
        var tx = offsetx + this.width * this.zoom * this.value;
        var ty = world.ty - this.height * this.zoom * 0.5;
        this.maskGraphics.setPosition(tx, ty);
    };
    ProgressNineMaskBar.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.maskGraphics.destroy();
    };
    Object.defineProperty(ProgressNineMaskBar.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgressNineMaskBar.prototype, "bar", {
        get: function () {
            return this.mBar;
        },
        enumerable: true,
        configurable: true
    });
    ProgressNineMaskBar.prototype.createBackgroundBar = function (key, background, bar, style, barconfig, bgconfig) {
        if (background) {
            if (bgconfig) {
                var bgW = bgconfig.width || this.width;
                var bgH = bgconfig.height || this.height;
                this.mBackground = new NineSlicePatch(this.scene, 0, -2 * this.dpr, bgW, bgH, key, background, bgconfig);
                this.setSize(bgW, bgH);
            }
            else {
                this.mBackground = this.scene.make.image({ key: key, frame: background });
                this.setSize(this.mBackground.width, this.mBackground.height);
            }
        }
        if (barconfig) {
            var barW = barconfig.width || this.width;
            var barH = barconfig.height || this.height;
            this.mBar = new NineSlicePatch(this.scene, 0, -2 * this.dpr, barW, barH, key, bar, barconfig);
        }
        else {
            this.mBar = this.scene.make.image({ key: key, frame: bar });
            this.mBar.isCropped = true;
        }
        if (style) {
            this.mText = this.scene.make.text({
                style: style
            }, false).setOrigin(0.5);
        }
    };
    return ProgressNineMaskBar;
}(BaseUI));
export { ProgressNineMaskBar };
//# sourceMappingURL=progress.nine.mask.bar.js.map