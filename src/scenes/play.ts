import IsoPlugin from "phaser3-plugin-isometric";
import { PlayerDisplay } from "../gameobject/player/player.display";
import { LayerManager } from "../layer/layer.manager";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  private mLayerManager: LayerManager;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: "PlayScene" });
  }

  preload() {
    // this.load.scenePlugin({
    //   key: "IsoPlugin",
    //   url: IsoPlugin,
    //   sceneKey: "iso"
    // });
  }

  create() {
    this.mLayerManager = new LayerManager(this);
    this.data

    let player = new PlayerDisplay(this);
  }
}
