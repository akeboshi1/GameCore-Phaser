import { LogicPos } from "./logic.pos";
var Position45 = /** @class */ (function () {
    function Position45() {
    }
    Position45.transformTo90 = function (point, position) {
        var offsetX = position.rows * (position.tileWidth / 2); // + position.tileWidth / 2;
        return new LogicPos((point.x - point.y) * (position.tileWidth / 2), (point.x + point.y) * (position.tileHeight / 2));
    };
    Position45.transformTo45 = function (point3, position) {
        var offsetX = position.rows * (position.tileWidth / 2);
        return new LogicPos(Math.floor((point3.y + point3.z) / position.tileHeight + (point3.x) / position.tileWidth), Math.floor((point3.y + point3.z) / position.tileHeight - (point3.x) / position.tileWidth));
    };
    return Position45;
}());
export { Position45 };
//# sourceMappingURL=position45.js.map