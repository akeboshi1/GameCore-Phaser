import { Logger, SceneName } from "structure";
var MatterBodies = /** @class */ (function () {
    function MatterBodies(render) {
        this.render = render;
        var scene = this.render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
        if (!scene) {
            Logger.getInstance().error("no matter scene");
            return;
        }
        this.mGraphics = scene.make.graphics(undefined, false);
        scene.layerManager.addToLayer("middleLayer", this.mGraphics);
    }
    MatterBodies.prototype.update = function () {
        if (this.mGraphics)
            this.mGraphics.clear();
    };
    MatterBodies.prototype.renderWireframes = function (bodies) {
        var graphics = this.mGraphics;
        if (!graphics)
            return;
        graphics.clear();
        if (!bodies)
            return;
        graphics.lineStyle(1, 0xFF0000);
        graphics.beginPath();
        var dpr = this.render.scaleRatio;
        for (var _i = 0, bodies_1 = bodies; _i < bodies_1.length; _i++) {
            var bodie = bodies_1[_i];
            var points = bodie.points, pos = bodie.pos, offset = bodie.offset;
            graphics.moveTo(points[0].x + pos.x + offset.x, points[0].y + pos.y + offset.y);
            for (var j = 1; j < points.length; j++) {
                graphics.lineTo(points[j].x + pos.x + offset.x, points[j].y + pos.y + offset.y);
            }
            graphics.lineTo(points[0].x + pos.x + offset.x, points[0].y + pos.y + offset.y);
        }
        graphics.strokePath();
    };
    MatterBodies.prototype.destroy = function () {
        if (this.mGraphics) {
            this.mGraphics.destroy();
        }
    };
    return MatterBodies;
}());
export { MatterBodies };
//# sourceMappingURL=matter.js.map