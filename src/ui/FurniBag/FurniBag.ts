import { PacketHandler, PBpacket } from "net-socket-packet";
import { ConnectionService } from "../../net/connection.service";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { WorldService } from "../../game/world.service";

export class FurniBag extends PacketHandler {
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
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES, this.onPackageCategoriesHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE, this.onQueryEditPackage);
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

  getCategories() {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PACKAGE_CATEGORIES);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
    content.category = op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE;
    this.connection.send(packet);
  }

  queryPackage(key: string, queryString?: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE);
    const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE = packet.content;
    content.category = op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE;
    content.page = 1;
    content.perPage = 30;
    content.subcategory = key;
    content.queryString = queryString;
    // content.category = op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE;
    this.connection.send(packet);
  }

  destroy() {
    this.unregister();
    this.mEvent.destroy();
  }

  private onPackageCategoriesHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
    if (content.category === op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE) {
      this.mEvent.emit("packageCategory", content.subcategory);
    }
  }

  private onQueryEditPackage(packge: PBpacket) {
    const content = op_client.OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE = packge.content;
    if (content.category === op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE) {
      this.mEvent.emit("queryPackage", content);
    }
  }

  get connection(): ConnectionService {
    if (this.world) {
      return this.world.connection;
    }
  }
}
