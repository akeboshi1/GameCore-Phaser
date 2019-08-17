import { LayerManager } from "../layer/layer.manager";
import { PlayerDisplay } from "../rooms/player/player.display";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  // private mLayerManager: LayerManager;
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
    // this.mLayerManager = new LayerManager(this);

    let player = new PlayerDisplay(this);
  }
}
