import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room } from "./room";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { LoadingScene } from "../scenes/loading";
import { PlayScene } from "../scenes/play";

export interface IRoomManager {
  readonly world: WorldService | undefined;

  readonly connection: ConnectionService | undefined;
}

export class RoomManager extends PacketHandler implements IRoomManager {
  protected mWorld: WorldService;
  private room: Room;
  constructor(world: WorldService) {
    super();
    this.mWorld = world;
    if (this.connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterScene);
    }
  }

  private onEnterScene(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;

    //todo 预加载资源
    this.start(content, () => {
      //場景初始化之後才能去創建後續元素
      if (content.actor) {
        this.room.setMainRoleInfo(content.actor);
      }
    });
  }

  /**
   * 开启roomManager默认先开启loadingScene
   * 原本是想在world里面调用，但是现在roomManager进入的触发条件是选角之后派发的EnterScene事件
   */
  private start(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, cb: Function) {
    if (this.mWorld.game) {
      this.mWorld.game.scene.start(LoadingScene.name, {
        callBack: () => {
          let scene: Phaser.Scene = this.mWorld.game.scene.getScene(PlayScene.name);
          this.mWorld.game.scene.start(PlayScene.name, {
            callBack: () => {
              this.initScene();
              this.room = new Room(this, scene);
              this.room.enter(content.scene, cb);
              this.mWorld.changeRoom(this.room);
            }
          });
        }
      });
    }
  }

  public stop() {
    if (this.mWorld.game) {
      this.room.dispose();
    }
  }

  public resize(width: number, height: number) {
    if (this.room) {
      this.room.resize(width, height);
    }
  }

  private initScene() {
    if (this.connection) {
      let pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED);
      this.connection.send(pkt);
    } else {
      console.error("connection is undefined");
    }
  }

  get world(): WorldService {
    return this.mWorld;
  }

  get connection(): ConnectionService {
    if (this.mWorld) {
      return this.mWorld.connection;
    }
    console.error("world manager is undefined");
  }
}
