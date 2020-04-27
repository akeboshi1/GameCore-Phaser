import { WorldService } from "../../game/world.service";
import { SkyBoxScene } from "../../scenes/sky.box";
import { ICameraService, CamerasManager } from "../cameras/cameras.manager";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
import { BlockManager } from "./block.manager";
import { Room, IRoomService } from "../room";
import { IScenery } from "./scenery";

export interface ISkyBoxManager {
  readonly world: WorldService;
  startPlay(scene: Phaser.Scene): void;
  update(time?: number, delta?: number): void;
}

export interface ISkyBoxConfig {
  key: string;
  width: number;
  height: number;
  gridW?: number;
  gridH?: number;
}

export class SkyBoxManager {
  private mWorld: WorldService;
  private mRoom: IRoomService;
  private mScene: Phaser.Scene;
  private mCameras: ICameraService;
  private mKey: string;
  private mBackground: BlockManager;
  private mSceneName: string;
  private mLastTime: number = 0;
  // private mConfig: ISkyBoxConfig;
  private mScenety: IScenery;
  constructor(room: Room, scenery: IScenery, camerasManager: ICameraService) {
    this.mWorld = room.world;
    this.mRoom = room;
    this.mScenety = scenery;
    // this.mType = type;
    // this.mConfig = config;
    // this.mKey = config.key;
    this.mCameras = camerasManager;
    const playScene = room.scene;
    if (!playScene) {
      Logger.getInstance().fatal(`${SkyBoxManager.name} scene does not exist`);
      return;
    }
    this.mSceneName = SkyBoxScene.name + `_${scenery.id}`;
    this.mWorld.game.scene.add(this.mSceneName, SkyBoxScene, false);
    playScene.scene.launch(this.mSceneName, this);
  }

  startPlay(scene: Phaser.Scene) {
    this.mScene = scene;
    // const key = Url.getRes(this.mKey);
    this.mBackground = new BlockManager(this.mScene, this.mCameras.camera, this.mScenety.uris, this.mWorld);
    this.mBackground.setSize(this.mScenety.width, this.mScenety.height);
    // this.mBackground.setSize(this.mConfig.width, this.mConfig.height, this.mConfig.gridW, this.mConfig.gridH);
    this.initCamera();
  }

  update(time?: number, delta?: number) {
    if (time - this.mLastTime < 1000) {
      return;
    }
    this.mLastTime = time;
    this.mBackground.check(time, delta);
    // this.mBackground.setScroll(camera.scrollX, camera.scrollY);
  }

  destroy() {
    if (this.mWorld && this.mWorld.game) {
      this.mWorld.game.scene.remove(this.mSceneName);
    }
    if (this.mBackground) {
      this.mBackground.destroy();
    }
  }

  private initCamera() {
    const camera = this.mScene.cameras.main;

    if (this.mCameras) {
      const main = this.mCameras.camera;
      const imageWidth = this.mScenety.width;
      const imageHeight = this.mScenety.height;
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
