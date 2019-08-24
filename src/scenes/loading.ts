
export class LoadingScene extends Phaser.Scene {
  private mCallBack: Function;
  constructor() {
    super({ key: LoadingScene.name });
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
