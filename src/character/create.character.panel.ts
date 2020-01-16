import { Panel } from "../ui/components/panel";
import { WorldService } from "../game/world.service";
import { ResUtils, Url } from "../utils/resUtil";

export class CreateCharacterPanel extends Panel {
  private readonly key = "createCharacter";
  private foot;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    const container = this.scene.add.container(0, 0);
    container.add(this);
  }

  preload() {
    this.scene.load.atlas(
      this.key,
      Url.getRes("ui/create_player/create_player.png"),
      Url.getRes("ui/create_player/create_player.json")
    );
    super.preload();
  }

  resize(wid: number, hei: number) {
    const size = this.mWorld.getSize();
    // this.foot.scaleX = this.foot.scaleY = 1 / this.mWorld.uiScale;
    // this.foot.x = size.width - this.foot.width / this.mWorld.uiScale >> 1;
    // this.foot.y = size.height - this.foot.height / this.mWorld.uiScale >> 1;
    this.foot.y = size.height - this.foot.height >> 1;
    this.scale = this.mWorld.uiScale;
  }

  init() {
    const background = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    });
    this.add(background);

    const size = this.mWorld.getSize();
    this.foot = this.scene.make.image(
      {
        key: this.key,
        frame: "bg_foot.png"
      },
      false
    );
    this.add(this.foot);

    const graphics = this.scene.make.graphics(undefined, false);
    graphics.lineStyle(1, 0xFF00FF, 1.0);
    graphics.fillStyle(0xFFFFFF, 1.0);
    graphics.fillRect(100, 100, 100, 200);
    graphics.strokeRect(100, 100, 100, 200);
    this.add(graphics);

    super.init();
    this.resize(0, 0);
  }
}
