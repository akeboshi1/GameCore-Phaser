import { PacketHandler, PBpacket } from "net-socket-packet";
import { WorldService } from "../../game/world.service";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { ConnectionService } from "../../net/connection.service";
import { SelectCharacter } from "../../scenes/select.character";
import {Logger} from "../../utils/log";

export class SelectManager extends PacketHandler {
  constructor(private mWorldService: WorldService) {
    super();
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
    }
  }

  public start() {
    if (this.mWorldService.game) {
      const scene = this.mWorldService.game.scene;
      if (scene) {
        scene.start(SelectCharacter.name);
      } else {
        Logger.error("scene is undefined");
      }
    }
  }

  public stop() {
    if (this.mWorldService.game) {
      const scene = this.mWorldService.game.scene;
      if (scene) {
        scene.stop(SelectCharacter.name);
      } else {
        Logger.error("scene is undefined");
      }
    }
  }

  private onSelectCharacter() {
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
    this.connection.send(pkt);
  }

  get scene(): Phaser.Scene | undefined {
    if (this.mWorldService.game) {
      const scene = this.mWorldService.game.scene;
      if (scene) {
        return scene.getScene(SelectCharacter.name);
      }
      Logger.error("scene is undefined");
    }
    return;
  }

  get connection(): ConnectionService | undefined {
    if (this.mWorldService) {
      return this.mWorldService.connection;
    }
    Logger.log("world manager is undefined");
  }
}
