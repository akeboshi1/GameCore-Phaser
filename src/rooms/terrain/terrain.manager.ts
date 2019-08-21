import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { RoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { Terrain } from "./terrain";

export interface TerrainService {
  connection: ConnectionService;
}

export class TerrainManager extends PacketHandler implements TerrainService {
  private mTerrains: Map<number, Terrain>;
  constructor(private mRoom: RoomManager) {
    super();
    this.connection.addPacketListener(this);

    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN, this.onAddHandler);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN_END, this.onAddEndHanlder)
    this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_TERRAIN, this.onDeleteTerrainHandler);
  }

  private onAddHandler(packet: PBpacket) {
    if (!this.mTerrains) {
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN = packet.content;
    const terrains = content.terrain;
    for (const terrain of terrains) {
      const t = new Terrain(this);
      this.mTerrains.set(terrain.id, t);
    }
  }

  private onAddEndHanlder(packet: PBpacket) { }

  private onDeleteTerrainHandler(packet: PBpacket) { }

  get connection(): ConnectionService {
    return this.mRoom.connection;
  }
}