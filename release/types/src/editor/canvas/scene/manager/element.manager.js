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
import { Sprite } from "baseGame";
import { LayerEnum } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_editor, op_def } from "pixelpai_proto";
import { Position45 } from "structure";
var EditorElementManager = /** @class */ (function (_super) {
    __extends_1(EditorElementManager, _super);
    function EditorElementManager(sceneEditor) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.taskQueue = new Map();
        _this.mMap = [];
        var connection = _this.sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(_this);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, _this.handleCreateElements);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, _this.handleDeleteElements);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, _this.handleSyncElements);
        }
        return _this;
    }
    EditorElementManager.prototype.init = function () {
        var size = this.sceneEditor.miniRoomSize;
        this.mMap = new Array(size.rows);
        for (var i = 0; i < this.mMap.length; i++) {
            this.mMap[i] = new Array(size.cols).fill(0);
        }
    };
    EditorElementManager.prototype.update = function () {
        this.batchActionSprites();
    };
    EditorElementManager.prototype.destroy = function () {
        var connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
    };
    EditorElementManager.prototype.addElements = function (sprites) {
        for (var _i = 0, sprites_1 = sprites; _i < sprites_1.length; _i++) {
            var sprite = sprites_1[_i];
            this.taskQueue.set(sprite.id, {
                action: "ADD",
                sprite: sprite,
            });
        }
        this.callEditorCreateElementData(sprites);
    };
    EditorElementManager.prototype.callEditorCreateElementData = function (sprites) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        var content = pkt.content;
        content.nodeType = sprites[0].nodeType;
        content.sprites = sprites.map(function (sprite) { return sprite.toSprite(); });
        this.sceneEditor.connection.send(pkt);
    };
    EditorElementManager.prototype.updateElements = function (sprites) {
        this.callEditorUpdateElementData(sprites);
    };
    EditorElementManager.prototype.callEditorUpdateElementData = function (sprites) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        var content = pkt.content;
        content.sprites = sprites;
        this.sceneEditor.connection.send(pkt);
    };
    EditorElementManager.prototype.deleteElements = function (ids) {
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            this.taskQueue.set(id, {
                action: "DELETE",
                sprite: { id: id },
            });
        }
        this.callEditorDeleteElementData(ids);
    };
    EditorElementManager.prototype.callEditorDeleteElementData = function (ids) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
        var content = pkt.content;
        content.ids = ids;
        content.nodeType = op_def.NodeType.ElementNodeType;
        this.sceneEditor.connection.send(pkt);
    };
    EditorElementManager.prototype.addToMap = function (sprite) {
        if (!sprite)
            return;
        return this.setMap(sprite, true);
    };
    EditorElementManager.prototype.removeFromMap = function (sprite) {
        if (!sprite)
            return;
        return this.setMap(sprite, false);
    };
    EditorElementManager.prototype.checkCollision = function (pos, sprite) {
        if (sprite.layer === LayerEnum.Floor) {
            return true;
        }
        var collision = sprite.getCollisionArea();
        var origin = sprite.getOriginPoint();
        if (!collision) {
            return false;
        }
        var miniSize = this.sceneEditor.miniRoomSize;
        var pos45 = Position45.transformTo45(pos, miniSize);
        var rows = collision.length;
        var cols = collision[0].length;
        var row = 0, col = 0;
        for (var i = 0; i < rows; i++) {
            row = pos45.y + i - origin.y;
            for (var j = 0; j < cols; j++) {
                if (collision[i][j] === 1) {
                    col = pos45.x + j - origin.x;
                    if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                        if (this.mMap[row][col] === 1)
                            return false;
                    }
                }
            }
        }
        return true;
    };
    EditorElementManager.prototype.handleCreateElements = function (packet) {
        var content = packet.content;
        var sprites = content.sprites, nodeType = content.nodeType;
        for (var _i = 0, sprites_2 = sprites; _i < sprites_2.length; _i++) {
            var sprite = sprites_2[_i];
            this.sceneEditor.displayObjectPool.addCache(sprite.id);
            var _sprite = new Sprite(sprite, content.nodeType);
            this.taskQueue.set(sprite.id, {
                action: "ADD",
                sprite: _sprite,
            });
        }
    };
    EditorElementManager.prototype.handleDeleteElements = function (packet) {
        var content = packet.content;
        var ids = content.ids, nodeType = content.nodeType;
        if (nodeType !== op_def.NodeType.ElementNodeType && nodeType !== op_def.NodeType.SpawnPointType) {
            return;
        }
        this.sceneEditor.unselectElement();
        for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
            var id = ids_2[_i];
            this.taskQueue.set(id, {
                action: "DELETE",
                sprite: { id: id },
            });
        }
    };
    EditorElementManager.prototype.handleSyncElements = function (packet) {
        var content = packet.content;
        var sprites = content.sprites;
        if (content.nodeType !== op_def.NodeType.ElementNodeType) {
            return;
        }
        for (var _i = 0, sprites_3 = sprites; _i < sprites_3.length; _i++) {
            var sprite = sprites_3[_i];
            var _sprite = new Sprite(sprite);
            this.taskQueue.set(sprite.id, {
                action: "UPDATE",
                sprite: _sprite,
            });
        }
    };
    EditorElementManager.prototype.setMap = function (sprite, isAdd) {
        if (sprite.layer === LayerEnum.Floor) {
            return;
        }
        var collision = sprite.getCollisionArea();
        var origin = sprite.getOriginPoint();
        if (!collision) {
            return;
        }
        var miniSize = this.sceneEditor.miniRoomSize;
        var pos = Position45.transformTo45(sprite.pos, miniSize);
        var rows = collision.length;
        var cols = collision[0].length;
        var row = 0, col = 0;
        var overlap = false;
        for (var i = 0; i < rows; i++) {
            row = pos.y + i - origin.y;
            for (var j = 0; j < cols; j++) {
                if (collision[i][j] === 1) {
                    col = pos.x + j - origin.x;
                    if (row >= 0 && row < this.mMap.length && col >= 0 && col < this.mMap[row].length) {
                        if (isAdd && this.mMap[row][col] === 1) {
                            overlap = true;
                        }
                        this.mMap[row][col] = isAdd ? collision[i][j] : 0;
                    }
                }
            }
        }
        return overlap;
    };
    EditorElementManager.prototype.batchActionSprites = function () {
        if (!Array.from(this.taskQueue.keys()).length) {
            return;
        }
        var batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);
        for (var _i = 0, batchTasksKeys_1 = batchTasksKeys; _i < batchTasksKeys_1.length; _i++) {
            var key = batchTasksKeys_1[_i];
            var _a = this.taskQueue.get(key), action = _a.action, sprite = _a.sprite;
            this.taskQueue.delete(key);
            if (action === "ADD") {
                this.sceneEditor.displayObjectPool.push("elements", sprite.id.toString(), sprite);
            }
            else if (action === "DELETE") {
                this.sceneEditor.displayObjectPool.remove("elements", sprite.id.toString());
            }
            else if (action === "UPDATE") {
                this.sceneEditor.displayObjectPool.update("elements", sprite.id.toString(), sprite);
            }
        }
    };
    return EditorElementManager;
}(PacketHandler));
export { EditorElementManager };
//# sourceMappingURL=element.manager.js.map