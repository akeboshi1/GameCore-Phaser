import { BasicScene } from "baseRender";
import { Logger, LogicPos } from "structure";
var SortDebugger = /** @class */ (function () {
    function SortDebugger(render) {
        this.render = render;
        this.isDebug = false;
        this.RECT_COLOR = 0x00ff00;
        SortDebugger._instance = this;
        this.mData = new Map();
        this.mGraphics = new Map();
    }
    SortDebugger.getInstance = function () {
        if (!SortDebugger._instance) {
            Logger.getInstance().error("SortDebugger not created");
        }
        return SortDebugger._instance;
    };
    SortDebugger.prototype.q = function () {
        this.isDebug = false;
        this.clear();
    };
    SortDebugger.prototype.v = function () {
        if (!this.isDebug) {
            this.redraw();
        }
        this.isDebug = true;
    };
    SortDebugger.prototype.clear = function () {
        this.mGraphics.forEach(function (graphics) {
            graphics.destroy();
        });
        this.mGraphics.clear();
    };
    // 调用sort库时调用
    SortDebugger.prototype.addDisplayObject = function (id, x, y, w, h) {
        var _this = this;
        var rect = new Rect(x, y, w, h);
        this.mData.set(id, rect);
        if (!this.isDebug)
            return;
        var scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof BasicScene)) {
            return;
        }
        this.render.mainPeer.getCurrentRoomSize()
            .then(function (size) {
            if (_this.mGraphics.get(id)) {
                _this.mGraphics.get(id).destroy();
            }
            _this.mGraphics.set(id, _this.drawObj(scene, _this.RECT_COLOR, rect, size));
        });
    };
    SortDebugger.prototype.redraw = function () {
        var _this = this;
        this.clear();
        var scene = this.render.sceneManager.getMainScene();
        if (!scene || !(scene instanceof BasicScene)) {
            return;
        }
        this.render.mainPeer.getCurrentRoomSize()
            .then(function (size) {
            _this.mData.forEach(function (rect, id) {
                _this.mGraphics.set(id, _this.drawObj(scene, _this.RECT_COLOR, rect, size));
            });
        });
    };
    SortDebugger.prototype.drawObj = function (scene, color, rect, posObj) {
        Logger.getInstance().debug("#sort drawRect: ", rect);
        var pos1 = new LogicPos(rect.x, rect.y);
        // pos1 = Position45.transformTo90(pos1, posObj);
        var pos2 = new LogicPos(rect.x + rect.w, rect.y);
        // pos2 = Position45.transformTo90(pos2, posObj);
        var pos3 = new LogicPos(rect.x + rect.w, rect.y + rect.h);
        // pos3 = Position45.transformTo90(pos3, posObj);
        var pos4 = new LogicPos(rect.x, rect.y + rect.h);
        // pos4 = Position45.transformTo90(pos4, posObj);
        var graphics = scene.make.graphics(undefined, false);
        graphics.lineStyle(1, color);
        graphics.fillStyle(color, 1);
        graphics.moveTo(pos1.x, pos1.y);
        graphics.lineTo(pos2.x, pos2.y);
        graphics.lineTo(pos3.x, pos3.y);
        graphics.lineTo(pos4.x, pos4.y);
        graphics.lineTo(pos1.x, pos1.y);
        graphics.fillPath();
        scene.layerManager.addToLayer("middleLayer", graphics);
        return graphics;
    };
    return SortDebugger;
}());
export { SortDebugger };
var Rect = /** @class */ (function () {
    function Rect(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    return Rect;
}());
//# sourceMappingURL=sort.debugger.js.map