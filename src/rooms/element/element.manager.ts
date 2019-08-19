import { PacketHandler, PBpacket } from "net-socket-packet";
import { RoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";

export interface IElementManager {
}

export class ElementManager extends PacketHandler implements IElementManager {
  protected mRoom: RoomManager;

  constructor(room: RoomManager) {
    super();
    this.mRoom = room;
  }

  protected registerHandler() {
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_ELEMENT, this.onAdd);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onRemove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_ELEMENT, this.onMove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_ELEMENT_POSITION, this.onSetPosition);
  }

  protected onAdd(packet: PBpacket) {}

  protected onRemove(packet: PBpacket) { }

  protected onMove(packet: PBpacket) { }

  protected onSetPosition(packet: PBpacket) { }
}
