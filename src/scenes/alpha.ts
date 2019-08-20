import { PlayScene } from "./play";
import { SceneType } from "../const/scene.type";

// 测试运行用 Phaser.Scene
export class AlphaScene extends PlayScene {
  constructor() {
    super({ key: SceneType.Alpha });
  }
}
