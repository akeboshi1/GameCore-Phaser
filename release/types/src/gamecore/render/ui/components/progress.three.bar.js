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
import { ThreeSlicePath } from "./three.slice.path";
var ProgressThreeBar = /** @class */ (function (_super) {
    __extends_1(ProgressThreeBar, _super);
    function ProgressThreeBar(scene, key, background, bar, style, barconfig, bgconfig) {
        var _this = _super.call(this, scene) || this;
        _this.value = 0;
        _this.max = 1;
        _this.zoom = 1;
        _this.createBackgroundBar(key, background, bar, style, barconfig, bgconfig);
        _this.add([_this.mBackground, _this.mBar]);
        if (_this.mText)
            _this.add(_this.mText);
        _this.disInteractive();
        return _this;
    }
    ProgressThreeBar.prototype.setProgress = function (curVal, maxVal) {
        var value = curVal / maxVal;
        if (value > 1)
            value = 1;
        else if (value < 0)
            value = 0;
        this.value = value;
        this.max = maxVal;
        var width = this.width * this.zoom * this.value;
        this.bar.resize(width, this.height);
        this.bar.x = -this.width * 0.5 + width * 0.5;
    };
    ProgressThreeBar.prototype.setText = function (val) {
        if (this.mText) {
            this.mText.text = val;
            if (!this.mText.parentContainer)
                this.add(this.mText);
        }
    };
    Object.defineProperty(ProgressThreeBar.prototype, "text", {
        get: function () {
            return this.mText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProgressThreeBar.prototype, "bar", {
        get: function () {
            return this.mBar;
        },
        enumerable: true,
        configurable: true
    });
    ProgressThreeBar.prototype.createBackgroundBar = function (key, background, bar, style, barconfig, bgconfig) {
        if (bgconfig) {
            var bgW = bgconfig.width || this.width;
            var bgH = bgconfig.height || this.height;
            var correct = barconfig.correct;
            this.mBackground = new ThreeSlicePath(this.scene, 0, -2 * this.dpr, bgW, bgH, key, background, 1, 1, correct);
            this.setSize(bgW, bgH);
        }
        else {
            this.mBackground = this.scene.make.image({ key: key, frame: background });
            this.setSize(this.mBackground.width, this.mBackground.height);
        }
        if (barconfig) {
            var barW = barconfig.width || this.width;
            var barH = barconfig.height || this.height;
            var correct = barconfig.correct;
            this.mBar = new ThreeSlicePath(this.scene, 0, -2 * this.dpr, barW, barH, key, bar, 1, 1, correct);
        }
        else
            this.mBar = this.scene.make.image({ key: key, frame: bar });
        if (style) {
            this.mText = this.scene.make.text({
                style: style
            }, false);
        }
    };
    return ProgressThreeBar;
}(BaseUI));
export { ProgressThreeBar };
//# sourceMappingURL=progress.three.bar.js.map