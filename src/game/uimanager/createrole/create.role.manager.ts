import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Game } from "../../game";
import { CreateRole } from "./create.role";

/**
 * 角色创建，选择管理
 */
export class CreateRoleManager extends PacketHandler {
  public readonly game: Game;
  private mCreateCharacter: CreateRole;
  constructor($game: Game) {
    super();
    this.game = $game;
  }

  register() {
    if (this.game) {
      const connection = this.game.connection;
      if (connection) {
        connection.addPacketListener(this);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_CREATE_ROLE_UI, this.onOpenCreateCharacter);
        this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_CLOSE_CREATE_ROLE_UI, this.onCloseCreateCharacterHandler);
      }
    }
  }

  unregister() {
    if (this.game) {
      const connection = this.game.connection;
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
