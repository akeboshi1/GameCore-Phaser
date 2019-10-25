import { PlayScene } from "./play";

// 编辑器用 Phaser.Scene
export class EditScene extends PlayScene {
  constructor() {
    super({ key: EditScene.name });
  }

  create() {
    if (this.mCallBack) {
      this.mCallBack();
    }
    this.scene.sendToBack();
  }
}
