import { PacketHandler, PBpacket } from "net-socket-packet";
import { Cameras } from "./cameras";
import { RoomService } from "../room";
import { ConnectionService } from "../../net/connection.service";
import { op_virtual_world } from "pixelpai_proto";

export interface ICameraService {
  setCameras(camera: Phaser.Cameras.Scene2D.Camera): void;
  startFollow(target: Phaser.GameObjects.GameObject): void;
  resize(width: number, height: number): void;
}

export class CamerasManager extends PacketHandler implements ICameraService {
  private mCameras: Phaser.Cameras.Scene2D.Camera;
  constructor(private mRoomService: RoomService) {
    super();
  }

  public setCameras(camera: Phaser.Cameras.Scene2D.Camera) {
    this.mCameras = camera;
  }

  public resize(width: number, height: number) {
    this.resetCameraSize(width, height) ;
  }

  startFollow(target: Phaser.GameObjects.GameObject) {
    if (this.mCameras) {
      this.mCameras.startFollow(target);
    }
  }

  private resetCameraSize(width: number, height: number) {
    if (!this.connection) {
      console.error("connection is undefined");
      return;
    }
    let packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
    const size: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = packet.content;
    // TOOD move to cameras manager and not getting from document
    size.width = width;
    size.height = height;
    this.connection.send(packet);
  }

  get connection(): ConnectionService {
    if (!this.mRoomService) {
      console.error("room service is undefined");
      return;
    }
    return this.mRoomService.connection;
  }
}