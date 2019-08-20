import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { World } from "../game/world";
import { ConnectionService } from "../net/connection.service";
import { SceneType } from "../const/scene.type";
import { WorldService } from "../game/world.service";

export class SelectCharacter extends Phaser.Scene {
  private mWorld: World;
  constructor() {
    super({key: SceneType.SelectCharacter})
  }

  preload() { }

  init(data: any) {
    this.mWorld = data;
  }

  create() { }
}

export class SelectManager extends PacketHandler {
  constructor(private mWorldService: WorldService) {
    super();
    this.startScene();
    this.connection.addPacketListener(this);
    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_SELECT_CHARACTER, this.onSelectCharacter);
  }

  get scene(): SelectCharacter {
    if (this.mWorldService.game) {
      return <SelectCharacter>this.mWorldService.game.scene.getScene(SceneType.SelectCharacter);
    }
    return;
  }

  private startScene() {
    if (this.mWorldService.game) {
      this.mWorldService.game.scene.start(SceneType.SelectCharacter);
    }
  }

  private onSelectCharacter() {
    const pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_GATEWAY_CHARACTER_CREATED);
    this.connection.send(pkt);
  }

  get connection(): ConnectionService {
    return this.mWorldService.connection;
  }
}