import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_def } from "pixelpai_proto";
import { MessageType } from "../../../const/MessageType";

export class ElementStorage extends PacketHandler {
  private readonly world: WorldService;
  private event: Phaser.Events.EventEmitter;
  constructor($world: WorldService) {
    super();
    this.world = $world;
    this.event = new Phaser.Events.EventEmitter();

    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE, this.onQueryEditPackageResuleHandler);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE, this.onQueryMarketPacketResuleHandler);
  }

  register() {
    if (!this.world) {
      return;
    }
    this.world.connection.addPacketListener(this);
  }

  unregister() {
    if (!this.world) {
      return;
    }
    this.world.connection.removePacketListener(this);
    this.event.removeAllListeners();
  }

  on(event: string | symbol, fn: Function, context?: any) {
    this.event.on(event, fn, context);
  }

  off(event: string | symbol, fn: Function, context?: any) {
    this.event.off(event, fn, context);
  }

  /**
   * 请求编辑背包
   */
  queryPackage(page: number, perPage: number, nodeType?: op_def.NodeType, queryString?: string) {
    if (!this.world) {
      return;
    }
    // const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_QUERY_EDIT_PACKAGE);
    // const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_QUERY_EDIT_PACKAGE = packet.content;
    // content.page = page;
    // content.perPage = perPage;
    // content.nodeType = nodeType;
    // content.queryString = queryString;
    // this.world.connection.send(packet);
  }

  queryMarketPackage(page: number, perPage: number, nodeType?: op_def.NodeType, queryString?: string) {
    if (!this.world) {
      return;
    }
    // const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE);
    // const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_MARKET_QUERY_PACKAGE = packet.content;
    // content.page = page;
    // content.perPage = perPage;
    // content.nodeType = nodeType;
    // content.queryString = queryString;
    // this.world.connection.send(packet);
  }

  destroy() {
    this.unregister();
  }

  private onQueryEditPackageResuleHandler(packet: PBpacket) {
    this.event.emit(MessageType.EDIT_MODE_QUERY_PACKAGE, packet.content);
  }

  private onQueryMarketPacketResuleHandler(packet: PBpacket) {
    this.event.emit(MessageType.EDIT_MODE_QUERY_PACKAGE, packet.content);
  }
}
