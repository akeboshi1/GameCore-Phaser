import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_pkt_def } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { i18n } from "utils";
import { ConnectionService } from "lib/net/connection.service";

export class PicaMineCar extends BasicModel {
  private subcategory: op_def.IStrPair[];
  constructor(game: Game) {
    super(game);
    this.register();
  }

  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      // this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE, this.onQueryMinePackageHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES, this.onPackageCategoriesHandler);
    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  discard(items: any[]) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MINING_MODE_DELETE_MINEPACKAGE_ITEM);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MINING_MODE_DELETE_MINEPACKAGE_ITEM = packet.content;
    content.items = items;
    this.connection.send(packet);
  }
  getCategories(categoryType: number) {
    if (!this.subcategory) {
      const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PACKAGE_CATEGORIES);
      const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
      content.category = categoryType;
      this.connection.send(packet);
    } else {
      this.game.emitter.emit("packageCategory", this.subcategory);
    }

  }
  destroy() {
    this.unregister();
  }
  private onPackageCategoriesHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_PACKAGE_CATEGORIES = packet.content;
    if (content.category === op_pkt_def.PKT_PackageType.MinePackage) {
      const allCap = new op_def.StrPair();
      allCap.key = "alltype";
      allCap.value = i18n.t("common.all");
      content.subcategory.unshift(allCap);
      this.subcategory = content.subcategory;
      this.game.emitter.emit("packageCategory", this.subcategory);
    }
  }
  // private onQueryMinePackageHandler(packet: PBpacket) {
  //   const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE = packet.content;
  //   if (content && content.subcategories) content.subcategories.unshift({ key: "all", value: "全部" });
  //   this.mEvent.emit("query", packet.content);
  // }

  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }
}
