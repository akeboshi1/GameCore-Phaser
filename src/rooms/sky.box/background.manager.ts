import { WorldService } from "../../game/world.service";
import { SkyBoxScene } from "../../scenes/sky.box";
import { ICameraService } from "../cameras/cameras.manager";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
import { BlockManager } from "./block.manager";
import { Room, IRoomService } from "../room";
import { Cameras } from "phaser";

export interface IBackgroundManager {
  readonly world: WorldService;
  startPlay(scene: Phaser.Scene): void;
  update(time?: number, delta?: number): void;
}

export class BackgroundManager {
  private mWorld: WorldService;
  private mRoom: IRoomService;
  private mScene: Phaser.Scene;
  private mCameras: ICameraService;
  private mKey: string;
  private mBackground: BlockManager;
  private mType: string;
  private mTime: number = 0;
  constructor(room: Room, type: string, camerasManager: ICameraService) {
    this.mWorld = room.world;
    this.mRoom = room;
    this.mType = type;
    this.mCameras = camerasManager;
    const playScene = room.scene;
    if (!playScene) {
      Logger.getInstance().fatal(`${BackgroundManager.name} scene does not exist`);
      return;
    }
    this.mWorld.game.scene.add(SkyBoxScene.name + `_${type}`, SkyBoxScene, false);
    playScene.scene.launch(SkyBoxScene.name + `_${type}`, this);
  }

  startPlay(scene: Phaser.Scene) {
    this.mScene = scene;
    const key = Url.getRes("skybox/bh");
    this.mBackground = new BlockManager(this.mScene, this.mCameras.camera, key, this.mWorld);
    this.mBackground.setSize(3400, 1900, 256, 256);
    this.initCamera();
  }

  update(time?: number, delta?: number) {
    if (time - this.mTime < 1000) {
      return;
    }
    this.mTime = time;
    this.mBackground.check(time, delta);
    // this.mBackground.setScroll(camera.scrollX, camera.scrollY);
  }

  destroy() {
    if (this.mWorld && this.mWorld.game) {
      this.mWorld.game.scene.remove(SkyBoxScene.name + `_${this.mType}`);
    }
    if (this.mBackground) {
      this.mBackground.destroy();
    }
  }

  private initCamera() {
    const camera = this.mScene.cameras.main;

    if (this.mCameras) {
      const main = this.mCameras.camera;
      const imageWidth = 3400;
      const imageHeight = 1900;
      const size = this.mRoom.roomSize;
      if (imageWidth > size.sceneWidth) {
        // main.setBounds(0, 0, imageWidth, imageHeight);
      }
      const bound = main.getBounds();
      camera.setBounds(bound.x, bound.y, bound.width, bound.height);
      camera.setPosition((size.sceneWidth - imageWidth >> 1) * this.mWorld.scaleRatio, (size.sceneHeight - imageHeight >> 1) * this.mWorld.scaleRatio);
      camera.setScroll(main.scrollX , main.scrollY);
      this.mCameras.addCamera(camera);
    }
  }
}
