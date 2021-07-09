var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { Helpers } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
export class EditorMossManager extends PacketHandler {
  constructor(sceneEditor) {
    super();
    this.sceneEditor = sceneEditor;
    __publicField(this, "taskQueue", new Map());
    __publicField(this, "editorMosses", new Map());
    const connection = this.sceneEditor.connection;
    if (connection) {
      connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_MOSSES, this.handleAddMosses);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_MOSSES, this.handleDeleteMosses);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_SYNC_MOSSES, this.handleUpdateMosses);
    }
  }
  update() {
    this.batchActionSprites();
  }
  destroy() {
    const connection = this.sceneEditor.connection;
    if (connection) {
      connection.removePacketListener(this);
    }
  }
  addMosses(coorData) {
    const placeLocs = [];
    const { locs, key } = coorData;
    for (const loc of locs) {
      const id = Helpers.genId();
      const placeLoc = {
        x: loc.x,
        y: loc.y,
        z: loc.z,
        key,
        id
      };
      this.taskQueue.set(id, {
        action: "ADD",
        loc: placeLoc
      });
      placeLocs.push(placeLoc);
    }
    this.reqEditorCreateMossData(placeLocs);
  }
  reqEditorCreateMossData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_MOSSES);
    const content = pkt.content;
    content.locs = locs;
    this.sceneEditor.connection.send(pkt);
  }
  updateMosses(elements) {
    const updateLocs = [];
    for (const element of elements) {
      const sprite = element.toSprite();
      const originLoc = this.editorMosses.get(sprite.id);
      const loc = {
        x: sprite.point3f.x,
        y: sprite.point3f.y,
        z: sprite.point3f.z,
        id: sprite.id,
        dir: sprite.direction,
        key: originLoc.key
      };
      this.taskQueue.set(sprite.id, {
        action: "UPDATE",
        loc
      });
      updateLocs.push(loc);
    }
    this.reqEditorUpdateMossData(updateLocs);
  }
  reqEditorUpdateMossData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_SYNC_MOSSES);
    const content = pkt.content;
    content.locs = locs;
    this.sceneEditor.connection.send(pkt);
  }
  deleteMosses(ids) {
    const deleteLocs = [];
    for (const id of ids) {
      const loc = this.editorMosses.get(id);
      deleteLocs.push(loc);
      this.taskQueue.set(id, {
        action: "DELETE",
        loc
      });
    }
    this.reqEditorDeleteMossData(deleteLocs);
  }
  reqEditorDeleteMossData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_MOSSES);
    const content = pkt.content;
    content.locs = locs;
    this.sceneEditor.connection.send(pkt);
  }
  addToMap() {
  }
  removeFromMap() {
  }
  handleAddMosses(packet) {
    const content = packet.content;
    const locs = content.locs;
    for (const loc of locs) {
      this.sceneEditor.displayObjectPool.addCache(loc.id);
      this.taskQueue.set(loc.id, {
        action: "ADD",
        loc
      });
    }
  }
  handleDeleteMosses(packet) {
    const content = packet.content;
    const ids = content.ids;
    for (const id of ids) {
      this.taskQueue.set(id, {
        action: "DELETE",
        loc: this.editorMosses.get(id)
      });
    }
    this.sceneEditor.unselectElement();
  }
  handleUpdateMosses(packet) {
    const content = packet.content;
    const locs = content.locs;
    for (const loc of locs) {
      this.taskQueue.set(loc.id, {
        action: "UPDATE",
        loc
      });
    }
  }
  batchActionSprites() {
    if (!Array.from(this.taskQueue.keys()).length) {
      return;
    }
    const batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);
    for (const key of batchTasksKeys) {
      const { action, loc } = this.taskQueue.get(key);
      this.taskQueue.delete(key);
      if (action === "ADD") {
        const moss = this.sceneEditor.elementStorage.getMossPalette(loc.key);
        if (!moss)
          continue;
        const sprite = moss.frameModel.createSprite(__spreadProps(__spreadValues({}, loc), {
          nodeType: op_def.NodeType.ElementNodeType,
          isMoss: true,
          layer: moss.layer
        }));
        this.editorMosses.set(loc.id, loc);
        this.sceneEditor.displayObjectPool.push("mosses", loc.id.toString(), sprite);
      } else if (action === "DELETE") {
        if (loc) {
          this.editorMosses.delete(loc.id);
          this.sceneEditor.displayObjectPool.remove("mosses", loc.id.toString());
        }
      } else if (action === "UPDATE") {
        const moss = this.sceneEditor.elementStorage.getMossPalette(loc.key);
        if (!moss)
          continue;
        const sprite = moss.frameModel.createSprite(__spreadProps(__spreadValues({}, loc), {
          nodeType: op_def.NodeType.ElementNodeType,
          isMoss: true,
          layer: moss.layer
        }));
        this.editorMosses.set(loc.id, loc);
        this.sceneEditor.displayObjectPool.update("mosses", loc.id.toString(), sprite);
      }
    }
  }
}
