import { ModuleViewBase } from "../../../common/view/ModuleViewBase";
import { UI, CustomWebFonts } from "../../../Assets";
import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";
import { op_client } from "pixelpai_proto";
import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { DynamicImage } from "../../../base/component/image/DynamicImage";

export class UserInfoView extends CommWindowModuleView {
  private background: PhaserNineSlice.NineSlice;
  private mNickName: Phaser.Text;
  private mLv: Phaser.Text;
  private mFollwerBtn: NiceSliceButton;
  private mActor: DynamicImage;
  private mBadgeImages: DynamicImage[] = [];
  constructor(game: Phaser.Game) {
    super(game);
  }

  init() {
    this.inputEnableChildren = true;
    this.background = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, 360, 200, this);

    let nickNameLabel = this.game.make.text(20, -5, "昵称：", {font: "18px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#b4b4b4"});
    nickNameLabel.stroke = "#000000";
    nickNameLabel.strokeThickness = 2;
    this.add(nickNameLabel);

    let lvLabel = this.game.make.text(20, 30, "等级：", {font: "18px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#b4b4b4"});
    lvLabel.stroke = "#000000";
    lvLabel.strokeThickness = 2;
    this.add(lvLabel);

    this.mNickName = this.game.make.text(nickNameLabel.x + 50,  nickNameLabel.y, "", {font: "18px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#ffffff"});
    this.mNickName.stroke = "#000000";
    this.mNickName.strokeThickness = 2;
    this.add(this.mNickName);

    this.mLv = this.game.make.text(lvLabel.x + 50, lvLabel.y, "", {font: "18px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#ffffff"});
    this.mLv.stroke = "#000000";
    this.mLv.strokeThickness = 2;
    this.add(this.mLv);

    this.mFollwerBtn = new NiceSliceButton(this.game, 258, 145, UI.ButtonBlue.getName(), "button_over.png", "button_out.png", "button_down.png", 80, 34, {
      top: 7,
      bottom: 7,
      left: 7,
      right: 7}, "", 16);
    this.mFollwerBtn.setTextFill("#FFFFFF");
    this.add(this.mFollwerBtn);

    this.mActor = new DynamicImage(this.game, 300, 125, null);
    this.mActor.scale.set(2, 2);
    this.mActor.anchor.set(0.5, 1);
    this.mActor.smoothed = false;
    this.add(this.mActor);
  }

  setData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
    let text = data.text;
    if (text) {
      this.mNickName.setText(text[1].text);
      this.mLv.setText(text[3].text);
    }

    let buttons = data.button;
    if (buttons && buttons.length > 0) {
      this.mFollwerBtn.setText(data.button[0].text);
      this.mFollwerBtn.node = data.button[0].node;
      this.add(this.mFollwerBtn);
    } else {
      this.remove(this.mFollwerBtn);
    }

    const display = data.images;
    if (display && display.length) {
      this.mActor.load(display[0].texturePath, this, null, this.avatarLoadError);
    }

    this.clearBadge();
    for (let i = 1; i < display.length; i++) {
      let badge = new DynamicImage(this.game, (i - 1) * 70 + 27, 68, null);
      badge.load(display[i].texturePath);
      if (display[i].tips) {
        badge.inputEnabled = true;
        badge.setToolTipText(display[i].tips);
      }
      this.add(badge);
      this.mBadgeImages.push(badge);
    }

    this.x = this.game.width - 360 - 6;
    this.y = this.game.height - 200 - 70;
  }

  private avatarLoadError() {
    this.mActor.load("show/avatar_default.png");
  }

  get follwerBtn(): NiceSliceButton {
    return this.mFollwerBtn;
  }

  private clearBadge() {
    for (const badge of this.mBadgeImages) {
      this.remove(badge);
    }
    this.mBadgeImages.length = 0;
  }
}