import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { op_client } from "pixelpai_proto";
import { Terrain } from "./terrain";
import { IRoomService } from "../room";
import { FramesModel } from "../display/frames.model";
import { IElementManager } from "../element/element.manager";
import { Console } from "../../utils/log";

export class TerrainManager extends PacketHandler implements IElementManager {
  private mTerrains: Map<number, Terrain>;

  constructor(private mRoom: IRoomService) {
    super();

    if (this.connection) {
      this.connection.addPacketListener(this);

      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN, this.onAddHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN_END, this.onAddEndHanlder);
      this.addHandlerFun(op_client.OPCODE._OP_EDITOR_REQ_CLIENT_DELETE_TERRAIN, this.onDeleteTerrainHandler);
    }
  }

  public init() {
    if (!this.mTerrains) {
      this.mTerrains = new Map();
    }
    this.mTerrains.clear();
  }

  private onAddHandler(packet: PBpacket) {
    if (!this.mTerrains) {
      this.mTerrains = new Map();
    }
    if (!this.mRoom.layerManager) {
      Console.error("layer manager is undefined");
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_TERRAIN = packet.content;
    const terrains = content.terrain;
    if (terrains) {
      for (const terrain of terrains) {
        const ter = new Terrain(terrain, this);
        const loader = new FramesModel();
        loader.setInfo(terrain);
        ter.load(loader);
        // this.mRoom.addToGround(ter.getDisplay());
        // addElement(ter.getDisplay(),LayerType.GroundLayer);
        this.mTerrains.set(terrain.id || 0, ter);
      }
    }
  }

  private onAddEndHanlder(packet: PBpacket) { }

  private onDeleteTerrainHandler(packet: PBpacket) { }

  get connection(): ConnectionService | undefined {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    Console.error("room manager is undefined");
  }

  get roomService(): IRoomService {
    return this.mRoom;
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }
}
