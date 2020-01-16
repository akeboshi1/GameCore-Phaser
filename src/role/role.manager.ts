import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../game/world.service";
import { CreateRole } from "./create.role";
import { op_client } from "pixelpai_proto";

/**
 * 角色创建，选择管理
 */
export class RoleManager extends PacketHandler {
  public readonly world: WorldService;
  private mCreateCharacter: CreateRole;
  constructor($world: WorldService) {
    super();
    this.world = $world;
  }

  register() {
    if (this.world) {
      const connection = this.world.connection;
      if (connection) {
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI, this.onOpenCreateCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CLOSE_CREATE_ROLE_UI, this.onCloseCreateCharacterHandler);
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

  private onOpenCreateCharacter(packet: PBpacket) {
    this.mCreateCharacter = new CreateRole(this);
    this.mCreateCharacter.enter(packet.content);
  }

  private onCloseCreateCharacterHandler() {
    if (this.mCreateCharacter) {
      this.mCreateCharacter.destroy();
      this.mCreateCharacter = undefined;
    }
  }
}
