import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

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
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY, this.onQueryMarketHandler);
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
  queryMarket(marketName: string, page: number, category: string, subCategory: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY = packet.content;
    content.page = page;
    content.perPage = 1000;
    content.category = category;
    content.subcategory = subCategory;
    content.marketName = marketName;
    this.connection.send(packet);
  }
  private handleCharacterChat(packet: PBpacket) {
    this.mEvent.emit("chat", packet.content);
  }

  get connection(): ConnectionService {
    if (this.world) {
      return this.world.connection;
    }
  }

  private onQueryMarketHandler(packet: PBpacket) {
    this.mEvent.emit("queryMarket", packet.content);
  }
}
