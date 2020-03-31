import { IRoomService } from "../room";
import { WorldService } from "../../game/world.service";
import { PlayScene } from "../../scenes/play";
import { BackgroundCloseShot } from "../../scenes/background.closeshot";
import { CamerasManager, ICameraService } from "../cameras/cameras.manager";
import { BackgroundDisplay } from "./display";

export class CloseShot {
  private mWorld: WorldService;
  private mScene: Phaser.Scene;
  private mCameras: ICameraService;
  private mKey: string;
  private mBackground: BackgroundDisplay;
  constructor(world: WorldService, camerasManager: ICameraService) {
    this.mWorld = world;
    this.mCameras = camerasManager;
    world.game.scene.add(BackgroundCloseShot.name, BackgroundCloseShot, false);
    const playScene = world.game.scene.getScene(PlayScene.name);
    if (playScene) {
      playScene.scene.launch(BackgroundCloseShot.name, this);
    }
  }

  public startPlay(scene: Phaser.Scene) {
    this.mScene = scene;
    const camera = scene.cameras.main;

    if (this.mCameras) {
      const main = this.mCameras.camera;
      camera.setScroll(main.scrollX, main.scrollY);
      const bound = main.getBounds();
      camera.setBounds(bound.x, bound.y, bound.width, bound.height);
      this.mCameras.addCamera(camera);

      const graphics = scene.add.graphics();
      graphics.fillStyle(0xFF9900, 0.6);
      graphics.fillRect(0, 0, camera.width, camera.height);
    }
  }

  destroy() {
    this.mWorld.game.scene.remove(BackgroundCloseShot.name);
  }
}
