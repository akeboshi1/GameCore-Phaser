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
var ProgressMaskBar = /** @class */ (function (_super) {
    __extends_1(ProgressMaskBar, _super);
    function ProgressMaskBar(scene, key, background, bar, style) {
        var _this = _super.call(this, scene) || this;
        _this.value = 0;
        _this.max = 1;
        _this.zoom = 1;
        _this.createBackgroundBar(key, background, bar, style);
        if (_this.mBackground)
            _this.add(_this.mBackground);
        if (_this.mBar)
            _this.add(_this.mBar);
        if (_this.mText)
            _this.add(_this.mText);
        _this.disInteractive();
        return _this;
    }
    ProgressMaskBar.prototype.setProgress = function (curVal, maxVal) {
        var value = curVal / maxVal;
        if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;
        this.value = value;
        this.max = 1;
        this.refreshMask();
    };
    ProgressMaskBar.prototype.setText = function (val) {
        if (this.mText) {
            this.mText.text = val;
            if (!this.mText.parentContainer)
                this.add(this.mText);
        }
    };
    ProgressMaskBar.prototype.refreshMask = function () {
        if (this.mBar)
            this.mBar.setCrop(new Phaser.Geom.Rectangle(0, 0, this.value / this.max * this.width, this.height));
    };
    ProgressMaskBar.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        // this.maskGraphics.destroy();
    };
    Object.defineProperty(ProgressMaskBar.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgressMaskBar.prototype, "bar", {
        get: function () {
            return this.mBar;
        },
        enumerable: true,
        configurable: true
    });
    ProgressMaskBar.prototype.createBackgroundBar = function (key, background, bar, style) {
        if (background) {
            this.mBackground = this.scene.make.image({ key: key, frame: background });
            this.setSize(this.mBackground.width, this.mBackground.height);
        }
        this.mBar = this.scene.make.image({ key: key, frame: bar });
        this.mBar.isCropped = true;
        if (style) {
            this.mText = this.scene.make.text({
                style: style
            }, false).setOrigin(0.5);
        }
    };
    return ProgressMaskBar;
}(BaseUI));
export { ProgressMaskBar };
//# sourceMappingURL=progress.mask.bar.js.map