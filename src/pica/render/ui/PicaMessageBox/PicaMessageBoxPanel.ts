import { BBCodeText, Button, NineSliceButton, NineSlicePatch, ClickEvent } from "apowophaserui";
import { BasePanel, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { Color, Font } from "utils";

export class PicaMessageBoxPanel extends BasePanel {
  private mTitleLabel: Phaser.GameObjects.Text;
  private mButtons: NineSliceButton[];
  private mText: BBCodeText;
  private mButtonContaier: Phaser.GameObjects.Container;
  private closeBtn: Button;
  private border: Phaser.GameObjects.Graphics;
  constructor(uiManager: UiManager) {
    super(uiManager.scene, uiManager.render);
    this.key = ModuleName.PICAMESSAGEBOX_NAME;
  }

  show(param) {
    this.mShowData = param;
    if (this.mPreLoad) return;
    if (!this.mInitialized) {
      this.preload();
      return;
    }
    const data = param;
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
    const buttons: any[] = data.button.sort((a, b) => {
      if (a.param > b.param) return 1;
      else return -1;
    });
    if (buttons) {
      const btnWid: number = 114 * this.dpr;
      const btnHei: number = 40 * this.dpr;
      const w = (this.width - 30 * this.dpr) / buttons.length;
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
      const totalW = w * buttons.length;
      let posx = -totalW * 0.5;
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < buttons.length; i++) {
        const txt: string = buttons[i] ? buttons[i].text : "";
        const paramn = buttons[i].param;
        const imgframe = paramn === 1 ? "yellow_btn" : "red_btn";
        const color = (paramn === 1 ? Color.brownish : Color.white);
        const btn = new NineSliceButton(this.mScene, 0, 0, btnWid, btnHei, this.key, imgframe, txt, this.dpr, this.scale, config, undefined, buttons[i]);
        btn.setTextStyle({
          fontFamily: Font.DEFULT_FONT,
          fontSize: 16 * this.dpr,
          color
        });
        btn.setFontStyle("bold");
        btn.x = posx + w * 0.5;
        posx += w;
        this.mButtons.push(btn);
        btn.on(ClickEvent.Tap, this.onClickHandler, this);
      }
      this.mButtonContaier.add(this.mButtons);
      this.mButtonContaier.x = 0;
    }
    this.resize(0, 0);
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.x = width / 2;
    this.y = height / 2;
    super.resize(w, h);
    this.border.setInteractive(new Phaser.Geom.Rectangle(-width * 0.5, -height * 0.5, width, height), Phaser.Geom.Rectangle.Contains);
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
    this.add(border);
    this.border = border;
    const background = this.scene.make.image({ key: this.key, frame: "bg_universal_box" });
    this.add(background);
    this.setSize(background.width, background.height);
    this.closeBtn = new Button(this.scene, this.key, "close");
    this.closeBtn.setDisplaySize(28 * this.dpr, 28 * this.dpr);
    this.closeBtn.setPosition(this.width * 0.5 - 5 * this.dpr, -this.height * 0.5 + this.dpr * 4);
    this.closeBtn.on(String(ClickEvent.Tap), this.onCloseHandler, this);
    this.add(this.closeBtn);
    this.mButtonContaier = this.scene.make.container(undefined, false);

    const title = this.scene.make.image({
      y: -background.height / 2,
      key: this.key,
      frame: "title"
    });
    title.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
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
    const btn = (gameobject as NineSliceButton).getBtnData();
    if (!btn) {
      return;
    }
    if (btn.local) {
      if (btn.clickhandler) {
        const panel = this.render.uiManager.getPanel(`${btn.clickhandler.key}`);
        if (panel && btn.clickhandler.clickfun) {
          const clickfun = panel[btn.clickhandler.clickfun];
          clickfun.apply(panel, btn.data);
        }
      }
      this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_hide");
    } else {
      this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_click", btn);
    }
  }

  private onCloseHandler() {
    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_hide");
  }
}
