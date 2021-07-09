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
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_def, op_client, op_editor } from "pixelpai_proto";
export class EditorTerrainManager extends PacketHandler {
  constructor(sceneEditor) {
    super();
    this.sceneEditor = sceneEditor;
    __publicField(this, "taskQueue", new Map());
    __publicField(this, "mEditorTerrains", new Map());
    const connection = this.sceneEditor.connection;
    if (connection) {
      connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleAddTerrains);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS, this.handleDeleteTerrains);
    }
  }
  destroy() {
    const connection = this.sceneEditor.connection;
    if (connection) {
      connection.removePacketListener(this);
    }
  }
  addTerrains(terrainCoorData) {
    const { locs, key } = terrainCoorData;
    const drawLocs = locs.filter((loc) => this.exist(loc, key));
    for (const loc of drawLocs) {
      const locId = this.genLocId(loc.x, loc.y);
      const oldKey = this.mEditorTerrains.get(locId);
      if (oldKey && oldKey !== key) {
        this.taskQueue.set(locId, {
          action: "UPDATE",
          loc: __spreadProps(__spreadValues({}, loc), { key })
        });
      } else {
        this.taskQueue.set(locId, {
          action: "ADD",
          loc: __spreadProps(__spreadValues({}, loc), { key })
        });
      }
    }
    this.reqEditorAddTerrainsData(drawLocs, key);
  }
  reqEditorAddTerrainsData(locs, key) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_ADD_TERRAINS);
    const content = pkt.content;
    content.locs = locs;
    content.key = key;
    this.sceneEditor.connection.send(pkt);
  }
  removeTerrains(locations) {
    for (const pos of locations) {
      const locId = this.genLocId(pos.x, pos.y);
      this.taskQueue.set(locId, {
        action: "DELETE",
        loc: {
          x: pos.x,
          y: pos.y
        }
      });
    }
    this.reqEditorDeleteTerrainsData(locations);
  }
  reqEditorDeleteTerrainsData(loc) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_TERRAINS);
    const content = pkt.content;
    content.locs = loc.map((item) => ({ x: item.x, y: item.y, z: item.z }));
    this.sceneEditor.connection.send(pkt);
  }
  update() {
    this.batchActionSprites();
  }
  addToMap() {
  }
  removeFromMap() {
  }
  existTerrain(x, y) {
    const locId = this.genLocId(x, y);
    return this.mEditorTerrains.has(locId);
  }
  handleAddTerrains(packet) {
    const content = packet.content;
    const locs = content.locs;
    const nodeType = content.nodeType;
    if (nodeType !== op_def.NodeType.TerrainNodeType) {
      return;
    }
    for (const loc of locs) {
      const locId = this.genLocId(loc.x, loc.y);
      const oldKey = this.mEditorTerrains.get(locId);
      if (oldKey && oldKey === loc.key)
        continue;
      this.taskQueue.set(locId, {
        action: "ADD",
        loc
      });
    }
  }
  handleDeleteTerrains(packet) {
    const content = packet.content;
    const locs = content.locs;
    const nodeType = content.nodeType;
    if (nodeType !== op_def.NodeType.TerrainNodeType) {
      return;
    }
    for (const loc of locs) {
      const locId = this.genLocId(loc.x, loc.y);
      this.taskQueue.set(locId, {
        action: "DELETE",
        loc
      });
    }
  }
  exist(pos, key) {
    const locId = this.genLocId(pos.x, pos.y);
    const roomSize = this.sceneEditor.roomSize;
    if (!roomSize)
      return false;
    if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
      return false;
    }
    if (this.mEditorTerrains.get(locId) === key) {
      return false;
    }
    return true;
  }
  batchActionSprites() {
    if (!Array.from(this.taskQueue.keys()).length) {
      return;
    }
    const batchTasksKeys = Array.from(this.taskQueue.keys()).splice(0, 200);
    for (const key of batchTasksKeys) {
      const { action, loc } = this.taskQueue.get(key);
      const locId = this.genLocId(loc.x, loc.y);
      this.taskQueue.delete(key);
      if (action === "ADD") {
        const palette = this.sceneEditor.elementStorage.getTerrainPalette(loc.key);
        if (!palette)
          continue;
        const sprite = palette.createSprite({
          nodeType: op_def.NodeType.TerrainNodeType,
          x: loc.x,
          y: loc.y,
          z: 0
        });
        this.mEditorTerrains.set(locId, loc.key);
        this.sceneEditor.displayObjectPool.push("terrains", locId, sprite);
      } else if (action === "DELETE") {
        this.mEditorTerrains.delete(locId);
        this.sceneEditor.displayObjectPool.remove("terrains", locId);
      } else if (action === "UPDATE") {
        const palette = this.sceneEditor.elementStorage.getTerrainPalette(loc.key);
        if (!palette)
          continue;
        const sprite = palette.createSprite({
          nodeType: op_def.NodeType.TerrainNodeType,
          x: loc.x,
          y: loc.y,
          z: 0
        });
        this.mEditorTerrains.set(locId, loc.key);
        this.sceneEditor.displayObjectPool.update("terrains", locId, sprite);
      }
    }
  }
  genLocId(x, y) {
    return `${x}_${y}`;
  }
}
