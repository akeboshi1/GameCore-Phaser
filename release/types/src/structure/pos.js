var Pos = /** @class */ (function () {
    function Pos(x, y, z, depth) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.depth = depth | 0;
    }
    Pos.prototype.add = function (x, y, z) {
        this.x += x;
        this.x += y;
        this.z += z ? z : 0;
        return this;
    };
    Pos.prototype.equal = function (p) {
        return p.x === this.x && p.y === this.y && p.z === this.z && p.depth === this.depth;
    };
    Pos.prototype.toString = function () {
        return "Pos >> x: " + this.x + ", y: " + this.y + ", z: " + this.z + ", depth: " + this.depth;
    };
    Pos.prototype.toPoint = function () {
        return new Pos(this.x, this.y);
    };
    return Pos;
}());
export { Pos };
//# sourceMappingURL=pos.js.map