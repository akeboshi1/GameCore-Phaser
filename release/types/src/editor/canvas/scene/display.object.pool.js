import { BaseFramesDisplay } from "baseRender";
import { op_def } from "pixelpai_proto";
import { LogicPos, Position45 } from "structure";
var DisplayObjectPool = /** @class */ (function () {
    function DisplayObjectPool(sceneEditor) {
        this.sceneEditor = sceneEditor;
        this.terrains = new Map();
        this.mosses = new Map();
        this.elements = new Map();
        this.walls = new Map();
        this.caches = new Map();
        this.POOLOBJECTCONFIG = {
            terrains: BaseFramesDisplay,
            mosses: BaseFramesDisplay,
            elements: BaseFramesDisplay,
            walls: BaseFramesDisplay,
        };
    }
    DisplayObjectPool.prototype.getPool = function (poolName) {
        return this[poolName];
    };
    DisplayObjectPool.prototype.push = function (poolName, id, sprite) {
        var _this = this;
        var pool = this[poolName];
        // const obj: BaseFramesDisplay = new this.POOLOBJECTCONFIG[poolName](sprite, manager);
        // let layer = "surfaceLayer";
        var obj = this.sceneEditor.factory.createDisplay(sprite);
        if (obj.nodeType === op_def.NodeType.ElementNodeType || obj.nodeType === op_def.NodeType.MossType || obj.nodeType === op_def.NodeType.SpawnPointType) {
            obj.setInteractive();
            obj.setPosition(sprite.pos.x, sprite.pos.y);
        }
        else if (obj.nodeType === op_def.NodeType.TerrainNodeType || obj.nodeType === op_def.NodeType.WallNodeType) {
            // layer = "groundLayer";
            var pos = Position45.transformTo90(new LogicPos(sprite.pos.x, sprite.pos.y), this.sceneEditor.roomSize);
            obj.setPosition(pos.x, pos.y);
        }
        this.sceneEditor.scene.layerManager.addToLayer(sprite.layer.toString(), obj);
        pool.set(id, obj);
        if (this.caches) {
            this.caches.set(sprite.id, true);
            var cachelist = Array.from(this.caches.values());
            var result = cachelist.filter(function (bol) { return bol === false; });
            if (result.length === 0) {
                this.caches.forEach(function (value, key) {
                    var ele = _this.get(key.toString());
                    if (ele)
                        ele.asociate();
                });
                this.caches.clear();
                this.caches = null;
            }
        }
        // this.caches.forEach((val) => if (val === false) done = false )
    };
    DisplayObjectPool.prototype.remove = function (poolName, id) {
        var obj = this[poolName].get(id);
        if (obj) {
            this.tryDeleteMountSprites(obj.getMountIds());
            obj.isUsed = false;
            obj.destroy();
        }
        this[poolName].delete(id);
    };
    DisplayObjectPool.prototype.update = function (poolName, id, newSprite) {
        var pool = this[poolName];
        var obj = pool.get(id);
        if (obj) {
            // obj.isUsed = true;
            // obj.setModel(newSprite);
            obj.clear();
            obj.updateSprite(newSprite);
            if (obj.nodeType === op_def.NodeType.TerrainNodeType || obj.nodeType === op_def.NodeType.WallNodeType) {
                var pos = Position45.transformTo90(new LogicPos(newSprite.pos.x, newSprite.pos.y), this.sceneEditor.roomSize);
                obj.setPosition(pos.x, pos.y);
            }
        }
    };
    DisplayObjectPool.prototype.addCache = function (id) {
        if (this.caches)
            this.caches.set(id, false);
    };
    DisplayObjectPool.prototype.get = function (id) {
        var arys = [this.elements, this.mosses];
        for (var _i = 0, arys_1 = arys; _i < arys_1.length; _i++) {
            var map = arys_1[_i];
            var ele = map.get(id);
            if (ele) {
                return ele;
            }
        }
    };
    DisplayObjectPool.prototype.destroy = function () {
        for (var _i = 0, _a = Object.keys(this.POOLOBJECTCONFIG); _i < _a.length; _i++) {
            var key = _a[_i];
            this[key].clear();
        }
    };
    DisplayObjectPool.prototype.tryDeleteMountSprites = function (mountIds) {
        if (!mountIds || mountIds.length < 1) {
            return;
        }
        for (var _i = 0, mountIds_1 = mountIds; _i < mountIds_1.length; _i++) {
            var mount = mountIds_1[_i];
            var ele = this.get(mount.toString());
            if (ele) {
                if (ele.isMoss) {
                    this.sceneEditor.mossManager.deleteMosses([ele.id]);
                }
                else {
                    this.sceneEditor.elementManager.deleteElements([ele.id]);
                    if (ele.getMountIds) {
                        this.tryDeleteMountSprites(ele.getMountIds());
                    }
                }
            }
        }
    };
    return DisplayObjectPool;
}());
export { DisplayObjectPool };
//# sourceMappingURL=display.object.pool.js.map