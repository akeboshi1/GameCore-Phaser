import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room } from "./room";
import { op_client } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";

export interface IRoomManager {
  readonly connection: ConnectionService;
  readonly scene: Phaser.Scene;
}

export class RoomManager extends PacketHandler implements IRoomManager {
  protected mWorld: WorldService;
  protected mElemetnManager: ElementManager;
  protected mPlayerManager: PlayerManager;
  protected mRoomList: Room[] = [];

  constructor(world: WorldService) {
    super();
    this.mWorld = world;

    this.mElemetnManager = new ElementManager(this);
    this.mPlayerManager = new PlayerManager(this);

    this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterSceneHandler);
  }

  private onEnterSceneHandler(packet: PBpacket) {
    
  }

  get scene(): Phaser.Scene {
    // TODO
    return;
  }

  get connection(): ConnectionService {
    return this.mWorld.connection;
  }
}
