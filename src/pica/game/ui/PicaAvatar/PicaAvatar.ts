import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaAvatar extends BasicModel {
  private mSceneType: op_def.SceneTypeEnum;
  private categoryType: op_pkt_def.PKT_PackageType;
  constructor(game: Game, sceneType: op_def.SceneTypeEnum) {
    super(game);
    this.mSceneType = sceneType;
    this.register();
  }
  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES, this.onPackageCategoriesHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE, this.onQueryCommodityResultHandler);
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
  }

  private onPackageCategoriesHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
    if (content.category === this.categoryType) {
      this.game.emitter.emit(ModuleName.PICAAVATAR_NAME + "_retpackageCategory", content.subcategory);
    }
  }

  private onQueryCommodityResultHandler(packet: PBpacket) {
    this.game.emitter.emit(ModuleName.PICAAVATAR_NAME + "_retcommodityresource", packet.content);
  }
  private onQueryResetAvatar(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR = packet.content;
    this.game.emitter.emit(ModuleName.PICAAVATAR_NAME + "_retResetAvatar", content);
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
    this.game.emitter.emit(ModuleName.PICAAVATAR_NAME + "_retavatarIDs", content.avatarItemIds);
  }
  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }
}