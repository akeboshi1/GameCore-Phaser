var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { op_virtual_world, op_def } from "pixelpai_proto";
import { PBpacket } from "net-socket-packet";
import { Tool, BlockIndex } from "utils";
export class BlockIndexManager {
  constructor(room) {
    this.room = room;
    __publicField(this, "preBlockIndex", []);
    __publicField(this, "zoom");
    this.zoom = room.game.scaleRatio;
  }
  checkBlockIndex(cameraView) {
    return __async(this, null, function* () {
      const blockIndex = new BlockIndex().getBlockForCameras(cameraView, this.room.roomSize);
      if (!Tool.equalArr(this.preBlockIndex, blockIndex)) {
        this.syncBlockIndex(blockIndex);
      }
    });
  }
  syncBlockIndex(blockIndex) {
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_UPDATE_HOT_BLOCK);
    const content = pkt.content;
    content.blockIndex = blockIndex;
    this.room.game.connection.send(pkt);
    const newIndex = blockIndex.filter((index) => this.preBlockIndex.includes(index) === false);
    const elementStorage = this.room.game.elementStorage;
    const element = elementStorage.getElementFromBlockIndex(newIndex, op_def.NodeType.ElementNodeType);
    this.room.elementManager.addDisplayRef(element);
    const terrain = elementStorage.getElementFromBlockIndex(newIndex, op_def.NodeType.TerrainNodeType);
    this.room.terrainManager.addDisplayRef(terrain);
    this.preBlockIndex = blockIndex;
  }
}
