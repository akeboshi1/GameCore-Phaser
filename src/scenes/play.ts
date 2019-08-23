import { SceneType } from "../const/scene.type";
import { WorldService } from "../game/world.service";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  private mCallBack: Function;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: SceneType.Play });
  }

  preload() { }

  init(data: any) {
    if (data) {
      this.mCallBack = data.callBack;
    }
  }

  create() {
    if (this.mCallBack) {
      this.mCallBack();
    }
  }
}
