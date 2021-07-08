var LogicPos = /** @class */ (function () {
    function LogicPos(x, y, z, depth) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.depth = depth | 0;
    }
    LogicPos.prototype.add = function (x, y, z) {
        this.x += x;
        this.x += y;
        this.z += z ? z : 0;
        return this;
    };
    LogicPos.prototype.equal = function (p) {
        return p.x === this.x && p.y === this.y && p.z === this.z && p.depth === this.depth;
    };
    LogicPos.prototype.toString = function () {
        return "Pos { x: " + this.x + ", y: " + this.y + ", z: " + this.z + ", depth: " + this.depth + " }";
    };
    LogicPos.prototype.toPoint = function () {
        return new LogicPos(this.x, this.y, this.z);
    };
    return LogicPos;
}());
export { LogicPos };
//# sourceMappingURL=logic.pos.js.map