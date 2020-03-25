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
    const width = this.scene.cameras.main.width;
    this.x = width + this.width / 2;
    this.alpha = 0;
    const _x = this.scene.cameras.main.width / 2;
    this.scene.tweens.timeline({
      targets: this,
      duration: 300,
      tweens: [{
        x: _x,
        alpha: 1,
        ease: "Sine.easeInOut"
      },{
        delay: 2000,
        y: this.y - 10 * this.dpr,
        alpha: 0
      }],
      onComplete: () => {
        this.emit("close");
      }
    });
  }

  resize(w: number, h: number) {
    // this.x = w / 2;
    this.y = 140 * this.dpr;
  }

  preload() {
    this.scene.load.image(this.key, Url.getUIRes(this.dpr, "enter_scene_name/enter_scene_name_bg.png"));
    super.preload();
  }

  init() {
    const background = this.scene.make.image({
      key: this.key
    }, false);
    this.setSize(background.width * this.scale, background.height * this.scale);

    this.mName = this.scene.make.text({
      style: {
        color: "#ffcc33",
        fontSize: 18 * this.dpr,
        fotnFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5);
    this.mName.setFontStyle("bold");
    this.mName.setStroke("#000000", 1 * this.dpr);
    this.add([background, this.mName]);
    super.init();

    this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
  }

}
