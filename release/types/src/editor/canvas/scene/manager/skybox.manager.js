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
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_editor, op_def } from "pixelpai_proto";
import { Logger } from "structure";
import { BlockManager, BaseScenery } from "baseRender";
var EditorSkyboxManager = /** @class */ (function (_super) {
    __extends_1(EditorSkyboxManager, _super);
    function EditorSkyboxManager(sceneEditor) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.blocks = new Map();
        var connection = sceneEditor.connection;
        if (connection) {
            connection.addPacketListener(_this);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, _this.onAddSceneryHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, _this.onUpdateSceneryHandler);
            _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, _this.onDeleteSceneryHandler);
        }
        return _this;
    }
    EditorSkyboxManager.prototype.destroy = function () {
        var connection = this.sceneEditor.connection;
        if (connection) {
            connection.removePacketListener(this);
        }
        this.blocks.forEach(function (block) { return block.destroy(); });
        this.blocks.clear();
    };
    EditorSkyboxManager.prototype.add = function (scenery) {
        var block = new BlockManager(scenery, this.sceneEditor);
        this.blocks.set(scenery.id, block);
    };
    EditorSkyboxManager.prototype.update = function (scenery) {
        var blockManager = this.blocks.get(scenery.id);
        if (blockManager) {
            blockManager.update(scenery);
        }
    };
    EditorSkyboxManager.prototype.remove = function (id) {
        var blockManager = this.blocks.get(id);
        if (blockManager) {
            blockManager.destroy();
        }
    };
    EditorSkyboxManager.prototype.fetch = function (id) {
        this.mSelected = this.blocks.get(id);
        // this.editorSkyboxManager.fetch(content.id);
    };
    EditorSkyboxManager.prototype.unselected = function () {
        this.mSelected = undefined;
    };
    EditorSkyboxManager.prototype.move = function (pointer) {
        if (!this.mSelected) {
            return;
        }
        var scenery = this.mSelected.scenery;
        if (!scenery) {
            return;
        }
        var offset = scenery.offset;
        offset.x += (pointer.x - pointer.prevPosition.x) / this.sceneEditor.scaleRatio;
        offset.y += (pointer.y - pointer.prevPosition.y) / this.sceneEditor.scaleRatio;
        this.mSelected.updatePosition();
        this.onSyncSceneryOffset();
    };
    EditorSkyboxManager.prototype.onAddSceneryHandler = function (packet) {
        var content = packet.content;
        this.add(new BaseScenery(content));
    };
    EditorSkyboxManager.prototype.onUpdateSceneryHandler = function (packet) {
        var content = packet.content;
        this.update(new BaseScenery(content));
    };
    EditorSkyboxManager.prototype.onDeleteSceneryHandler = function (packet) {
        var content = packet.content;
        var ids = content.ids;
        for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
            var id = ids_1[_i];
            this.remove(id);
        }
    };
    EditorSkyboxManager.prototype.onSyncSceneryOffset = function () {
        var scenery = this.mSelected.scenery;
        var packet = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_UPDATE_SCENERY);
        var content = packet.content;
        content.id = scenery.id;
        var offset = op_def.PBPoint2f.create();
        Object.assign(offset, scenery.offset);
        Logger.getInstance().log("======>>>: ", offset);
        content.offset = offset;
        this.sceneEditor.connection.send(packet);
    };
    return EditorSkyboxManager;
}(PacketHandler));
export { EditorSkyboxManager };
//# sourceMappingURL=skybox.manager.js.map