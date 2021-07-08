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
import { BaseLayer } from "./base.layer";
var GroundLayer = /** @class */ (function (_super) {
    __extends_1(GroundLayer, _super);
    function GroundLayer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.mSortDirty = false;
        return _this;
    }
    GroundLayer.prototype.add = function (child) {
        _super.prototype.add.call(this, child);
        this.mSortDirty = true;
        return this;
    };
    GroundLayer.prototype.sortLayer = function () {
        if (!this.mSortDirty) {
            return;
        }
        this.mSortDirty = false;
        this.sort("depth", function (displayA, displayB) {
            // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
            return displayA.y + displayA.z > displayB.y + displayB.z;
        });
    };
    return GroundLayer;
}(BaseLayer));
export { GroundLayer };
//# sourceMappingURL=ground.js.map