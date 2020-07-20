import { BasePanel } from "../ui/components/BasePanel";
import { WorldService } from "../game/world.service";
import { Url } from "../utils/resUtil";

export class CreateCharacterPanel extends BasePanel {
  private readonly key = "createCharacter";
  private foot;
  constructor(scene: Phaser.Scene, world: WorldService, moduleName?: string) {
    super(scene, world);
    this.mModuleName = moduleName;
    const container = this.scene.add.container(0, 0);
    container.add(this);
  }

  preload() {
    this.scene.load.atlas(
      this.key,
      Url.getRes("ui/create_player/create_player.png", this.mModuleName),
      Url.getRes("ui/create_player/create_player.json", this.mModuleName)
    );
    super.preload();
  }

  resize(wid: number, hei: number) {
    const size = this.mWorld.getSize();
    this.scale = this.mWorld.uiScale;
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
