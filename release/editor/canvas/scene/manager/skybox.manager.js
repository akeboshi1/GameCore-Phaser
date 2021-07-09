var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_editor, op_def } from "pixelpai_proto";
import { Logger } from "structure";
import { BlockManager, BaseScenery } from "baseRender";
export class EditorSkyboxManager extends PacketHandler {
  constructor(sceneEditor) {
    super();
    this.sceneEditor = sceneEditor;
    __publicField(this, "blocks");
    __publicField(this, "mSelected");
    this.blocks = new Map();
    const connection = sceneEditor.connection;
    if (connection) {
      connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SCENERY, this.onAddSceneryHandler);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_UPDATE_SCENERY, this.onUpdateSceneryHandler);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SCENERY, this.onDeleteSceneryHandler);
    }
  }
  destroy() {
    const connection = this.sceneEditor.connection;
    if (connection) {
      connection.removePacketListener(this);
    }
    this.blocks.forEach((block) => block.destroy());
    this.blocks.clear();
  }
  add(scenery) {
    const block = new BlockManager(scenery, this.sceneEditor);
    this.blocks.set(scenery.id, block);
  }
  update(scenery) {
    const blockManager = this.blocks.get(scenery.id);
    if (blockManager) {
      blockManager.update(scenery);
    }
  }
  remove(id) {
    const blockManager = this.blocks.get(id);
    if (blockManager) {
      blockManager.destroy();
    }
  }
  fetch(id) {
    this.mSelected = this.blocks.get(id);
  }
  unselected() {
    this.mSelected = void 0;
  }
  move(pointer) {
    if (!this.mSelected) {
      return;
    }
    const scenery = this.mSelected.scenery;
    if (!scenery) {
      return;
    }
    const offset = scenery.offset;
    offset.x += (pointer.x - pointer.prevPosition.x) / this.sceneEditor.scaleRatio;
    offset.y += (pointer.y - pointer.prevPosition.y) / this.sceneEditor.scaleRatio;
    this.mSelected.updatePosition();
    this.onSyncSceneryOffset();
  }
  onAddSceneryHandler(packet) {
    const content = packet.content;
    this.add(new BaseScenery(content));
  }
  onUpdateSceneryHandler(packet) {
    const content = packet.content;
    this.update(new BaseScenery(content));
  }
  onDeleteSceneryHandler(packet) {
    const content = packet.content;
    const ids = content.ids;
    for (const id of ids) {
      this.remove(id);
    }
  }
  onSyncSceneryOffset() {
    const scenery = this.mSelected.scenery;
    const packet = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_UPDATE_SCENERY);
    const content = packet.content;
    content.id = scenery.id;
    const offset = op_def.PBPoint2f.create();
    Object.assign(offset, scenery.offset);
    Logger.getInstance().log("======>>>: ", offset);
    content.offset = offset;
    this.sceneEditor.connection.send(packet);
  }
}
