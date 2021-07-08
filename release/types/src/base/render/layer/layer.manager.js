import { Logger } from "structure";
var LayerManager = /** @class */ (function () {
    function LayerManager() {
        this.delta = 0;
        this.layers = new Map();
    }
    LayerManager.prototype.setScale = function (zoom) {
        this.layers.forEach(function (val) {
            val.setScale(zoom);
        });
    };
    LayerManager.prototype.addLayer = function (scene, layerClass, name, depth) {
        if (this.layers.get(name)) {
            Logger.getInstance().warn("repeated layer name: ", name);
            return;
        }
        var layer = new layerClass(scene, name, depth);
        this.layers.set(name, layer);
        scene.sys.displayList.add(layer);
        return layer;
    };
    LayerManager.prototype.addToLayer = function (layerName, obj, index) {
        if (index === void 0) { index = -1; }
        var layer = this.layers.get(layerName);
        if (!layer)
            return;
        if (index === -1 || index === undefined) {
            layer.add(obj);
        }
        else {
            layer.addAt(obj, index);
        }
    };
    LayerManager.prototype.destroy = function () {
        this.layers.forEach(function (layer) {
            layer.destroy();
        });
        this.layers = null;
    };
    LayerManager.prototype.getLayer = function (name) {
        if (!this.layers.get(name)) {
            return null;
        }
        return this.layers.get(name);
    };
    LayerManager.prototype.update = function (time, delta) {
        if (time - this.delta < 200) {
            return;
        }
        this.delta = time;
        this.layers.forEach(function (val) {
            val.sortLayer();
        });
    };
    Object.defineProperty(LayerManager.prototype, "depthSurfaceDirty", {
        set: function (val) {
            this.mDepthSurface = val;
        },
        enumerable: true,
        configurable: true
    });
    return LayerManager;
}());
export { LayerManager };
//# sourceMappingURL=layer.manager.js.map