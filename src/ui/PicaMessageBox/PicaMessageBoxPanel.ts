import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { NinePatch } from "../components/nine.patch";
import { Font } from "../../utils/font";
import { NinePatchButton } from "../components/ninepatch.button";
import BBCodeText from "../../../lib/rexui/lib/plugins/gameobjects/text/bbocdetext/BBCodeText.js";

export class PicaMessageBoxPanel extends Panel {
  private key: string = "pica_message_box";
  private mTitleLabel: Phaser.GameObjects.Text;
  private mButtons: NinePatchButton[];
  private mText: BBCodeText;
  private mButtonContaier: Phaser.GameObjects.Container;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
  }

  show(param) {
    super.show(param);
    if (!this.mInitialized) {
      return;
    }
    this.mButtons = [];
    if (param[0] && param[0].text && param[0].text[0]) {
        this.mText.setText(param[0].text[0].text);
        this.mText.x = -this.mText.width / 2;
        this.mText.y = -this.mText.height;
    }
    const buttons = param[0].button;
    if (buttons) {
        const btnWid: number = 114 * this.dpr;
        const btnHei: number = 40 * this.dpr ;
        const w = (this.width - 42 * this.dpr) / buttons.length;
        // const mButtonsContainer = this.mScene.make.container(undefined, false);
        this.mButtonContaier.y = this.height / 2 - btnHei;
        const frame = this.scene.textures.getFrame(this.key, "yellow_btn_normal");
        if (!frame) {
          return;
        }
        const config = {
          left: 13 * this.dpr,
          top: 13 * this.dpr,
          bottom: frame.width - 2 - 13 * this.dpr,
          right: frame.height - 2 - 13 * this.dpr
        };
        let totalW = 0;
        for (let i = 0; i < buttons.length; i++) {
            const txt: string = buttons[i] ? buttons[i].text : "";
            const btn = new NinePatchButton(this.mScene, 0, 0, btnWid, btnHei, this.key, i === 0 ? "yellow_btn" : "red_btn", buttons[i].text, config, buttons[i]);
            btn.setTextStyle({
              fontFamily: Font.DEFULT_FONT,
              fontSize: 16 * this.dpr
            });
            btn.x = i * w + btnWid / 2;
            totalW += i * w + btnWid / 2;
            this.mButtons.push(btn);
            btn.on("click", this.onClickHandler, this);
          }
        this.mButtonContaier.add(this.mButtons);
        // btnSp.setSize((buttons.length - 1) * w + btnWid, btnHei);
        this.mButtonContaier.x = -totalW / 2;
    }
    this.resize(0, 0);
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.x = width / 2;
    this.y = height / 2;
    super.resize(w, h);

    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.width, this.height), Phaser.Geom.Rectangle.Contains);
  }

  protected preload() {
    this.addAtlas(this.key, "pica_message_box/pica_message_box.png", "pica_message_box/pica_message_box.json");
    super.preload();
  }

  protected init() {
    const frame = this.scene.textures.getFrame(this.key, "bg");
    const background = new NinePatch(this.scene, 0, 0, 286 * this.dpr, frame.height, this.key, "bg", {
      left: 22 * this.dpr,
      top: frame.height,
      right: 22 * this.dpr,
      bottom: 0
    });
    this.setSize(background.width, background.height);

    this.mButtonContaier = this.scene.make.container(undefined, false);

    const title = this.scene.make.image({
      y: -background.height / 2,
      key: this.key,
      frame: "title"
    });

    this.mTitleLabel = this.scene.make.text({
      y: title.y - 6 * this.dpr,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 16 * this.dpr,
        color: "#3366cc"
      }
    }, false).setOrigin(0.5);

    this.mText = new BBCodeText(this.mScene, 0, 0, "", {
      fontSize: `${14 * this.dpr}px`,
      fontFamily: Font.DEFULT_FONT,
      color: "#000000",
      origin: { x: 0.5, y: 0.5 },
      wrap: {
          mode: "char",
          width: this.width
      },
      align: "center"
    });
    // this.mText.x = -this.mWidth / 2 + 10;
    // this.mText.y = -this.mHeight / 2 + 10;
    this.add([background, title, this.mTitleLabel, this.mText, this.mButtonContaier]);
    super.init();
    this.resize(0, 0);
  }

  private onClickHandler(pointer, gameobject) {
    if (!gameobject) {
      return;
    }
    const btn = (gameobject as NinePatchButton).getBtnData();
    if (!btn) {
        return;
    }
    this.emit("click", btn);
  }
}
