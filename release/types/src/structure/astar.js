import { Grid, AStarFinder } from "pathfinding";
import { Logger } from "./log";
import { LogicPos } from "./logic.pos";
import { Position45 } from "./position45";
var AStar = /** @class */ (function () {
    function AStar(sizeChart) {
        this.sizeChart = sizeChart;
    }
    AStar.prototype.init = function (matrix) {
        if (this.finder) {
            this.reset(matrix);
        }
        else {
            this.grid = new Grid(matrix);
            this.finder = new AStarFinder({
                allowDiagonal: true,
                dontCrossCorners: true
            });
        }
    };
    AStar.prototype.reset = function (matrix) {
        // grid destroy
        this.grid = new Grid(matrix);
    };
    AStar.prototype.setWalkableAt = function (x, y, value) {
        if (!this.grid) {
            return;
        }
        this.grid.setWalkableAt(x, y, value);
    };
    AStar.prototype.isWalkableAt = function (x, y) {
        if (!this.grid) {
            return false;
        }
        return this.grid.isWalkableAt(x, y);
    };
    AStar.prototype.find = function (startPos, targetList, toReverse) {
        var _this = this;
        if (!this.finder) {
            Logger.getInstance().error("finder not exist");
            return;
        }
        if (!this.grid) {
            Logger.getInstance().error("can't find path. grid not exist");
            return;
        }
        var result = [];
        var miniSize = this.sizeChart.miniSize;
        var rows = miniSize.rows, cols = miniSize.cols;
        var start45 = Position45.transformTo45(startPos, miniSize);
        if (this._invalidPoint(start45, cols, rows))
            return result;
        var end45List = [];
        targetList.forEach(function (p) {
            p = Position45.transformTo45(p, miniSize);
            if (!_this._invalidPoint(p, cols, rows)) {
                end45List.push(p);
            }
        });
        if (end45List.length === 0) {
            return result;
        }
        this.gridBackup = this.grid.clone();
        var paths = this.finder.findPathToMultipleEnds(start45.x, start45.y, end45List, this.gridBackup, toReverse);
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var path = paths_1[_i];
            var point = Position45.transformTo90(new LogicPos(path[0], path[1]), miniSize);
            point.y += miniSize.tileHeight / 2; // 此处应该理解为：寻路的坐标系不应该和游戏本身网格grids重合，而是需要斜向移动半格（在我们的游戏坐标系中为y轴往下移动半格）
            result.push(point);
        }
        if (toReverse === false) {
            result.shift(); // 正向走的时候移除第一格是为了防止人物走的过程中忽然回头，反向的时候是人从家具上下来，如果移除掉第一格会造成人物从交互点的下一格开始走
        }
        return result;
    };
    AStar.prototype._invalidPoint = function (position, cols, rows) {
        return position.x < 0 || position.x >= cols || position.y < 0 || position.y >= rows || !this.isWalkableAt(position.x, position.y);
    };
    return AStar;
}());
export { AStar };
//# sourceMappingURL=astar.js.map