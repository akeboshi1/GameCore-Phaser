import { MainUIScene } from "./main.ui";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  private mCallBack: () => void;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: PlayScene.name });
  }

  public preload() { }

  public init(data: any) {
    if (data) {
      this.mCallBack = data.callBack;
    }
  }

  public create() {
    if (this.mCallBack) {
      this.mCallBack();
      this.scene.launch(MainUIScene.name);
    }
    console.log("play created");
  }

}
