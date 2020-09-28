import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { ConnectionService } from "../../../../../lib/net/connection.service";

export class FurniBag extends PacketHandler {
  private readonly world: WorldService;
  private mEvent: Phaser.Events.EventEmitter;
  private mSceneType: op_def.SceneTypeEnum;
  private categoryType: op_pkt_def.PKT_PackageType;
  constructor($world: WorldService, sceneType: op_def.SceneTypeEnum) {
    super();
    this.world = $world;
    this.mSceneType = sceneType;
    this.mEvent = new Phaser.Events.EventEmitter();
  }
  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES, this.onPackageCategoriesHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE, this.onQueryMarketPackage);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE, this.onQueryCommodityResultHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE, this.onQueryEditPackage);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR, this.onQueryResetAvatar);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_DRESS_AVATAR_ITEM_ID, this.onRetDressAvatarItemIDS);
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

  getCategories(categoryType: number) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PACKAGE_CATEGORIES);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
    content.category = categoryType;
    this.connection.send(packet);
    this.categoryType = categoryType;
  }

  queryPackage(key: string, queryString?: string) {
    if (this.mSceneType === op_def.SceneTypeEnum.NORMAL_SCENE_TYPE) {
      this.queryMarketPackage(key, queryString);
    } else {
      this.queryEditPackage(key, queryString);
    }
  }

  queryCommodityResource(id: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE_ITEM_RESOURCE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE_ITEM_RESOURCE = packet.content;
    content.id = id;
    this.connection.send(packet);
  }

  addFurniToScene(id: string) {
    if (this.mSceneType !== op_def.SceneTypeEnum.EDIT_SCENE_TYPE) {
      return;
    }
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SELECTED_SPRITE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SELECTED_SPRITE = packet.content;
    content.id = id;
    this.connection.send(packet);
  }

  enterEditAndSelectedSprite(id: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENABLE_AND_SELECTED_SPRITE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ENABLE_AND_SELECTED_SPRITE = packet.content;
    content.id = id;
    this.connection.send(packet);
  }

  seachPackage(seach: string, category: string) {
    this.queryPackage(category, seach);
  }

  sellProps(prop: op_client.CountablePackageItem, count: number, category: number) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_SELL_PACKAGE_ITEM);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_SELL_PACKAGE_ITEM = packet.content;
    content.category = category;
    const item = op_client.CountablePackageItem.create(prop);
    item.count = count;
    content.items = [item];
    content.totalPrice = item.sellingPrice;
    content.totalPrice.price *= count;
    this.connection.send(packet);
  }
  useProps(itemid: string, count: number) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_USE_ITEM);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_USE_ITEM = packet.content;
    content.itemId = itemid;
    content.count = count;
    this.connection.send(packet);
  }
  querySaveAvatar(avatarids: string[]) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DRESS_UP_AVATAR);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_DRESS_UP_AVATAR = packet.content;
    content.avatarItemIds = avatarids;
    this.connection.send(packet);
  }

  queryResetAvatar(avatar: op_gameconfig.Avatar) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_RESET_AVATAR);
    this.connection.send(packet);
  }

  queryDressAvatarItemIDs() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CURRENT_DRESS_AVATAR_ITEM_ID);
    this.connection.send(packet);
  }

  destroy() {
    this.unregister();
    this.mEvent.destroy();
  }

  private onPackageCategoriesHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
    if (content.category === this.categoryType) {
      this.mEvent.emit("packageCategory", content.subcategory);
    }
  }

  private onQueryMarketPackage(packge: PBpacket) {
    // OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE
    const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE = packge.content;
    if (content.category === this.categoryType) {
      this.mEvent.emit("queryPackage", content);
    }
  }

  private onQueryEditPackage(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE = packet.content;
    if (content.category === this.categoryType) {
      this.mEvent.emit("queryPackage", content);
    }
  }

  private onQueryCommodityResultHandler(packet: PBpacket) {
    this.mEvent.emit("queryCommodityResource", packet.content);
  }
  private onQueryResetAvatar(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR = packet.content;
    this.mEvent.emit("queryResetAvatar", content);
  }
  private queryMarketPackage(key: string, queryString?: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE = packet.content;
    content.category = this.categoryType;
    content.page = 1;
    content.perPage = 1000000;
    content.subcategory = key;
    content.queryString = queryString;
    this.connection.send(packet);
  }

  private queryEditPackage(key: string, queryString?: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_QUERY_EDIT_PACKAGE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_QUERY_EDIT_PACKAGE = packet.content;
    content.category = this.categoryType;
    content.page = 1;
    content.perPage = 1000000;
    content.subcategory = key;
    content.queryString = queryString;
    this.connection.send(packet);
  }
  private onRetDressAvatarItemIDS(packet: PBpacket) {
    const content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_CURRENT_DRESS_AVATAR_ITEM_ID = packet.content;
    this.mEvent.emit("avatarIDs", content.avatarItemIds);
  }
  get connection(): ConnectionService {
    if (this.world) {
      return this.world.connection;
    }
  }
}
