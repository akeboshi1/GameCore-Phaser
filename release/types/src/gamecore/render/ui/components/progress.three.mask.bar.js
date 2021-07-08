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
import { ProgressNineMaskBar } from "./progress.nine.mask.bar";
import { ThreeSlicePath } from "./three.slice.path";
var ProgressThreeMaskBar = /** @class */ (function (_super) {
    __extends_1(ProgressThreeMaskBar, _super);
    function ProgressThreeMaskBar(scene, key, background, bar, style, barconfig, bgconfig) {
        var _this = _super.call(this, scene, key, background, bar, style, barconfig, bgconfig) || this;
        _this.zoom = 1;
        return _this;
    }
    ProgressThreeMaskBar.prototype.createBackgroundBar = function (key, background, bar, style, barconfig, bgconfig) {
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
    return ProgressThreeMaskBar;
}(ProgressNineMaskBar));
export { ProgressThreeMaskBar };
//# sourceMappingURL=progress.three.mask.bar.js.map