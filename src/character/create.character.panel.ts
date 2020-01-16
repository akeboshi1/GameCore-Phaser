import { Panel } from "../ui/components/panel";
import { WorldService } from "../game/world.service";
import { ResUtils, Url } from "../utils/resUtil";

export class CreateCharacterPanel extends Panel {
  private readonly key = "createCharacter";
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    const container = this.scene.add.container(0, 0);
    container.add(this);
  }

  preload() {
    this.scene.load.atlas(this.key, Url.getRes("ui/create_player/create_player.png"), Url.getRes("ui/create_player/create_player.json"));
    super.preload();
  }

  init() {
    const background = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    });
    this.add(background);

    const size = this.mWorld.getSize();
    const foot = this.scene.make.image({
      key: this.key,
      frame: "bg_foot.png"
    }, false);
    foot.x = foot.width >> 1;
    foot.y = size.height - (foot.height >> 1);
    this.add(foot);
    super.init();
  }
}
