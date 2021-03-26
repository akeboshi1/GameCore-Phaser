import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { ModuleName } from "structure";

export class PicaRepairChoose extends BasicModel {
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
      // this.addHandlerFun(op_client.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_FURNITURE, this.onRetRescasteResult);
    }
  }

  unregister() {
    const connection = this.connection;
    if (connection) {
      this.connection.removePacketListener(this);
    }
  }

  queryChange(element_id: number, target_type: string) {
    const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_FURNITURE);
    const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_PKT_CHANGE_FURNITURE = packet.content;
    content.elementId = element_id;
    content.targetType = target_type;
    this.connection.send(packet);
  }

  private onRetRescasteResult(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_FORGE_RESULT = packet.content;
    this.game.emitter.emit(ModuleName.PICARECASTE_NAME + "_retrecasteresult", content.reward);
  }

  get connection(): ConnectionService {
    if (this.game) {
      return this.game.connection;
    }
  }
}
