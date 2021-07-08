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
import { op_client, op_virtual_world, op_editor, op_def } from "pixelpai_proto";
var EditorPacket = /** @class */ (function (_super) {
    __extends_1(EditorPacket, _super);
    function EditorPacket(sceneEditor, connection) {
        var _this = _super.call(this) || this;
        _this.sceneEditor = sceneEditor;
        _this.connection = connection;
        _this.connection.addPacketListener(_this);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, _this.onEnterEditor);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, _this.onMouseFollowHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, _this.onSetEditorModeHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, _this.onAlignGridHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, _this.onVisibleGridHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, _this.handleAddTerrains);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_MOSSES, this.handleAddMosses);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_MOSSES, this.handleDeleteMosses);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_MOSSES, this.handleUpdateMosses);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.handleCreateElements);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, this.handleDeleteElements);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.handleSyncElements);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SPRITE, _this.onFetchSpriteHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, _this.onAddSceneryHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, _this.onUpdateSceneryHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, _this.onDeleteSceneryHandler);
        _this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SCENERY, _this.onFetchSceneryHandler);
        return _this;
    }
    EditorPacket.prototype.destroy = function () {
        if (this.connection)
            this.connection.removePacketListener(this);
    };
    // onConnected(connection?: SocketConnection): void {
    //     throw new Error("Method not implemented.");
    // }
    // onRefreshConnect(connection?: SocketConnection): void {
    //     throw new Error("Method not implemented.");
    // }
    // onDisConnected(connection?: SocketConnection): void {
    //     throw new Error("Method not implemented.");
    // }
    // onError(reason?: SocketConnectionError): void {
    //     throw new Error("Method not implemented.");
    // }
    EditorPacket.prototype.sceneCreate = function () {
        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
    };
    EditorPacket.prototype.reqEditorSyncPaletteOrMoss = function (key, nodeType) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS);
        var content = pkt.content;
        content.key = key;
        content.type = nodeType;
        this.connection.send(pkt);
    };
    EditorPacket.prototype.callEditorCreateElementData = function (sprites) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        var content = pkt.content;
        content.nodeType = sprites[0].nodeType;
        content.sprites = sprites.map(function (sprite) { return sprite.toSprite(); });
        this.connection.send(pkt);
    };
    EditorPacket.prototype.reqEditorAddTerrainsData = function (locs, key) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
        var content = pkt.content;
        content.locs = locs;
        content.key = key;
        this.connection.send(pkt);
    };
    EditorPacket.prototype.reqEditorDeleteTerrainsData = function (loc) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        var content = pkt.content;
        content.locs = loc.map(function (item) { return ({ x: item.x, y: item.y, z: item.z }); });
        this.connection.send(pkt);
    };
    EditorPacket.prototype.reqEditorCreateMossData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_MOSSES);
        var content = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    };
    EditorPacket.prototype.reqEditorDeleteMossData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_MOSSES);
        var content = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    };
    EditorPacket.prototype.reqEditorUpdateMossData = function (locs) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_MOSSES);
        var content = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    };
    /**
     * 同步Sprite
     */
    EditorPacket.prototype.callEditorUpdateElementData = function (sprites) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        var content = pkt.content;
        content.sprites = sprites;
        this.connection.send(pkt);
    };
    /**
     * 删除物件
     */
    EditorPacket.prototype.deleteSprite = function (ids) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
        var content = pkt.content;
        content.ids = ids;
        content.nodeType = op_def.NodeType.ElementNodeType;
        this.connection.send(pkt);
    };
    /**
     * 选择物件通知editor
     */
    EditorPacket.prototype.sendFetch = function (ids, nodetype, isMoss) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_SPRITE);
        var content = pkt.content;
        content.ids = ids;
        content.isMoss = isMoss;
        content.nodeType = nodetype;
        this.connection.send(pkt);
    };
    /**
     * @deprecated
     */
    EditorPacket.prototype.resetCameras = function (x, y, width, height) {
        var pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        var content = pkt.content;
        content.x = x;
        content.y = y;
        content.width = width;
        content.height = height;
        this.connection.send(pkt);
    };
    EditorPacket.prototype.onEnterEditor = function (packet) {
        var content = packet.content;
        this.sceneEditor.enter(content.scene);
        // const scene = content.scene;
    };
    EditorPacket.prototype.onMouseFollowHandler = function (packet) {
        var content = packet.content;
        this.sceneEditor.setSprite(content);
    };
    EditorPacket.prototype.onSetEditorModeHandler = function (packet) {
        var mode = packet.content;
        this.sceneEditor.changeBrushType(mode.mode);
    };
    EditorPacket.prototype.onAlignGridHandler = function (packet) {
        var content = packet.content;
        this.sceneEditor.toggleAlignWithGrid(content.align);
    };
    EditorPacket.prototype.onVisibleGridHandler = function (packet) {
        var content = packet.content;
        this.sceneEditor.toggleLayerVisible(content.visible);
    };
    EditorPacket.prototype.handleAddTerrains = function (packet) {
        var content = packet.content;
        var locs = content.locs;
        var nodeType = content.nodeType;
        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    };
    EditorPacket.prototype.handleAddMosses = function (packet) {
        var content = packet.content;
        var locs = content.locs;
    };
    EditorPacket.prototype.handleDeleteMosses = function () {
    };
    EditorPacket.prototype.handleUpdateMosses = function () {
    };
    EditorPacket.prototype.handleCreateElements = function (packet) {
        var content = packet.content;
        var sprites = content.sprites, nodeType = content.nodeType;
        // Logger.getInstance().log("handleCreateElements ====>", sprites);
    };
    EditorPacket.prototype.handleDeleteElements = function () {
    };
    EditorPacket.prototype.handleSyncElements = function () {
    };
    EditorPacket.prototype.onFetchSpriteHandler = function (packet) {
        var content = packet.content;
        var ids = content.ids, nodeType = content.nodeType;
        this.sceneEditor.fetchSprite(ids, nodeType);
    };
    EditorPacket.prototype.onAddSceneryHandler = function () {
    };
    EditorPacket.prototype.onUpdateSceneryHandler = function () {
    };
    EditorPacket.prototype.onDeleteSceneryHandler = function () {
    };
    EditorPacket.prototype.onFetchSceneryHandler = function (packet) {
        var content = packet.content;
        this.sceneEditor.fetchScenery(content.id);
    };
    return EditorPacket;
}(PacketHandler));
export { EditorPacket };
//# sourceMappingURL=editor.packet.js.map