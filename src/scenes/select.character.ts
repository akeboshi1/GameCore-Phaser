import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { World } from "../game/world";
import { ConnectionService } from "../net/connection.service";
import { SceneType } from "../const/scene.type";
import { WorldService } from "../game/world.service";

export class SelectCharacter extends Phaser.Scene {
  private mWorld: World | undefined;
  constructor() {
    super({key: SceneType.SelectCharacter})
  }

  preload() { }

  init(data: any) {
    this.mWorld = data;
  }

  create() { }
}