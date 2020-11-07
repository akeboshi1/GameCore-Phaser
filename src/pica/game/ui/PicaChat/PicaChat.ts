import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { EventType } from "structure";
export class PicaChat extends BasicModel {
  constructor(game: Game) {
    super(game);
    this.register();
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

  sendMessage(val: string) {
    const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT);
    const content: op_virtual_world.IOP_GATEWAY_REQ_VIRTUAL_WORLD_CHAT = pkt.content;
    content.chatChannel = 0;
    content.chatContext = val;
    this.connection.send(pkt);
  }

  destroy() {
    this.unregister();
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

  buyMarketCommodities(commodities: op_def.IOrderCommodities[]) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES = packet.content;
    content.orderCommodities = commodities;
    content.marketName = "gift_shop";
    this.connection.send(packet);
  }

  private handleCharacterChat(packet: PBpacket) {
    this.game.peer.workerEmitter(EventType.CHAT, packet.content);
  }

  private onQueryMarketHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY = packet.content;
    if (content.marketName === "gift_shop")
      this.game.peer.workerEmitter(EventType.QUERY_MARKET, packet.content);
  }

  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }
}
