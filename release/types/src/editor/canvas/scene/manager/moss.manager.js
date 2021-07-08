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
import { Helpers } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
var EditorMossManager = /** @class */ (function (_super) {
    __extends_1(EditorMossManager, _super);
    function EditorMossManager(sceneEditor) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.taskQueue = new Map();
        _this.editorMosses = new Map();
        var connection = _this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(_this);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_MOSSES, _this.handleAddMosses);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_MOSSES, _this.handleDeleteMosses);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_MOSSES, _this.handleUpdateMosses);
        }
        return _this;
    }
    EditorMossManager.prototype.update = function () {
        this.batchActionSprites();
    };
    EditorMossManager.prototype.destroy = function () {
        var connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    };
    EditorMossManager.prototype.addMosses = function (coorData) {
        var placeLocs = [];
        var locs = coorData.locs, key = coorData.key;
        for (var _i = 0, locs_1 = locs; _i < locs_1.length; _i++) {
            var loc = locs_1[_i];
            var id = Helpers.genId();
            var placeLoc = {
                x: loc.x,
                y: loc.y,
                z: loc.z,
                key: key,
                id: id,
            };
            this.taskQueue.set(id, {
                action: "ADD",
                loc: placeLoc,
            });
            placeLocs.push(placeLoc);
        }
        this.reqEditorCreateMossData(placeLocs);
    };
    EditorMossManager.prototype.reqEditorCreateMossData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_MOSSES);
        var content = pkt.content;
        content.locs = locs;
        this.sceneEditor.connection.send(pkt);
    };
    EditorMossManager.prototype.updateMosses = function (elements) {
        var updateLocs = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            var sprite = element.toSprite();
            var originLoc = this.editorMosses.get(sprite.id);
            var loc = {
                x: sprite.point3f.x,
                y: sprite.point3f.y,
                z: sprite.point3f.z,
                id: sprite.id,
                dir: sprite.direction,
                key: originLoc.key,
            };
            this.taskQueue.set(sprite.id, {
                action: "UPDATE",
                loc: loc,
            });
            updateLocs.push(loc);
        }
        this.reqEditorUpdateMossData(updateLocs);
    };
    EditorMossManager.prototype.reqEditorUpdateMossData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_MOSSES);
        var content = pkt.content;
        content.locs = locs;
        this.sceneEditor.connection.send(pkt);
    };
    EditorMossManager.prototype.deleteMosses = function (ids) {
        var deleteLocs = [];
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            var loc = this.editorMosses.get(id);
            deleteLocs.push(loc);
            this.taskQueue.set(id, {
                action: "DELETE",
                loc: loc,
            });
        }
        this.reqEditorDeleteMossData(deleteLocs);
    };
    EditorMossManager.prototype.reqEditorDeleteMossData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_MOSSES);
        var content = pkt.content;
        content.locs = locs;
        this.sceneEditor.connection.send(pkt);
    };
    EditorMossManager.prototype.addToMap = function () {
    };
    EditorMossManager.prototype.removeFromMap = function () {
    };
    EditorMossManager.prototype.handleAddMosses = function (packet) {
        var content = packet.content;
        var locs = content.locs;
        for (var _i = 0, locs_2 = locs; _i < locs_2.length; _i++) {
            var loc = locs_2[_i];
            this.sceneEditor.displayObjectPool.addCache(loc.id);
            this.taskQueue.set(loc.id, {
                action: "ADD",
                loc: loc,
            });
        }
    };
    EditorMossManager.prototype.handleDeleteMosses = function (packet) {
        var content = packet.content;
        var ids = content.ids;
        for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
            var id = ids_2[_i];
            this.taskQueue.set(id, {
                action: "DELETE",
                loc: this.editorMosses.get(id),
            });
        }
        this.sceneEditor.unselectElement();
    };
    EditorMossManager.prototype.handleUpdateMosses = function (packet) {
        var content = packet.content;
        var locs = content.locs;
        for (var _i = 0, locs_3 = locs; _i < locs_3.length; _i++) {
            var loc = locs_3[_i];
            this.taskQueue.set(loc.id, {
                action: "UPDATE",
                loc: loc,
            });
        }
    };
    EditorMossManager.prototype.batchActionSprites = function () {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }
        var batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);
        for (var _i = 0, batchTasksKeys_1 = batchTasksKeys; _i < batchTasksKeys_1.length; _i++) {
            var key = batchTasksKeys_1[_i];
            var _a = this.taskQueue.get(key), action = _a.action, loc = _a.loc;
            this.taskQueue.delete(key);
            if (action === "ADD") {
                var moss = this.sceneEditor.elementStorage.getMossPalette(loc.key);
                if (!moss)
                    continue;
                // @ts-ignore
                var sprite = moss.frameModel.createSprite(__assign(__assign({}, loc), { nodeType: op_def.NodeType.ElementNodeType, isMoss: true, layer: moss.layer }));
                this.editorMosses.set(loc.id, loc);
                this.sceneEditor.displayObjectPool.push("mosses", loc.id.toString(), sprite);
            }
            else if (action === "DELETE") {
                if (loc) {
                    this.editorMosses.delete(loc.id);
                    this.sceneEditor.displayObjectPool.remove("mosses", loc.id.toString());
                }
            }
            else if (action === "UPDATE") {
                var moss = this.sceneEditor.elementStorage.getMossPalette(loc.key);
                if (!moss)
                    continue;
                var sprite = moss.frameModel.createSprite(__assign(__assign({}, loc), { nodeType: op_def.NodeType.ElementNodeType, isMoss: true, layer: moss.layer }));
                this.editorMosses.set(loc.id, loc);
                this.sceneEditor.displayObjectPool.update("mosses", loc.id.toString(), sprite);
            }
        }
    };
    return EditorMossManager;
}(PacketHandler));
export { EditorMossManager };
//# sourceMappingURL=moss.manager.js.map