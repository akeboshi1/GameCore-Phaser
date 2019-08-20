import { ElementManager } from "../element/element.manager";
import { PBpacket, PacketHandler } from "net-socket-packet";
import { RoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";

export class PlayerManager extends PacketHandler {
  constructor(private mRoom: RoomManager) {
    super();
    this.connection.addPacketListener(this);
  }

  protected registerHandler() {
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
  }

  get connection(): ConnectionService {
    return this.mRoom.connection;
  }

  private onAdd(packet: PBpacket) {}

  private onRemove(packet: PBpacket) { }

  private onMove(packet: PBpacket) { }

  private onSetPosition(PBpacket) { }
}
