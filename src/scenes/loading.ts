import { World } from "../game/world";
import { SceneType } from "../const/scene.type";

export class LoadingScene extends Phaser.Scene {
  private mCallBack: Function;
  constructor() {
    super({ key: SceneType.Loading });
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
