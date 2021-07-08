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
import { LogicRectangle } from "./logic.rectangle";
var LogicRectangle45 = /** @class */ (function (_super) {
    __extends_1(LogicRectangle45, _super);
    function LogicRectangle45(row, col, endRow, endCol) {
        var _this = _super.call(this, row, col, endRow, endCol) || this;
        _this.row = 0;
        _this.col = 0;
        _this.endRow = 0;
        _this.endCol = 0;
        _this.row = row;
        _this.col = col;
        _this.endRow = endRow;
        _this.endCol = endCol;
        return _this;
    }
    return LogicRectangle45;
}(LogicRectangle));
export { LogicRectangle45 };
//# sourceMappingURL=logic.rectangle45.js.map