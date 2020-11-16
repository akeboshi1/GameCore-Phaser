import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_def } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { MessageType } from "structure";

export class PicaElementStorage extends BasicModel {
  constructor(game: Game) {
    super(game);
    this.register();
  }

  register() {
    const connection = this.connection;
    if (connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_QUERY_EDIT_PACKAGE, this.onQueryEditPackageResuleHandler);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE, this.onQueryMarketPacketResuleHandler);
    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }

  /**
   * 请求编辑背包
   */
  queryPackage(page: number, perPage: number, nodeType?: op_def.NodeType, queryString?: string) {
    if (!this.connection) {
      return;
    }
  }

  queryMarketPackage(page: number, perPage: number, nodeType?: op_def.NodeType, queryString?: string) {
    if (!this.connection) {
      return;
    }
  }

  destroy() {
    this.unregister();
  }

  private onQueryEditPackageResuleHandler(packet: PBpacket) {
    this.game.emitter.emit(MessageType.EDIT_MODE_QUERY_PACKAGE, packet.content);
  }

  private onQueryMarketPacketResuleHandler(packet: PBpacket) {
    this.game.emitter.emit(MessageType.EDIT_MODE_QUERY_PACKAGE, packet.content);
  }
}
