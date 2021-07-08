var LogicPoint = /** @class */ (function () {
    function LogicPoint(x, y) {
        if (x === undefined) {
            x = 0;
        }
        if (y === undefined) {
            y = x;
        }
        this.x = x;
        this.y = y;
    }
    LogicPoint.prototype.setTo = function (x, y) {
        if (x === undefined) {
            x = 0;
        }
        if (y === undefined) {
            y = x;
        }
        this.x = x;
        this.y = y;
        return this;
    };
    return LogicPoint;
}());
export { LogicPoint };
//# sourceMappingURL=logic.point.js.map