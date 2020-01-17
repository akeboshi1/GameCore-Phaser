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
    this.scaleX = this.scaleY = this.mWorld.uiScale;
    this.foot.scaleX = this.foot.scaleY = .75;
    this.foot.x = (size.width - this.foot.width >> 1) * .75;
    this.foot.y = (size.height - this.foot.height >> 1) * .75;
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
    super.init();
    this.resize(0, 0);
  }
}
