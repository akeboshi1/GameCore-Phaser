import IsoPlugin from "phaser3-plugin-isometric";
import { PlayerDisplay } from "../gameobject/player/player";
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

    console.log("init: ======>", this.game);

    const res = "resources/dragonbones";
    // this.load.dragonbone(
    //   "bones_human01",
    //   `${res}/bones_human01_tex.png`,
    //   `${res}/bones_human01_tex.json`,
    //   `${res}/bones_human01_ske.dbbin`,
    //   null,
    //   null,
    //   { responseType: "arraybuffer" }
    // );
  }

  create() {
    this.mLayerManager = new LayerManager(this);
    this.data

    let player = new PlayerDisplay(this);
  }
}
