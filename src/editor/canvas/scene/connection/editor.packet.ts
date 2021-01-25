import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_editor, op_def } from "pixelpai_proto";
import { ISprite } from "structure";
import { IPos, Logger } from "utils";
import { SceneEditorCanvas } from "../scene.editor.canvas";

export class EditorPacket extends PacketHandler {
    constructor(private sceneEditor: SceneEditorCanvas, private connection: any) {
        super();
        this.connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, this.onMouseFollowHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);

        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleAddTerrains);

        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_MOSSES, this.handleAddMosses);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_MOSSES, this.handleDeleteMosses);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_MOSSES, this.handleUpdateMosses);

        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CREATE_SPRITE, this.handleCreateElements);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITE, this.handleDeleteElements);
        // this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_SPRITE, this.handleSyncElements);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SPRITE, this.onFetchSpriteHandler);

        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, this.onAddSceneryHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, this.onUpdateSceneryHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, this.onDeleteSceneryHandler);
        this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SCENERY, this.onFetchSceneryHandler);
    }

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

    public sceneCreate() {
        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
    }

    reqEditorSyncPaletteOrMoss(key: number, nodeType: op_def.NodeType) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS = pkt.content;
        content.key = key;
        content.type = nodeType;
        this.connection.send(pkt);
    }

    callEditorCreateElementData(sprites: ISprite[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_SPRITE = pkt.content;
        content.nodeType = sprites[0].nodeType;
        content.sprites = sprites.map((sprite) => sprite.toSprite());
        this.connection.send(pkt);
    }

    reqEditorAddTerrainsData(locs: op_def.IPBPoint3f[], key) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_ADD_TERRAINS = pkt.content;
        content.locs = locs;
        content.key = key;
        this.connection.send(pkt);
    }

    reqEditorDeleteTerrainsData(loc: IPos[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS = pkt.content;
        content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
        this.connection.send(pkt);
    }

    reqEditorCreateMossData(locs: op_def.IMossMetaData[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_MOSSES);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_CREATE_MOSSES = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    }

    reqEditorDeleteMossData(locs: op_def.IMossMetaData[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_MOSSES);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_DELETE_MOSSES = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    }

    reqEditorUpdateMossData(locs: op_def.IMossMetaData[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_MOSSES);
        const content: op_editor.OP_CLIENT_REQ_EDITOR_SYNC_MOSSES = pkt.content;
        content.locs = locs;
        this.connection.send(pkt);
    }

    /**
     * 同步Sprite
     */
    callEditorUpdateElementData(sprites: op_client.ISprite[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_SYNC_SPRITE = pkt.content;
        content.sprites = sprites;
        this.connection.send(pkt);
    }

    /**
     * 删除物件
     */
    public deleteSprite(ids: number[]) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_DELETE_SPRITE = pkt.content;
        content.ids = ids;
        content.nodeType = op_def.NodeType.ElementNodeType;

        this.connection.send(pkt);
    }

    /**
     * 选择物件通知editor
     */
    public sendFetch(ids: number[], nodetype: op_def.NodeType, isMoss?: boolean) {
        const pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_SPRITE);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_FETCH_SPRITE = pkt.content;
        content.ids = ids;
        content.isMoss = isMoss;
        content.nodeType = nodetype;
        this.connection.send(pkt);
    }

    /**
     * @deprecated
     */
    public resetCameras(x: number, y: number, width: number, height: number) {
        const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
        const content: op_editor.IOP_CLIENT_REQ_EDITOR_RESET_CAMERA = pkt.content;
        content.x = x;
        content.y = y;
        content.width = width;
        content.height = height;
        this.connection.send(pkt);
    }

    private onEnterEditor(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE = packet.content;
        this.sceneEditor.enter(content.scene);
        // const scene = content.scene;
    }

    private onMouseFollowHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE = packet.content;
        this.sceneEditor.setSprite(content);
    }

    private onSetEditorModeHandler(packet: PBpacket) {
        const mode: op_client.IOP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE = packet.content;
        this.sceneEditor.changeBrushType(mode.mode);
    }

    private onAlignGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ALIGN_GRID = packet.content;
        this.sceneEditor.toggleAlignWithGrid(content.align);
    }

    private onVisibleGridHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_VISIBLE_GRID = packet.content;
        this.sceneEditor.toggleLayerVisible(content.visible);
    }

    private handleAddTerrains(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS = packet.content;
        const locs = content.locs;
        const nodeType = content.nodeType;
        Logger.getInstance().log("handleAddTerrains =========>", locs);
        if (nodeType !== op_def.NodeType.TerrainNodeType) {
            return;
        }
    }

    private handleAddMosses(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_ADD_MOSSES = packet.content;
        const locs = content.locs;
        Logger.getInstance().log("handleAddMosses =========>", locs);

    }

    private handleDeleteMosses() {
    }

    private handleUpdateMosses() {
    }

    private handleCreateElements(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_CREATE_SPRITE = packet.content;
        const { sprites, nodeType } = content;
        Logger.getInstance().log("handleCreateElements ====>", sprites);
    }

    private handleDeleteElements() {
    }

    private handleSyncElements() {
    }

    private onFetchSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SPRITE = packet.content;
        const { ids, nodeType } = content;
        this.sceneEditor.fetchSprite(ids, nodeType);
    }

    private onAddSceneryHandler() {
    }

    private onUpdateSceneryHandler() {
    }

    private onDeleteSceneryHandler() {
    }

    private onFetchSceneryHandler(packet: PBpacket) {
        const content: op_client.IOP_EDITOR_REQ_CLIENT_FETCH_SCENERY = packet.content;
        this.sceneEditor.fetchScenery(content.id);
    }
}
