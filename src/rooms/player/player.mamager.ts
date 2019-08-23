import { ElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { IRoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { Player } from "./player";
import { Room } from "../room";
import { LayerType } from "../layer/layer.manager";

export class PlayerManager extends PacketHandler {
  private mPlayerMap: Map<number, Player>;
  constructor(private mRoomMgr: IRoomManager, private mRoom: Room) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);

      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
      this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
    }
  }

  get connection(): ConnectionService {
    if (this.mRoom) {
      return this.mRoom.connection;
    }
    console.error("room is undefined");
  }

  private onAdd(packet: PBpacket) {
    if (!this.mPlayerMap) {
      this.mPlayerMap = new Map();
    }
    const layer = this.mRoom.layerManager.getLayerByType(LayerType.SurfaceLayer);
    if (!!layer === false) {
      console.error("can't find surface layer");
      return;
    }
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER = packet.content;
    const players = content.actors;
    if (players) {
      for (const player of players) {
        const plyer = new Player(this, layer);
        plyer.load(player);
        this.mPlayerMap.set(player.id || 0, plyer);
      }
    }
  }

  private onRemove(packet: PBpacket) {

  }

  private onMove(packet: PBpacket) {
    //todo player move
  }

  private onSetPosition(packet: PBpacket) { }

  get scene(): Phaser.Scene | undefined {
    if (this.mRoom) {
      return this.mRoom.scene;
    }
  }
}
