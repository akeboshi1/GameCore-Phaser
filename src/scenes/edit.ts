import { PlayScene } from "./play";
import { SceneType } from "../const/scene.type";

// 编辑器用 Phaser.Scene
export class EditScene extends PlayScene {
  constructor() {
    super({ key: SceneType.Editor });
  }
}
