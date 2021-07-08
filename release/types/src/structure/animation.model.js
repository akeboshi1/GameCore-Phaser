import { op_gameconfig_01, op_def } from "pixelpai_proto";
import { LogicPoint } from "./logic.point";
var AnimationModel = /** @class */ (function () {
    function AnimationModel(ani) {
        var tmpBaseLoc = ani.baseLoc.split(",");
        this.mNode = ani.node;
        this.id = ani.node.id;
        this.name = ani.node.name;
        this.frameName = ani.frameName;
        if (!ani.frameName || this.frameName.length < 1) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frames is invalid`);
        }
        this.loop = ani.loop;
        if (!ani.loop) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} loop is invalid`);
        }
        if (!ani.frameRate) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} frameRate is invalid`);
        }
        if (ani.originPoint) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} originPoint is invalid`);
        }
        if (!ani.baseLoc) {
            // Logger.getInstance().fatal(`Animation: ${ani.id} baseLoc is invalid`);
        }
        this.frameRate = ani.frameRate;
        this.baseLoc = new LogicPoint(parseInt(tmpBaseLoc[0], 10), parseInt(tmpBaseLoc[1], 10));
        var origin = ani.originPoint;
        this.originPoint = new LogicPoint(origin[0], origin[1]);
        if (typeof ani.collisionArea === "string") {
            this.collisionArea = this.stringToArray(ani.collisionArea, ",", "&") || [[0]];
        }
        else {
            this.collisionArea = ani.collisionArea || [[0]];
        }
        if (typeof ani.walkableArea === "string") {
            this.walkableArea = this.stringToArray(ani.walkableArea, ",", "&") || [[0]];
        }
        else {
            this.walkableArea = ani.walkableArea || [[0]];
        }
        // this.mInteractiveArea = [{x: 0, y: 0}];
        this.interactiveArea = ani.interactiveArea;
        this.changeLayer(ani.layer);
        this.mountLayer = ani.mountLayer;
    }
    AnimationModel.prototype.changeLayer = function (layer) {
        this.layer = layer;
        if (this.layer.length < 1) {
            this.layer = [{
                    frameName: this.frameName,
                    offsetLoc: this.baseLoc
                }];
        }
    };
    AnimationModel.prototype.createProtocolObject = function () {
        var ani = op_gameconfig_01.AnimationData.create();
        ani.node = this.mNode;
        ani.baseLoc = this.baseLoc.x + "," + this.baseLoc.y;
        ani.node.name = this.name;
        ani.loop = this.loop;
        ani.frameRate = this.frameRate;
        ani.frameName = this.frameName;
        ani.originPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkOriginPoint = [this.originPoint.x, this.originPoint.y];
        ani.walkableArea = this.arrayToString(this.walkableArea, ",", "&");
        ani.collisionArea = this.arrayToString(this.collisionArea, ",", "&");
        ani.interactiveArea = this.interactiveArea;
        var layers = [];
        for (var _i = 0, _a = this.layer; _i < _a.length; _i++) {
            var layer = _a[_i];
            layers.push(op_gameconfig_01.AnimationLayer.create(layer));
        }
        ani.layer = layers;
        this.changeLayer(ani.layer);
        ani.mountLayer = this.mountLayer;
        return ani;
    };
    AnimationModel.prototype.createMountPoint = function (index) {
        if (!this.mountLayer) {
            this.mountLayer = op_gameconfig_01.AnimationMountLayer.create();
            this.mountLayer.mountPoint = [op_def.PBPoint3f.create({ x: 0, y: 0 })];
            this.mountLayer.index = this.layer.length;
        }
        else {
            var mountPoint = this.mountLayer.mountPoint;
            if (index >= mountPoint.length) {
                mountPoint.push(op_def.PBPoint3f.create({ x: 0, y: 0 }));
            }
        }
    };
    AnimationModel.prototype.updateMountPoint = function (index, x, y) {
        if (!this.mountLayer) {
            return;
        }
        if (index < 0 || index >= this.mountLayer.mountPoint.length) {
            return;
        }
        var pos = this.mountLayer.mountPoint[index];
        pos.x -= x;
        pos.y -= y;
    };
    AnimationModel.prototype.stringToArray = function (string, fristJoin, lastJoin) {
        if (!string) {
            return;
        }
        var tmp = string.split(lastJoin);
        var result = [];
        for (var _i = 0, tmp_1 = tmp; _i < tmp_1.length; _i++) {
            var ary = tmp_1[_i];
            var tmpAry = ary.split(fristJoin);
            result.push(tmpAry.map(function (value) { return parseInt(value, 10); }));
        }
        return result;
    };
    AnimationModel.prototype.arrayToString = function (array, fristJoin, lastJoin) {
        if (!array)
            return "";
        var tmp = [];
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var ary = array_1[_i];
            tmp.push(ary.join(fristJoin));
        }
        return tmp.join(lastJoin);
    };
    return AnimationModel;
}());
export { AnimationModel };
//# sourceMappingURL=animation.model.js.map