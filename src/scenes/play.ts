import IsoPlugin from "phaser3-plugin-isometric";
import { PlayerDisplay } from "../element/player";

// 游戏正式运行用 Phaser.Scene
export class PlayScene extends Phaser.Scene {
  protected mLayer: Phaser.GameObjects.Container;
  constructor(config?: string | Phaser.Types.Scenes.SettingsConfig) {
    super(config || { key: "PlayScene" });
  }

  preload() {
    // this.load.scenePlugin({
    //   key: "IsoPlugin",
    //   url: IsoPlugin,
    //   sceneKey: "iso"
    // });

    const res = "resources/dragonbones";
    this.load.dragonbone(
      "bones_human01",
      `${res}/bones_human01_tex.png`,
      `${res}/bones_human01_tex.json`,
      `${res}/bones_human01_ske.dbbin`,
      null,
      null,
      { responseType: "arraybuffer" }
    );

    // this.load.image("image", "resources/dragonBones/mecha_1002_101d_show_tex.png");
  }

  create() {
    console.log(this);

    let player = new PlayerDisplay(this);

    let image = this.add.image(200, 200, "bones_human01");

    var text1 = this.add.text(100, 100, "Phaser Text with Tint");

    text1.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

    var text2 = this.add.text(100, 200, "Phaser Text with Tint", {
      font: "64px Arial"
    });

    text2.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

    var text3 = this.add.text(100, 400, "Phaser Text with Tint Fill", {
      font: "64px Arial"
    });

    text3.setTintFill(0xff00ff, 0xff00ff, 0x0000ff, 0x0000ff);
  }
}
