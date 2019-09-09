
export class LoadingScene extends Phaser.Scene {
  private mCallBack: () => void;
  constructor() {
    super({ key: LoadingScene.name });
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
    }
  }

  getKey(): string {
    return (this.sys.config as Phaser.Types.Scenes.SettingsConfig).key;
  }
}
