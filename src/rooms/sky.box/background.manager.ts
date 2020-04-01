import { WorldService } from "../../game/world.service";
import { PlayScene } from "../../scenes/play";
import { SkyBoxScene } from "../../scenes/sky.box";
import { ICameraService } from "../cameras/cameras.manager";
import { BackgroundDisplay } from "./display";
import { Url } from "../../utils/resUtil";
import { Logger } from "../../utils/log";
import { BlockManager } from "./block.manager";

export interface IBackgroundManager {
  readonly world: WorldService;
  startPlay(scene: Phaser.Scene): void;
  update(time?: number, delta?: number): void;
}

export class BackgroundManager {
  private mWorld: WorldService;
  private mScene: Phaser.Scene;
  private mCameras: ICameraService;
  private mKey: string;
  private mBackground: BlockManager;
  private mType: string;
  private mTime: number = 0;
  constructor(world: WorldService, type: string, camerasManager: ICameraService) {
    this.mWorld = world;
    this.mType = type;
    this.mCameras = camerasManager;
    world.game.scene.add(SkyBoxScene.name + `_${type}`, SkyBoxScene, false);
    const playScene = world.game.scene.getScene(PlayScene.name);
    if (playScene) {
      playScene.scene.launch(SkyBoxScene.name + `_${type}`, this);
    }
  }

  startPlay(scene: Phaser.Scene) {
    this.mScene = scene;
    const key = Url.getRes("skybox/bh");
    this.mBackground = new BlockManager(this.mScene, this.mCameras.camera, key, this.mWorld);
    this.initCamera();
  }

  update(time?: number, delta?: number) {
    if (time - this.mTime < 1000) {
      return;
    }
    this.mTime = time;
    const camera = this.mCameras.camera;
    this.mBackground.check(time, delta);
    // this.mBackground.setScroll(camera.scrollX, camera.scrollY);
  }

  destroy() {
    this.mWorld.game.scene.remove(SkyBoxScene.name + `_${this.mType}`);
  }

  private initCamera() {
    const camera = this.mScene.cameras.main;

    if (this.mCameras) {
      const main = this.mCameras.camera;
      camera.setScroll(main.scrollX, main.scrollY);
      const bound = main.getBounds();
      // camera.setBounds(bound.x, bound.y, bound.width, bound.height);
      this.mCameras.addCamera(camera);
    }
  }
}
