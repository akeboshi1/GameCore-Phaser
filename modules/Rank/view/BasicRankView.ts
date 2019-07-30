import { ModuleViewBase } from "../../../common/view/ModuleViewBase";
import { op_client } from "pixelpai_proto";
import { CustomWebFonts, UI } from "../../../Assets";

export class BasicRankView extends ModuleViewBase {
  protected mTitleLabel: Phaser.Text;
  protected mContentGroup: Phaser.Group;
  protected mBg: PhaserNineSlice.NineSlice;
  protected mTexts: Phaser.Text[] = [];
  constructor(game: Phaser.Game) {
    super(game);
  }

  init() {
    super.init();
    this.inputEnableChildren = true;

    this.mBg = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, 329, 362, this);

    this.mContentGroup = this.game.add.group(this);

    let titleIcon = this.game.make.image(20, -15, UI.RankIcon.getName());
    this.add(titleIcon);

    this.mTitleLabel = this.game.make.text(54, -11, "排行榜", {font: "bold 22px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#ffffff"});
    this.mTitleLabel.stroke = "#000000";
    this.mTitleLabel.strokeThickness = 2;
    this.add(this.mTitleLabel);

    this.game.add.nineSlice(7, 19, UI.Background.getName(), null, 315, 318, this.mContentGroup);
  }

  addItem(items: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
    this.clearText();
    const texts = items.text;
    if (!texts || texts.length < 1) return;
    this.mTitleLabel.setText(texts[0].text);
    this.mTitleLabel.data = texts[0].node;

    const locX = [12, 60, 238];
    for (let i = 1; i < 4; i++) {
      let text = this.game.add.text(locX[i - 1], 27, texts[i].text, {font: "bold 15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#ffffff"}, this.mContentGroup);
      text.data = texts[i].node;
      text.stroke = "#000000";
      text.strokeThickness = 3;
      this.mTexts.push(text);
    }

    // locX[2] = 238;
    for (let i = 4; i < texts.length; i++) {
      let t = texts[i];
      let x = (i - 4) % 3;
      let y = Math.floor((i - 4) / 3) * 27;
      let text = this.game.add.text(locX[x], 60 + y, t.text, {font: "bold 15px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: t.color ? t.color : "#ffffff"}, this.mContentGroup);
      if (x === 0) {
        text.setTextBounds(0, 0, 30, 16);
        text.boundsAlignH = "center";
      }
      text.data = texts[i].node;
      text.stroke = "#000000";
      text.strokeThickness = 3;
      this.mTexts.push(text);
    }
  }

  updateItem(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {

  }

  protected clearText() {
    for (const text of this.mTexts) {
      text.destroy();
    }
    this.mTexts.length = 0;
  }
}