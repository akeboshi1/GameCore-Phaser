import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaMarket extends BasicModel {
  public market_name: string;
  public market_data: any;
  constructor(game: Game) {
    super(game);
    this.register();
  }
  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES, this.onGetMarketCategoriesHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY, this.onQueryMarketHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE, this.onQueryCommodityResultHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_MARKET_SHOW_MARKET_BY_NAME, this.openMarketPanel);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SHOP_DATA, this.setMarketData);

    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  setMarketName(market_name: string) {
    this.market_name = market_name;
  }

  // /**
  //  * 获取商品分类
  //  */
  // getMarkCategories() {
  //   const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_GET_CATEGORIES);
  //   const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_GET_CATEGORIES = packet.content;
  //   content.marketName = this.market_name;
  //   this.connection.send(packet);
  // }

  queryMarket(page: number, category: string, subCategory: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY = packet.content;
    content.page = page;
    content.perPage = 1000;
    content.category = category;
    content.subcategory = subCategory;
    content.marketName = this.market_name;
    this.connection.send(packet);
  }

  buyMarketCommodities(commodities: op_def.IOrderCommodities[]) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_BUY_ORDER_COMMODITIES = packet.content;
    content.orderCommodities = commodities;
    content.marketName = this.market_name;
    this.connection.send(packet);
  }

  queryCommodityResource(id: string, category: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_COMMODITY_RESOURCE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_COMMODITY_RESOURCE = packet.content;
    content.id = id;
    content.category = category;
    content.marketName = this.market_name;
    this.connection.send(packet);
  }

  queryShopData() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SHOP_DATA);
    const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_SHOP_DATA = packet.content;
    content.shopName = this.market_name;
    this.connection.send(packet);
  }

  destroy() {
    this.unregister();
  }

  private onGetMarketCategoriesHandler(packet: PBpacket) {
    // const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES = ;
    this.game.emitter.emit(ModuleName.PICAMARKET_NAME + "_getMarketCategories", packet.content);
  }

  private onQueryMarketHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY = packet.content;
    this.game.emitter.emit(ModuleName.PICAMARKET_NAME + "_queryMarket", content);
  }

  private onQueryCommodityResultHandler(packet: PBpacket) {
    const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE = packet.content;
    packet.content.market_name = this.market_name;
    this.game.emitter.emit(ModuleName.PICAMARKET_NAME + "_queryCommodityResource", packet.content);
  }

  private openMarketPanel(packge: PBpacket) {
    const content: op_client.OP_VIRTUAL_WORLD_REQ_CLIENT_MARKET_SHOW_MARKET_BY_NAME = packge.content;
    this.game.emitter.emit(ModuleName.PICAMARKET_NAME + "_showopen", content);
  }

  private setMarketData(packet: PBpacket) {
    const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_SHOP_DATA = packet.content;
    this.game.emitter.emit(ModuleName.PICAMARKET_NAME + "_setmarketdata", content);
  }

  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }

}
