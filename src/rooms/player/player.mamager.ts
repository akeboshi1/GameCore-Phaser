import { ElementManager } from "../element/element.manager";
import { PBpacket } from "net-socket-packet";
import { RoomManager } from "../room.manager";
import { op_client } from "pixelpai_proto";

export class PlayerManager extends ElementManager {
  constructor(roomManager: RoomManager) {
    super(roomManager);
  }

  protected registerHandler() {
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ADD_CHARACTER, this.onAdd);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_REMOVE_CHARACTER, this.onRemove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_MOVE_CHARACTER, this.onMove);
    this.addHandlerFun(op_client.OPCODE._OP_GATEWAY_REQ_CLIENT_SET_CHARACTER_POSITION, this.onSetPosition);
  }

  onAdd(packet: PBpacket) {}

  onRemove(packet: PBpacket) { }
}
