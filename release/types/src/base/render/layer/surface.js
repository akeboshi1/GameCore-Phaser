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
import sort from "sort-display-object";
import { Logger } from "structure";
import { BaseLayer } from "./base.layer";
var SurfaceLayer = /** @class */ (function (_super) {
    __extends_1(SurfaceLayer, _super);
    function SurfaceLayer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SurfaceLayer.prototype.add = function (child) {
        _super.prototype.add.call(this, child);
        return this;
    };
    SurfaceLayer.prototype.sortLayer = function () {
        // TODO: import ElementDisplay
        sort.reset();
        sort.setTolerance(0.8);
        var displays = this.list;
        for (var _i = 0, displays_1 = displays; _i < displays_1.length; _i++) {
            var display = displays_1[_i];
            var dis = display;
            var projection = dis.projectionSize;
            if (dis.nodeType === 5) {
                sort.addDynamicDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, true, dis.nickname, dis);
            }
            else {
                sort.addFixedDisplayObject(dis.id, dis.sortX, dis.sortY, projection.width, projection.height, false, dis.nickname, dis);
            }
        }
        try {
            this.list = sort.sort();
        }
        catch (_a) {
            Logger.getInstance().error("Cyclic dependency");
        }
    };
    return SurfaceLayer;
}(BaseLayer));
export { SurfaceLayer };
//# sourceMappingURL=surface.js.map