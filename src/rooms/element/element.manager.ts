import { PacketHandler, PBpacket } from "net-socket-packet";
import { RoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";

export interface IElementManager {
}

export class ElementManager extends PacketHandler implements IElementManager {
  constructor(private mRoom: RoomManager) {
    super();
    this.connection.addPacketListener(this);
  }

  protected registerHandler() {
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.onAdd);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onRemove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onMove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.onSetPosition);
  }

  get connection(): ConnectionService {
    return this.mRoom.connection;
  }

  private onAdd(packet: PBpacket) { }

  private onRemove(packet: PBpacket) { }

  private onMove(packet: PBpacket) { }

  private onSetPosition(packet: PBpacket) { }
}
