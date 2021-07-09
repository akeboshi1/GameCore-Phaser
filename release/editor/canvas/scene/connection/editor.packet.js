import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_editor, op_def } from "pixelpai_proto";
export class EditorPacket extends PacketHandler {
  constructor(sceneEditor, connection) {
    super();
    this.sceneEditor = sceneEditor;
    this.connection = connection;
    this.connection.addPacketListener(this);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_CHANGE_TO_EDITOR_MODE, this.onEnterEditor);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_MOUSE_SELECTED_SPRITE, this.onMouseFollowHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SET_EDITOR_MODE, this.onSetEditorModeHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ALIGN_GRID, this.onAlignGridHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_VISIBLE_GRID, this.onVisibleGridHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleAddTerrains);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SPRITE, this.onFetchSpriteHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, this.onAddSceneryHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, this.onUpdateSceneryHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, this.onDeleteSceneryHandler);
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_FETCH_SCENERY, this.onFetchSceneryHandler);
  }
  destroy() {
    if (this.connection)
      this.connection.removePacketListener(this);
  }
  sceneCreate() {
    this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
  }
  reqEditorSyncPaletteOrMoss(key, nodeType) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_PALETTE_MOSS);
    const content = pkt.content;
    content.key = key;
    content.type = nodeType;
    this.connection.send(pkt);
  }
  callEditorCreateElementData(sprites) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_SPRITE);
    const content = pkt.content;
    content.nodeType = sprites[0].nodeType;
    content.sprites = sprites.map((sprite) => sprite.toSprite());
    this.connection.send(pkt);
  }
  reqEditorAddTerrainsData(locs, key) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
    const content = pkt.content;
    content.locs = locs;
    content.key = key;
    this.connection.send(pkt);
  }
  reqEditorDeleteTerrainsData(loc) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
    const content = pkt.content;
    content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
    this.connection.send(pkt);
  }
  reqEditorCreateMossData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_MOSSES);
    const content = pkt.content;
    content.locs = locs;
    this.connection.send(pkt);
  }
  reqEditorDeleteMossData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_MOSSES);
    const content = pkt.content;
    content.locs = locs;
    this.connection.send(pkt);
  }
  reqEditorUpdateMossData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_MOSSES);
    const content = pkt.content;
    content.locs = locs;
    this.connection.send(pkt);
  }
  callEditorUpdateElementData(sprites) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_SPRITE);
    const content = pkt.content;
    content.sprites = sprites;
    this.connection.send(pkt);
  }
  deleteSprite(ids) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_SPRITE);
    const content = pkt.content;
    content.ids = ids;
    content.nodeType = op_def.NodeType.ElementNodeType;
    this.connection.send(pkt);
  }
  sendFetch(ids, nodetype, isMoss) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_SPRITE);
    const content = pkt.content;
    content.ids = ids;
    content.isMoss = isMoss;
    content.nodeType = nodetype;
    this.connection.send(pkt);
  }
  resetCameras(x, y, width, height) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_RESET_CAMERA);
    const content = pkt.content;
    content.x = x;
    content.y = y;
    content.width = width;
    content.height = height;
    this.connection.send(pkt);
  }
  onEnterEditor(packet) {
    const content = packet.content;
    this.sceneEditor.enter(content.scene);
  }
  onMouseFollowHandler(packet) {
    const content = packet.content;
    this.sceneEditor.setSprite(content);
  }
  onSetEditorModeHandler(packet) {
    const mode = packet.content;
    this.sceneEditor.changeBrushType(mode.mode);
  }
  onAlignGridHandler(packet) {
    const content = packet.content;
    this.sceneEditor.toggleAlignWithGrid(content.align);
  }
  onVisibleGridHandler(packet) {
    const content = packet.content;
    this.sceneEditor.toggleLayerVisible(content.visible);
  }
  handleAddTerrains(packet) {
    const content = packet.content;
    const locs = content.locs;
    const nodeType = content.nodeType;
    if (nodeType !== op_def.NodeType.TerrainNodeType) {
      return;
    }
  }
  handleAddMosses(packet) {
    const content = packet.content;
    const locs = content.locs;
  }
  handleDeleteMosses() {
  }
  handleUpdateMosses() {
  }
  handleCreateElements(packet) {
    const content = packet.content;
    const { sprites, nodeType } = content;
  }
  handleDeleteElements() {
  }
  handleSyncElements() {
  }
  onFetchSpriteHandler(packet) {
    const content = packet.content;
    const { ids, nodeType } = content;
    this.sceneEditor.fetchSprite(ids, nodeType);
  }
  onAddSceneryHandler() {
  }
  onUpdateSceneryHandler() {
  }
  onDeleteSceneryHandler() {
  }
  onFetchSceneryHandler(packet) {
    const content = packet.content;
    this.sceneEditor.fetchScenery(content.id);
  }
}
