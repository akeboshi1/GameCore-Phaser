import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaFurnitureCompose extends BasicModel {
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
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMBINE_RESULT, this.onRetComposeResult);
    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  queryFuriCompose(ids: string[]) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_COMBINE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_COMBINE = packet.content;
    content.materialId = ids;
  }

  private onRetComposeResult(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMBINE_RESULT = packet.content;
    this.game.emitter.emit(ModuleName.PICAFURNITURECOMPOSE_NAME + "_retcomposeresult", content.reward);
  }
  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }
}
