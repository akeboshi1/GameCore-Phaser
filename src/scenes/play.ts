// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  private mCallBack: Function;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: PlayScene.name });
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
    console.log("play created");
  }
}
