import { SceneName } from "structure";
var ServerPosition = /** @class */ (function () {
    function ServerPosition(render) {
        var scene = render.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
        this.dpr = render.scaleRatio;
        this.mGridhics = scene.make.graphics(undefined, false);
        scene.layerManager.addToLayer("middleLayer", this.mGridhics);
    }
    ServerPosition.prototype.draw = function (x, y) {
        this.mGridhics.clear();
        this.mGridhics.fillStyle(0x00FF00, 1);
        this.mGridhics.fillCircle(x, y, 2 * this.dpr);
    };
    ServerPosition.prototype.destroy = function () {
        if (this.mGridhics)
            this.mGridhics.destroy();
    };
    return ServerPosition;
}());
export { ServerPosition };
//# sourceMappingURL=server.pointer.js.map