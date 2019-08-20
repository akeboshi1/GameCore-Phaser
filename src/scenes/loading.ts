import { World } from "../game/world";
import { SceneType } from "../const/scene.type";

export class LoadingScene extends Phaser.Scene {
  private mWorld: World;
  constructor() {
    super({ key: SceneType.Loading });
  }

  preload() {}

  init(data: any) {
    this.mWorld = data;
  }

  create() {
    this.scene.start("selectCharacter", this.mWorld);
  }
}
