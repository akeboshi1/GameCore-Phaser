import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { Font } from "../../utils/font";

export class EnterSceneNamePanel extends Panel {
  private readonly key = "enter_scene_name";
  private mName: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
  }

  show(param) {
    this.mData = param;
    if (!this.mInitialized) {
        this.preload();
        return;
    }
    if (this.mName) {
      this.mName.setText("进入房间名字");
    }
  }

  preload() {
    this.scene.load.image(this.key, Url.getUIRes(this.dpr, "enter_scene_name/enter_scene_name.bg.png"));
    super.preload();
  }

  init() {
    const background = this.scene.make.image({
      key: this.key
    }, false);

    this.mName = this.scene.make.text({
      style: {
        fontSize: 16 * this.dpr,
        fotnFamily: Font.DEFULT_FONT
      }
    }, false);
    this.add([background, this.mName]);
    super.init();
  }

}
