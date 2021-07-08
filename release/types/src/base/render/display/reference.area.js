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
import { Pos, Position45 } from "structure";
var ReferenceArea = /** @class */ (function (_super) {
    __extends_1(ReferenceArea, _super);
    function ReferenceArea(scene) {
        return _super.call(this, scene) || this;
    }
    ReferenceArea.prototype.draw = function (area, origin, tileWidth, tileHeight) {
        this.clear();
        if (area.length === 0 || area[0].length === 0) {
            return;
        }
        var p1;
        var p2;
        var p3;
        var p4;
        var rows = area.length;
        var cols = area[0].length;
        this.mOrigin = origin;
        this.mSize = {
            rows: rows,
            cols: cols,
            tileWidth: tileWidth,
            tileHeight: tileHeight,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2)
        };
        this.beginPath();
        for (var y = 0; y < rows; y++) {
            for (var x = 0; x < cols; x++) {
                if (area[y][x] === 0)
                    continue; // 无碰撞区域
                this.lineStyle(2, 0);
                p1 = Position45.transformTo90(new Pos(x, y), this.mSize);
                p2 = Position45.transformTo90(new Pos(x + 1, y), this.mSize);
                p3 = Position45.transformTo90(new Pos(x + 1, y + 1), this.mSize);
                p4 = Position45.transformTo90(new Pos(x, y + 1), this.mSize);
                this.beginPath();
                this.fillStyle(area[y][x] === 1 ? 0x00FF00 : 0xFF0000);
                this.strokePoints([p1.toPoint(), p2.toPoint(), p3.toPoint(), p4.toPoint()], true, true);
                this.fillPath();
            }
        }
        this.setPosition(0, 0);
    };
    ReferenceArea.prototype.setPosition = function (x, y, z, w) {
        if (!this.mSize)
            return;
        // const _x = x - this.mSize.rows * (this.mSize.tileWidth >> 1) - (this.mOrigin.x - this.mOrigin.y) * (this.mSize.tileWidth >> 1);
        var _x = x - (this.mOrigin.x - this.mOrigin.y) * (this.mSize.tileWidth >> 1);
        var _y = y - (this.mOrigin.x + this.mOrigin.y + 0.5) * (this.mSize.tileHeight >> 1);
        return _super.prototype.setPosition.call(this, _x, _y, z, w);
    };
    Object.defineProperty(ReferenceArea.prototype, "size", {
        get: function () {
            return this.mSize;
        },
        enumerable: true,
        configurable: true
    });
    return ReferenceArea;
}(Phaser.GameObjects.Graphics));
export { ReferenceArea };
//# sourceMappingURL=reference.area.js.map