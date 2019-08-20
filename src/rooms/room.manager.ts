import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room } from "./room";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { ElementManager } from "./element/element.manager";
import { PlayerManager } from "./player/player.mamager";
import { SceneType } from "../const/scene.type";
import { TerrainManager } from "./terrain/terrain.manager";

export interface IRoomManager {
  readonly connection: ConnectionService;
  readonly scene: Phaser.Scene;
}

export class RoomManager extends PacketHandler implements IRoomManager {
  protected mWorld: WorldService;
  protected mElemetnManager: ElementManager;
  protected mPlayerManager: PlayerManager;
  protected mTerrainManager: TerrainManager;
  protected mRoomList: Room[] = [];

  constructor(world: WorldService) {
    super();
    this.mWorld = world;
    this.startScene();

    this.mElemetnManager = new ElementManager(this);
    this.mPlayerManager = new PlayerManager(this);
    this.mTerrainManager = new TerrainManager(this);

    this.initScene();
  }

  private initScene() {
    let pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED);
    this.connection.send(pkt);

    let sizePacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
    const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = sizePacket.content;
    // TOOD move to cameras manager and not getting from document
    size.width = document.documentElement.clientWidth;
    size.height = document.documentElement.clientHeight;
    this.connection.send(sizePacket);
  }

  private startScene() {
    if (this.mWorld.game) {
      this.mWorld.game.scene.start(SceneType.Play);
    }
  }

  get scene(): Phaser.Scene {
    if (this.mWorld.game) {
      return this.mWorld.game.scene.getScene(SceneType.Play);
    }
    return null;
  }

  get terrainsManager(): TerrainManager {
    return this.mTerrainManager;
  }

  get elementManager(): ElementManager {
    return this.mElemetnManager;
  }

  get playManager(): PlayerManager {
    return this.mPlayerManager;
  }

  get connection(): ConnectionService {
    return this.mWorld.connection;
  }
}
