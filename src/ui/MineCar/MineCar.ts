import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { WorldService } from "../../game/world.service";
import { ConnectionService } from "../../net/connection.service";

export class MineCar extends PacketHandler {
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
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE, this.onQueryMinePackageHandler);
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

  discard(items: any[]) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MINING_MODE_DELETE_MINEPACKAGE_ITEM);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MINING_MODE_DELETE_MINEPACKAGE_ITEM = packet.content;
    content.items = items;
    this.connection.send(packet);
  }

  destroy() {
    this.unregister();
    this.mEvent.destroy();
  }

  private onQueryMinePackageHandler(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE = packet.content;
    if (content && content.subcategories) content.subcategories.unshift({key: "all", value: "全部"});
    this.mEvent.emit("query", packet.content);
  }

  get connection(): ConnectionService {
    if (this.world) {
      return this.world.connection;
    }
  }
}
