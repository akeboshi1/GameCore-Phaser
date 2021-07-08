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
import { LayerEnum } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import { Direction } from "structure";
var EditorWallManager = /** @class */ (function (_super) {
    __extends_1(EditorWallManager, _super);
    function EditorWallManager(sceneEditor) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.taskQueue = new Map();
        _this.walls = new Map();
        var connection = _this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(_this);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, _this.handleCreateWalls);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS, _this.handleDeleteWalls);
        }
        return _this;
    }
    EditorWallManager.prototype.update = function () {
        this.batchActionSprites();
    };
    EditorWallManager.prototype.addWalls = function (terrainCoorData) {
        var _this = this;
        var locs = terrainCoorData.locs, key = terrainCoorData.key;
        var drawLocs = locs.filter(function (loc) { return _this.exist(loc, key); });
        var placeLocs = [];
        for (var _i = 0, drawLocs_1 = drawLocs; _i < drawLocs_1.length; _i++) {
            var loc = drawLocs_1[_i];
            if (!this.canPut(loc))
                continue;
            var locId = this.genLocId(loc.x, loc.y);
            var placeLoc = __assign(__assign({}, loc), { key: key, id: 0 });
            var oldWall = this.walls.get(locId);
            if (oldWall && oldWall.key !== key) {
                this.taskQueue.set(locId, {
                    action: "UPDATE",
                    loc: placeLoc,
                });
            }
            else {
                this.taskQueue.set(locId, {
                    action: "ADD",
                    loc: placeLoc,
                });
            }
            placeLocs.push(placeLoc);
            if (loc.dir === Direction.concave) {
                this.removeDuplicate(loc.x, loc.y);
            }
        }
        this.reqEditorAddTerrainsData(placeLocs);
    };
    EditorWallManager.prototype.removeWalls = function (locations) {
        var removeWalls = [];
        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
            var pos = locations_1[_i];
            var locId = this.genLocId(pos.x, pos.y);
            var wall = this.walls.get(locId);
            if (!wall) {
                continue;
            }
            removeWalls.push(wall);
            this.taskQueue.set(locId, {
                action: "DELETE",
                loc: {
                    x: pos.x,
                    y: pos.y,
                },
            });
        }
        if (removeWalls.length > 0)
            this.reqEditorDeleteTerrainsData(removeWalls);
    };
    EditorWallManager.prototype.handleCreateWalls = function (packet) {
        var content = packet.content;
        var locs = content.locs, nodeType = content.nodeType;
        if (nodeType !== op_def.NodeType.WallNodeType) {
            return;
        }
        for (var _i = 0, locs_1 = locs; _i < locs_1.length; _i++) {
            var loc = locs_1[_i];
            var locId = this.genLocId(loc.x, loc.y);
            var placeLoc = __assign(__assign({}, loc), { key: loc.key, id: loc.id });
            this.taskQueue.set(locId, {
                action: "ADD",
                loc: placeLoc,
            });
        }
    };
    EditorWallManager.prototype.handleDeleteWalls = function (packet) {
        var content = packet.content;
        var locs = content.locs, nodeType = content.nodeType;
        if (nodeType !== op_def.NodeType.WallNodeType) {
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
    EditorWallManager.prototype.batchActionSprites = function () {
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
                var palette = this.sceneEditor.elementStorage.getMossPalette(loc.key);
                if (!palette)
                    continue;
                var sprite = palette.frameModel.createSprite({
                    nodeType: op_def.NodeType.WallNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0,
                    dir: loc.dir,
                    layer: LayerEnum.Wall
                });
                this.walls.set(locId, loc);
                this.sceneEditor.displayObjectPool.push("walls", locId, sprite);
            }
            else if (action === "DELETE") {
                this.walls.delete(locId);
                this.sceneEditor.displayObjectPool.remove("walls", locId);
            }
            else if (action === "UPDATE") {
                var palette = this.sceneEditor.elementStorage.getMossPalette(loc.key);
                if (!palette)
                    continue;
                var sprite = palette.frameModel.createSprite({
                    nodeType: op_def.NodeType.WallNodeType,
                    x: loc.x,
                    y: loc.y,
                    z: 0,
                    dir: loc.dir,
                    layer: palette.layer
                });
                this.walls.set(locId, loc);
                this.sceneEditor.displayObjectPool.update("walls", locId, sprite);
            }
        }
    };
    EditorWallManager.prototype.reqEditorAddTerrainsData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_WALLS);
        var content = pkt.content;
        content.locs = locs;
        // content.key = key;
        this.sceneEditor.connection.send(pkt);
    };
    EditorWallManager.prototype.reqEditorDeleteTerrainsData = function (loc) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_WALLS);
        var content = pkt.content;
        content.locs = loc;
        this.sceneEditor.connection.send(pkt);
    };
    EditorWallManager.prototype.exist = function (pos, key) {
        var locId = this.genLocId(pos.x, pos.y);
        var roomSize = this.sceneEditor.roomSize;
        if (!roomSize)
            return false;
        if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
            return false;
        }
        var oldWall = this.walls.get(locId);
        if (oldWall && oldWall.key === key) {
            return false;
        }
        return true;
    };
    EditorWallManager.prototype.removeDuplicate = function (x, y) {
        // 放置17转角时，检查两边重复墙壁。删除3和5方向
        var locs = [{ x: x + 1, y: y }, { x: x, y: y + 1 }];
        var removes = [];
        for (var _i = 0, locs_3 = locs; _i < locs_3.length; _i++) {
            var loc = locs_3[_i];
            var l = this.genLocId(loc.x, loc.y);
            var wall = this.walls.get(l);
            if (wall) {
                if (wall.dir === Direction.west_south || wall.dir === Direction.south_east)
                    removes.push(loc);
            }
        }
        if (removes.length > 0)
            this.removeWalls(removes);
    };
    EditorWallManager.prototype.canPut = function (loc) {
        var x = loc.x, y = loc.y, dir = loc.dir;
        var key = null;
        if (dir === Direction.west_south) {
            key = this.genLocId(x - 1, y);
        }
        else if (dir === Direction.south_east) {
            key = this.genLocId(x, y - 1);
        }
        if (!key)
            return true;
        var wall = this.walls.get(key);
        if (!wall)
            return true;
        return wall.dir !== Direction.concave;
    };
    EditorWallManager.prototype.genLocId = function (x, y) {
        return x + "_" + y;
    };
    return EditorWallManager;
}(PacketHandler));
export { EditorWallManager };
//# sourceMappingURL=wall.manager.js.map