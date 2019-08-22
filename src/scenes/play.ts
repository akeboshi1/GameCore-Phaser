import { SceneType } from "../const/scene.type";
import { WorldService } from "../game/world.service";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  protected mWorld: WorldService;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: SceneType.Play });
  }

  preload() { }

  init(data: any) {
    this.mWorld = data;
  }

  create() {
  }
}
