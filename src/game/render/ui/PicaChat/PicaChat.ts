import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world , op_def} from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { ConnectionService } from "../../../../../lib/net/connection.service";

export class PicaChat extends PacketHandler {
  private readonly world: WorldService;
  private mEvent: Phaser.Events.EventEmitter;
  constructor($world: WorldService) {
    super();
    this.world = $world;
    this.mEvent = new Phaser.Events.EventEmitter();
  }
  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_CHAT, this.handleCharacterChat);
    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  on(event: string | symbol, fn: Function, context?: any) {
    this.mEvent.on(event, fn, context);
  }

  off(event: string | symbol, fn: Function, context?: any) {
    this.mEvent.off(event, fn, context);
  }

  sendMessage(val: string) {
    const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
    const content: op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
    content.chatChannel = 0;
    content.chatContext = val;
    this.connection.send(pkt);
  }

  destroy() {
    this.unregister();
    this.mEvent.destroy();
  }

  private handleCharacterChat(packet: PBpacket) {
    this.mEvent.emit("chat", packet.content);
  }

  get connection(): ConnectionService {
    if (this.world) {
      return this.world.connection;
    }
  }

}
