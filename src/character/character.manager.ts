import { PacketHandler } from "net-socket-packet";
import { WorldService } from "../game/world.service";
import { CreateCharacter } from "./create.character";
import { op_client } from "pixelpai_proto";

/**
 * 角色创建，选择管理
 */
export class CharacterManager extends PacketHandler {
  public readonly world: WorldService;
  private mCreateCharacter: CreateCharacter;
  constructor($world: WorldService) {
    super();
    this.world = $world;
  }

  register() {
    if (this.world) {
      const connection = this.world.connection;
      if (connection) {
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onOpenCreateCharacter);
      }
    }
  }

  unregister() {
    if (this.world) {
      const connection = this.world.connection;
      if (connection) {
        connection.removePacketListener(this);
      }
    }
  }

  private onOpenCreateCharacter() {
    this.mCreateCharacter = new CreateCharacter(this);
    this.mCreateCharacter.enter();
  }
}
