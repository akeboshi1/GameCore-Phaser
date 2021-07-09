import { PacketHandler } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
export class GuideWorkerManager extends PacketHandler {
  constructor(game) {
    super();
    this.game = game;
  }
  addPackListener() {
    const connection = this.game.connection;
    if (!connection) {
      return;
    }
    connection.addPacketListener(this);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_PKT_GUIDE_DATA, this.onUPDATE_PLAYER_GUIDE);
  }
  removePackListener() {
    const connection = this.game.connection;
    if (!connection) {
      return;
    }
    connection.removePacketListener(this);
  }
  stopGuide(id) {
  }
  onUPDATE_PLAYER_GUIDE(packet) {
  }
  destroy() {
    this.removePackListener();
  }
}
