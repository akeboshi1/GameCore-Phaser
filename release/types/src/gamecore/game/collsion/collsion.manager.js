import * as SAT from "sat";
import { LogicPos } from "structure";
var CollsionManager = /** @class */ (function () {
    function CollsionManager(roomService) {
        this.roomService = roomService;
        this.debug = false;
        this.borders = new Map();
    }
    CollsionManager.prototype.add = function (id, boder) {
        this.borders.set(id, boder);
    };
    CollsionManager.prototype.remove = function (id) {
        this.borders.delete(id);
    };
    CollsionManager.prototype.collideObjects = function (body) {
        var responses = [];
        this.borders.forEach(function (border, key) {
            if (border !== body) {
                var response = new SAT.Response();
                if (SAT.testPolygonPolygon(body, border, response)) {
                    responses.push(response);
                }
            }
        });
        return responses;
    };
    CollsionManager.prototype.update = function (time, delta) {
        if (!this.debug) {
            return;
        }
        this.roomService.game.renderPeer.showMatterDebug(Array.from(this.borders.values()));
    };
    CollsionManager.prototype.addWall = function () {
        var size = this.roomService.roomSize;
        var rows = size.rows, cols = size.cols;
        var vertexSets = [this.roomService.transformTo90(new LogicPos(0, 0)), this.roomService.transformTo90(new LogicPos(cols, 0)), this.roomService.transformTo90(new LogicPos(cols, rows)), this.roomService.transformTo90(new LogicPos(0, rows))];
        var nextBody = null;
        var curVertex = null;
        for (var i = 0; i < vertexSets.length; i++) {
            curVertex = vertexSets[i];
            nextBody = vertexSets[i + 1];
            if (!nextBody)
                nextBody = vertexSets[0];
            var offset = 5;
            if (i === 1 || i === 2) {
                offset = -5;
            }
            var polygon = new SAT.Polygon(new SAT.Vector(curVertex.x - curVertex.x, curVertex.y - curVertex.y), [
                new SAT.Vector(curVertex.x, curVertex.y),
                new SAT.Vector(nextBody.x, nextBody.y),
                new SAT.Vector(nextBody.x, nextBody.y - offset),
                new SAT.Vector(curVertex.x, curVertex.y - offset)
            ]);
            this.add(Math.random(), polygon);
        }
    };
    CollsionManager.prototype.v = function () {
        this.debug = true;
    };
    CollsionManager.prototype.q = function () {
        this.debug = false;
    };
    CollsionManager.prototype.destroy = function () {
        this.borders.clear();
    };
    return CollsionManager;
}());
export { CollsionManager };
//# sourceMappingURL=collsion.manager.js.map