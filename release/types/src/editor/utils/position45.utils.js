var Position45Utils = /** @class */ (function () {
    function Position45Utils(tileWidth, tileHeight, offsetX, offsetY) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
    Position45Utils.prototype.setOffset = function (x, y) {
        this.offsetX = x;
        this.offsetY = y;
    };
    Position45Utils.prototype.transformTo90 = function (p) {
        var x = p.x;
        var y = p.y;
        return new Phaser.Geom.Point(((x - y) / 2) * this.tileWidth + this.offsetX, ((x + y) / 2) * this.tileHeight + this.offsetY);
    };
    Position45Utils.prototype.transformTo45 = function (p) {
        var x = p.x;
        var y = p.y;
        return new Phaser.Geom.Point(Math.floor(y / this.tileHeight + (x - this.offsetX) / this.tileWidth), Math.floor(y / this.tileHeight - (x - this.offsetX) / this.tileWidth));
    };
    return Position45Utils;
}());
export default Position45Utils;
//# sourceMappingURL=position45.utils.js.map