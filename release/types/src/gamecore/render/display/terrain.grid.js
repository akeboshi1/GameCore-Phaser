import { LayerName, LogicPos, Position45 } from "structure";
/**
 * 房间布置显示网格
 */
var TerrainGrid = /** @class */ (function () {
    function TerrainGrid(render, miniSize) {
        this.render = render;
        this.miniSize = miniSize;
        this.dirty = false;
        this.deltaTime = 500;
        this.curDelta = 0;
    }
    TerrainGrid.prototype.setMap = function (map) {
        this.map = map;
        this.dirty = true;
    };
    TerrainGrid.prototype.update = function (time, delta) {
        this.curDelta += delta;
        if (this.curDelta >= this.deltaTime) {
            if (this.dirty) {
                this.dirty = false;
                this.drawGrid();
            }
        }
    };
    TerrainGrid.prototype.destroy = function () {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = undefined;
        }
        this.dirty = false;
        this.map = null;
    };
    TerrainGrid.prototype.drawGrid = function () {
        if (!this.map) {
            return;
        }
        if (!this.graphics) {
            var scene = this.render.sceneManager.getMainScene();
            if (!scene) {
                return;
            }
            this.graphics = scene.make.graphics(undefined, false);
            scene.layerManager.addToLayer(LayerName.MIDDLE, this.graphics);
        }
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xffffff, 0.5);
        var cols = this.map[0].length;
        var rows = this.map.length;
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                if (this.map[i][j] !== -1) {
                    this.draw(j, i);
                }
            }
        }
        this.graphics.strokePath();
    };
    TerrainGrid.prototype.draw = function (x, y) {
        var pos = Position45.transformTo90({ x: x, y: y }, this.miniSize);
        this.graphics.moveTo(pos.x, pos.y);
        this.graphics.lineTo(pos.x + this.miniSize.tileWidth * 0.5, pos.y + this.miniSize.tileHeight * 0.5);
        this.graphics.lineTo(pos.x, pos.y + this.miniSize.tileHeight);
        this.graphics.lineTo(pos.x - this.miniSize.tileWidth * 0.5, pos.y + this.miniSize.tileHeight * 0.5);
        this.graphics.closePath();
    };
    TerrainGrid.prototype.drawLine = function (graphics, startX, endX, startY, endY, size) {
        var point = new LogicPos(startX, endX);
        point = Position45.transformTo90(point, size);
        graphics.moveTo(point.x, point.y);
        point = new LogicPos(startY, endY);
        point = Position45.transformTo90(point, size);
        graphics.lineTo(point.x, point.y);
    };
    return TerrainGrid;
}());
export { TerrainGrid };
//# sourceMappingURL=terrain.grid.js.map