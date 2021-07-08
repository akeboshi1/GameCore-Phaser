import { LogicPos, Position45 } from "structure";
import { BasicScene } from "baseRender";
var GridsDebugger = /** @class */ (function () {
    function GridsDebugger(render) {
        this.render = render;
        this.isDebug = false;
    }
    GridsDebugger.prototype.destroy = function () {
        if (this.mGraphic)
            this.mGraphic.destroy();
        this.mRoomSize = null;
    };
    GridsDebugger.prototype.setData = function (posObj) {
        this.mRoomSize = posObj;
        if (this.isDebug) {
            this.show();
        }
        else {
            this.hide();
        }
    };
    GridsDebugger.prototype.show = function () {
        if (!this.mRoomSize)
            return;
        var scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof BasicScene)) {
            return;
        }
        if (this.mGraphic)
            this.mGraphic.destroy();
        this.mGraphic = scene.make.graphics(undefined, false);
        this.mGraphic.clear();
        this.mGraphic.lineStyle(1, 0x00FF00);
        this.mGraphic.beginPath();
        for (var i = 0; i <= this.mRoomSize.rows; i++) {
            this.drawLine(this.mRoomSize, this.mGraphic, 0, i, this.mRoomSize.cols, i);
        }
        for (var i = 0; i <= this.mRoomSize.cols; i++) {
            this.drawLine(this.mRoomSize, this.mGraphic, i, 0, i, this.mRoomSize.rows);
        }
        this.mGraphic.closePath();
        this.mGraphic.strokePath();
        scene.layerManager.addToLayer("middleLayer", this.mGraphic);
    };
    GridsDebugger.prototype.hide = function () {
        if (this.mGraphic)
            this.mGraphic.destroy();
    };
    GridsDebugger.prototype.q = function () {
        this.isDebug = false;
        this.hide();
    };
    GridsDebugger.prototype.v = function () {
        if (!this.isDebug) {
            this.show();
        }
        this.isDebug = true;
    };
    GridsDebugger.prototype.drawLine = function (posObj, graphics, startX, endX, startY, endY) {
        var point = new LogicPos(startX, endX);
        point = Position45.transformTo90(point, posObj);
        graphics.moveTo(point.x, point.y);
        point = new LogicPos(startY, endY);
        point = Position45.transformTo90(point, posObj);
        graphics.lineTo(point.x, point.y);
    };
    return GridsDebugger;
}());
export { GridsDebugger };
//# sourceMappingURL=grids.js.map