import { WorldService } from "../game/world.service";
import { ConnectionService } from "../net/connection.service";
import { Room } from "./room";
import { op_client, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { SceneType } from "../const/scene.type";

export interface IRoomManager {
  readonly connection: ConnectionService;
}

export class RoomManager extends PacketHandler implements IRoomManager {
  protected mWorld: WorldService;
  protected mRoomObj: {} = {}

  private _curSceneType: SceneType;
  constructor(world: WorldService) {
    super();
    this.mWorld = world;

    if (this.connection) {
      this.connection.addPacketListener(this);
      this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE, this.onEnterScene);
    }
  }

  public changeSceneByType(sceneType: SceneType) {
    if (this.mWorld.game) {
      this.start(sceneType);
    } else {
      console.error("scene is undefined");
    }
  }

  private start(type: SceneType) {
    if (this.mWorld.game) {
      let sceneMgr: Phaser.Scenes.SceneManager = this.mWorld.game.scene;
      if (sceneMgr) {
        let scene: Phaser.Scene = this.getScene(type);
        if (!scene) {
          console.error("scene is undefined");
          return;
        }
        if (this.mRoomObj[this._curSceneType]) {
          return;
        }
        this._curSceneType = type;
        scene.events.on("create", this.sceneCreated, this);
        sceneMgr.start(SceneType.Play);
      } else {
        console.error("sceneMgr is undefined");
      }
    }
  }

  private onEnterScene(packet: PBpacket) {
    const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ENTER_SCENE = packet.content;
    this.enterScene();
  }

  private enterScene() {
    this.start(SceneType.Play);
    if (this.connection) {
      let pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED);
      this.connection.send(pkt);

      let sizePacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
      const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = sizePacket.content;
      // TOOD move to cameras manager and not getting from document
      size.width = this.mWorld.getWidth();
      size.height = this.mWorld.getHeight();
      this.connection.send(sizePacket);
    } else {
      console.error("connection is undefined");
    }
  }

  private sceneCreated(scene: Phaser.Scene) {
    let room: Room = new Room(this, scene);
    this.mRoomObj[this._curSceneType] = room;
  }

  public getRoomByType(type: string): Room {
    return this.mRoomObj[type];
  }

  public getCurRoom(): Room {
    return this.mRoomObj[this._curSceneType]
  }

  private getScene(type: string): Phaser.Scene {
    if (this.mWorld.game) {
      const sceneMgr = this.mWorld.game.scene;
      if (sceneMgr) {
        return sceneMgr.getScene(type);
      } else {
        console.error("scene is undefined")
      }
    }
    return null;
  }

  get connection(): ConnectionService {
    if (this.mWorld) {
      return this.mWorld.connection;
    }
    console.error("world manager is undefined");
  }
}
