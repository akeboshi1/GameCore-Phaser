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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def, op_client, op_editor } from "pixelpai_proto";
var EditorTerrainManager = /** @class */ (function (_super) {
    __extends_1(EditorTerrainManager, _super);
    function EditorTerrainManager(sceneEditor) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.taskQueue = new Map();
        _this.mEditorTerrains = new Map();
        var connection = _this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(_this);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, _this.handleAddTerrains);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS, _this.handleDeleteTerrains);
        }
        return _this;
    }
    EditorTerrainManager.prototype.destroy = function () {
        var connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    };
    EditorTerrainManager.prototype.addTerrains = function (terrainCoorData) {
        var _this = this;
        var locs = terrainCoorData.locs, key = terrainCoorData.key;
        var drawLocs = locs.filter(function (loc) { return _this.exist(loc, key); });
        for (var _i = 0, drawLocs_1 = drawLocs; _i < drawLocs_1.length; _i++) {
            var loc = drawLocs_1[_i];
            var locId = this.genLocId(loc.x, loc.y);
            var oldKey = this.mEditorTerrains.get(locId);
            if (oldKey && oldKey !== key) {
                this.taskQueue.set(locId, {
                    action: "UPDATE",
                    loc: __assign(__assign({}, loc), { key: key }),
                });
            }
            else {
                this.taskQueue.set(locId, {
                    action: "ADD",
                    loc: __assign(__assign({}, loc), { key: key }),
                });
            }
        }
        this.reqEditorAddTerrainsData(drawLocs, key);
    };
    EditorTerrainManager.prototype.reqEditorAddTerrainsData = function (locs, key) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
        var content = pkt.content;
        content.locs = locs;
        content.key = key;
        this.sceneEditor.connection.send(pkt);
    };
    EditorTerrainManager.prototype.removeTerrains = function (locations) {
        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
            var pos = locations_1[_i];
            var locId = this.genLocId(pos.x, pos.y);
            this.taskQueue.set(locId, {
                action: "DELETE",
                loc: {
                    x: pos.x,
                    y: pos.y,
                },
            });
        }
        this.reqEditorDeleteTerrainsData(locations);
    };
    EditorTerrainManager.prototype.reqEditorDeleteTerrainsData = function (loc) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        var content = pkt.content;
        content.locs = loc.map(function (item) { return ({ x: item.x, y: item.y, z: item.z }); });
        this.sceneEditor.connection.send(pkt);
    };
    EditorTerrainManager.prototype.update = function () {
        this.batchActionSprites();
    };
    EditorTerrainManager.prototype.addToMap = function () {
    };
    EditorTerrainManager.prototype.removeFromMap = function () {
    };
    EditorTerrainManager.prototype.existTerrain = function (x, y) {
        var locId = this.genLocId(x, y);
        return this.mEditorTerrains.has(locId);
    };
    EditorTerrainManager.prototype.handleAddTerrains = function (packet) {
        var content = packet.content;
        var locs = content.locs;
        var nodeType = content.nodeType;
        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (var _i = 0, locs_1 = locs; _i < locs_1.length; _i++) {
            var loc = locs_1[_i];
            var locId = this.genLocId(loc.x, loc.y);
            var oldKey = this.mEditorTerrains.get(locId);
            if (oldKey && oldKey === loc.key)
                continue;
            this.taskQueue.set(locId, {
                action: "ADD",
                loc: loc,
            });
        }
    };
    EditorTerrainManager.prototype.handleDeleteTerrains = function (packet) {
        var content = packet.content;
        var locs = content.locs;
        var nodeType = content.nodeType;
        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
        for (var _i = 0, locs_2 = locs; _i < locs_2.length; _i++) {
            var loc = locs_2[_i];
            var locId = this.genLocId(loc.x, loc.y);
            this.taskQueue.set(locId, {
                action: "DELETE",
                loc: loc,
            });
        }
    };
    EditorTerrainManager.prototype.exist = function (pos, key) {
        var locId = this.genLocId(pos.x, pos.y);
        var roomSize = this.sceneEditor.roomSize;
        if (!roomSize)
            return false;
        if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
            return false;
        }
        if (this.mEditorTerrains.get(locId) === key) {
            return false;
        }
        return true;
    };
    EditorTerrainManager.prototype.batchActionSprites = function () {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }
        var batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);
        for (var _i = 0, batchTasksKeys_1 = batchTasksKeys; _i < batchTasksKeys_1.length; _i++) {
            var key = batchTasksKeys_1[_i];
            var _a = this.taskQueue.get(key), action = _a.action, loc = _a.loc;
            var locId = this.genLocId(loc.x, loc.y);
            this.taskQueue.delete(key);
            if (action === "ADD") {
                var palette = this.sceneEditor.elementStorage.getTerrainPalette(loc.key);
                if (!palette)
                    continue;
                var sprite = palette.createSprite({
                    nodeType: op_def.NodeType.TerrainNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0
                });
                this.mEditorTerrains.set(locId, loc.key);
                this.sceneEditor.displayObjectPool.push("terrains", locId, sprite);
            }
            else if (action === "DELETE") {
                this.mEditorTerrains.delete(locId);
                this.sceneEditor.displayObjectPool.remove("terrains", locId);
            }
            else if (action === "UPDATE") {
                var palette = this.sceneEditor.elementStorage.getTerrainPalette(loc.key);
                if (!palette)
                    continue;
                var sprite = palette.createSprite({
                    nodeType: op_def.NodeType.TerrainNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0
                });
                this.mEditorTerrains.set(locId, loc.key);
                this.sceneEditor.displayObjectPool.update("terrains", locId, sprite);
            }
        }
    };
    EditorTerrainManager.prototype.genLocId = function (x, y) {
        return x + "_" + y;
    };
    return EditorTerrainManager;
}(PacketHandler));
export { EditorTerrainManager };
//# sourceMappingURL=terrain.manager.js.map