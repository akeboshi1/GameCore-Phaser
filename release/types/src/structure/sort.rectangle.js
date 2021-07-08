import { LogicPos } from "./logic.pos";
import { Position45 } from "./position45";
var SortRectangle = /** @class */ (function () {
    function SortRectangle() {
        this.mLeft = new LogicPos();
        this.mRight = new LogicPos();
        this.mTop = new LogicPos();
        this.mBottom = new LogicPos();
    }
    SortRectangle.prototype.setArea = function (val) {
        if (!val || val.length < 1 || val[0].length < 0)
            return;
        var width = val[0].length;
        var height = val.length;
        var position = { rows: width, cols: height, tileWidth: 30, tileHeight: 15, sceneWidth: (width + height) * (30 / 2), sceneHeight: (width + height) * (15 / 2) };
        this.mTop = Position45.transformTo90(new LogicPos(0, 0), position);
        this.mLeft = Position45.transformTo90(new LogicPos(0, val.length - 1), position).add(-15, 0);
        this.mRight = Position45.transformTo90(new LogicPos(val.length - 1, 0), position).add(15, 0);
        this.mBottom = Position45.transformTo90(new LogicPos(val[0].length - 1, val.length - 1), position).add(0, 7);
    };
    Object.defineProperty(SortRectangle.prototype, "left", {
        get: function () {
            return this.mLeft;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SortRectangle.prototype, "right", {
        get: function () {
            return this.mRight;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SortRectangle.prototype, "top", {
        get: function () {
            return this.mTop;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SortRectangle.prototype, "bottom", {
        get: function () {
            return this.mBottom;
        },
        enumerable: true,
        configurable: true
    });
    return SortRectangle;
}());
export { SortRectangle };
//# sourceMappingURL=sort.rectangle.js.map