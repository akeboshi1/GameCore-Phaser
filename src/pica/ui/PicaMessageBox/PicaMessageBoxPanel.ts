import { BasePanel } from "../Components/BasePanel";
import { NinePatch } from "../Components/Nine.patch";
import { NinePatchButton } from "../Components/Ninepatch.button";
import { BBCodeText } from "apowophaserui";
import { WorldService } from "../../world.service";
import { Font } from "../../../utils/font";

export class PicaMessageBoxPanel extends BasePanel {
  private key: string = "pica_message_box";
  private mTitleLabel: Phaser.GameObjects.Text;
  private mButtons: NinePatchButton[];
  private mText: BBCodeText;
  private mButtonContaier: Phaser.GameObjects.Container;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    // this.disInteractive();
  }

  show(param) {
    super.show(param);
    if (!this.mInitialized) {
      return;
    }
    const data = param[0];
    this.mButtons = [];
    if (data) {
      if (data.text && data.text[0]) {
        this.mText.setText(data.text[0].text);
        this.mText.x = -this.mText.width / 2;
        this.mText.y = -this.mText.height;
      }
      if (data.title) {
        this.mTitleLabel.setText(data.title.text);
      }
    }
    const buttons = data.button;
    if (buttons) {
      const btnWid: number = 114 * this.dpr;
      const btnHei: number = 40 * this.dpr;
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
  }

  protected preload() {
    this.addAtlas(this.key, "pica_message_box/pica_message_box.png", "pica_message_box/pica_message_box.json");
    super.preload();
  }

  protected init() {
    const { width, height } = this.scene.cameras.main;

    const border = this.scene.make.graphics(undefined, false);
    border.fillStyle(0, 0.6);
    border.fillRect(-width * 0.5, -height * 0.5, width, height);
    border.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.add(border);

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
    this.resize(width, height);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
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
