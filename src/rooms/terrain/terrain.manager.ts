import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { IRoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { LayerType } from "../layer/layer.manager";
import { RoomService } from "../room";
import { DisplayInfo } from "../display/display.info";
import { IElementManager } from "../element/element.manager";

export class TerrainManager extends PacketHandler implements IElementManager {
  private mTerrains: Map<number, Terrain>;

  constructor(private mRoomMgr: IRoomManager, private mRoom: RoomService) {
    super();
    
    if (this.connection) {
      this.connection.addPacketListener(this);

      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN, this.onAddHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN_END, this.onAddEndHanlder)
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_TERRAIN, this.onDeleteTerrainHandler);
    }
  }

  init() {
    if (!this.mTerrains) {
      this.mTerrains = new Map();
    }
    this.mTerrains.clear();
  }

  private onAddHandler(packet: PBpacket) {
    if (!this.mTerrains) {
      this.mTerrains = new Map();
    }
    if (!!this.mRoomMgr === false) {
      console.error("room manager is undefined");
      return;
    }
    if (!!this.mRoom.layerManager === false) {
      console.error("layer manager is undefined");
      return;
    }
    const layer = this.mRoom.layerManager.getLayerByType(LayerType.GroundLayer);
    if (!!layer === false) {
      console.error("can't find ground layer");
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN = packet.content;
    const terrains = content.terrain;
    if (terrains) {
      for (const terrain of terrains) {
        const ter = new Terrain(this, layer);
        const loader = new DisplayInfo();
        loader.setInfo(terrain);
        ter.load(loader);
        this.mTerrains.set(terrain.id || 0, ter);
      }
    }
    console.log(terrains);
  }

  private onAddEndHanlder(packet: PBpacket) { }

  private onDeleteTerrainHandler(packet: PBpacket) { }

  get connection(): ConnectionService | undefined {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    console.error("room manager is undefined");
  }

  get roomManager(): IRoomManager {
    return this.mRoomMgr;
  }

  get roomService(): RoomService {
    return this.mRoom;
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }
 }
