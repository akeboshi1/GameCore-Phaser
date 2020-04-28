import { BlockManager } from "./block.manager";
import { IRoomService } from "../room";
import { IScenery, Scenery } from "./scenery";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";

export interface ISkyBoxConfig {
  key: string;
  width: number;
  height: number;
  gridW?: number;
  gridH?: number;
}

export class SkyBoxManager extends PacketHandler {
  protected mRoom: IRoomService;
  protected mScenetys: Map<number, BlockManager>;
  constructor(room: IRoomService) {
    super();
    this.mRoom = room;
    this.mScenetys = new Map();
  }

  add(scenery: IScenery) {
    this.mScenetys.set(scenery.id, new BlockManager(scenery, this.mRoom));
  }

  update(scenery: IScenery) {
    const block = this.mScenetys.get(scenery.id);
    if (block) {
      block.update(scenery);
    }
  }

  remove(id: number) {
    const block = this.mScenetys.get(id);
    if (block) {
      block.destroy();
    }
  }

  destroy() {
    if (this.mRoom) {
      const connection = this.mRoom.connection;
      if (connection) {
        connection.removePacketListener(this);
      }
    }
    this.mScenetys.forEach((scenery: BlockManager) => scenery.destroy);
  }

  // private initCamera() {
  //   const camera = this.mScene.cameras.main;

  //   if (this.mCameras) {
  //     const main = this.mCameras.camera;
  //     const imageWidth = this.mScenety.width;
  //     const imageHeight = this.mScenety.height;
  //     const size = this.mRoom.roomSize;
  //     if (imageWidth > size.sceneWidth) {
  //       // main.setBounds(0, 0, imageWidth, imageHeight);
  //     }
  //     const bound = main.getBounds();
  //     camera.setBounds(bound.x, bound.y, bound.width, bound.height);
  //     // camera.setPosition((size.sceneWidth - imageWidth >> 1) * this.mWorld.scaleRatio, (size.sceneHeight - imageHeight >> 1) * this.mWorld.scaleRatio);
  //     // camera.setScroll(main.scrollX , main.scrollY);
  //     this.mCameras.addCamera(camera);
  //   }
  // }

}
