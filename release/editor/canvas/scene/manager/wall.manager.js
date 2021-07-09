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
import { LayerEnum } from "game-capsule";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_editor, op_def, op_client } from "pixelpai_proto";
import { Direction } from "structure";
export class EditorWallManager extends PacketHandler {
  constructor(sceneEditor) {
    super();
    this.sceneEditor = sceneEditor;
    __publicField(this, "taskQueue", new Map());
    __publicField(this, "walls", new Map());
    const connection = this.sceneEditor.connection;
    if (connection) {
      connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_ADD_SPRITES_WITH_LOCS, this.handleCreateWalls);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_SPRITES_WITH_LOCS, this.handleDeleteWalls);
    }
  }
  update() {
    this.batchActionSprites();
  }
  addWalls(terrainCoorData) {
    const { locs, key } = terrainCoorData;
    const drawLocs = locs.filter((loc) => this.exist(loc, key));
    const placeLocs = [];
    for (const loc of drawLocs) {
      if (!this.canPut(loc))
        continue;
      const locId = this.genLocId(loc.x, loc.y);
      const placeLoc = __spreadProps(__spreadValues({}, loc), {
        key,
        id: 0
      });
      const oldWall = this.walls.get(locId);
      if (oldWall && oldWall.key !== key) {
        this.taskQueue.set(locId, {
          action: "UPDATE",
          loc: placeLoc
        });
      } else {
        this.taskQueue.set(locId, {
          action: "ADD",
          loc: placeLoc
        });
      }
      placeLocs.push(placeLoc);
      if (loc.dir === Direction.concave) {
        this.removeDuplicate(loc.x, loc.y);
      }
    }
    this.reqEditorAddTerrainsData(placeLocs);
  }
  removeWalls(locations) {
    const removeWalls = [];
    for (const pos of locations) {
      const locId = this.genLocId(pos.x, pos.y);
      const wall = this.walls.get(locId);
      if (!wall) {
        continue;
      }
      removeWalls.push(wall);
      this.taskQueue.set(locId, {
        action: "DELETE",
        loc: {
          x: pos.x,
          y: pos.y
        }
      });
    }
    if (removeWalls.length > 0)
      this.reqEditorDeleteTerrainsData(removeWalls);
  }
  handleCreateWalls(packet) {
    const content = packet.content;
    const { locs, nodeType } = content;
    if (nodeType !== op_def.NodeType.WallNodeType) {
      return;
    }
    for (const loc of locs) {
      const locId = this.genLocId(loc.x, loc.y);
      const placeLoc = __spreadProps(__spreadValues({}, loc), {
        key: loc.key,
        id: loc.id
      });
      this.taskQueue.set(locId, {
        action: "ADD",
        loc: placeLoc
      });
    }
  }
  handleDeleteWalls(packet) {
    const content = packet.content;
    const { locs, nodeType } = content;
    if (nodeType !== op_def.NodeType.WallNodeType) {
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
        const palette = this.sceneEditor.elementStorage.getMossPalette(loc.key);
        if (!palette)
          continue;
        const sprite = palette.frameModel.createSprite({
          nodeType: op_def.NodeType.WallNodeType,
          x: loc.x,
          y: loc.y,
          z: 0,
          dir: loc.dir,
          layer: LayerEnum.Wall
        });
        this.walls.set(locId, loc);
        this.sceneEditor.displayObjectPool.push("walls", locId, sprite);
      } else if (action === "DELETE") {
        this.walls.delete(locId);
        this.sceneEditor.displayObjectPool.remove("walls", locId);
      } else if (action === "UPDATE") {
        const palette = this.sceneEditor.elementStorage.getMossPalette(loc.key);
        if (!palette)
          continue;
        const sprite = palette.frameModel.createSprite({
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
  }
  reqEditorAddTerrainsData(locs) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_CREATE_WALLS);
    const content = pkt.content;
    content.locs = locs;
    this.sceneEditor.connection.send(pkt);
  }
  reqEditorDeleteTerrainsData(loc) {
    const pkt = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_DELETE_WALLS);
    const content = pkt.content;
    content.locs = loc;
    this.sceneEditor.connection.send(pkt);
  }
  exist(pos, key) {
    const locId = this.genLocId(pos.x, pos.y);
    const roomSize = this.sceneEditor.roomSize;
    if (!roomSize)
      return false;
    if (pos.x < 0 || pos.y < 0 || pos.x >= roomSize.cols || pos.y >= roomSize.rows) {
      return false;
    }
    const oldWall = this.walls.get(locId);
    if (oldWall && oldWall.key === key) {
      return false;
    }
    return true;
  }
  removeDuplicate(x, y) {
    const locs = [{ x: x + 1, y }, { x, y: y + 1 }];
    const removes = [];
    for (const loc of locs) {
      const l = this.genLocId(loc.x, loc.y);
      const wall = this.walls.get(l);
      if (wall) {
        if (wall.dir === Direction.west_south || wall.dir === Direction.south_east)
          removes.push(loc);
      }
    }
    if (removes.length > 0)
      this.removeWalls(removes);
  }
  canPut(loc) {
    const { x, y, dir } = loc;
    let key = null;
    if (dir === Direction.west_south) {
      key = this.genLocId(x - 1, y);
    } else if (dir === Direction.south_east) {
      key = this.genLocId(x, y - 1);
    }
    if (!key)
      return true;
    const wall = this.walls.get(key);
    if (!wall)
      return true;
    return wall.dir !== Direction.concave;
  }
  genLocId(x, y) {
    return `${x}_${y}`;
  }
}
