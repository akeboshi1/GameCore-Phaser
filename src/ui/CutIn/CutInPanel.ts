import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { Font } from "../../utils/font";
import { op_client } from "pixelpai_proto";

export class CutInPanel extends BasePanel {
  private readonly key = "cut_in";
  private mName: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
  }

  show(param: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI[]) {
    this.data = param;
    if (!this.mInitialized) {
      this.preload();
      return;
    }
    // if (!param || param.length < 1) return;
    if (param && param.length > 0) {
      const text = param[0].text;
      if (this.mName) {
        this.mName.setText(text[0].text);
      }
    } else {
      if (this.mName) {
        this.mName.setText("???");
      }
    }
    const width = this.scene.cameras.main.width;
    this.x = width + this.width / 2;
    // this.view.alpha = 0;
    const _x = this.scene.cameras.main.width / 2;
    this.scene.tweens.timeline({
      targets: this,
      duration: 300,
      tweens: [{
        x: _x,
        alpha: 1,
        ease: "Sine.easeInOut"
      }, {
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
    this.scene.load.image(this.key, Url.getUIRes(this.dpr, "cut_in/cut_in_bg.png"));
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
    this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this.view);
  }

}
