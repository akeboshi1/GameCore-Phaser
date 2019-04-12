import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {CustomWebFonts, Font, UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteList} from "./VoteList";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";

export class VoteView extends CommModalWindowView {

  public m_Title: Phaser.Text;
  public m_Text: Phaser.Text;
  public m_List: ListComponent;
  public m_TimeTxt: Phaser.Text;
  public m_LeftText: Phaser.Text;
  public m_LeftNumTxt: Phaser.BitmapText;
  public m_Bt: NiceSliceButton;
  constructor(game: Phaser.Game) {
    super(game);
  }

    protected preInit(): void {
        this.graphics = this.game.add.graphics(0, 0, this);
        this.graphics.beginFill(0x000, 0.6);
        this.graphics.drawRect(0, 0, GameConfig.GameWidth, GameConfig.GameHeight);
        this.graphics.endFill();
        this.m_Width = GameConfig.GameWidth;
        this.m_Height = GameConfig.GameHeight;
    }

  protected init(): void {
      this.m_CloseBt = this.game.make.button(this.width * 5 / 6, this.height / 8, UI.WindowClose.getName(), this.onCloseClick, this
          , 1, 0 , 2);
      this.add(this.m_CloseBt);

      this.m_Title = this.game.make.text(this.width >> 1, this.height / 8, "・疑凶投票・", {font: "36px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFF"});
      this.m_Title.anchor.set(0.5);
      this.add(this.m_Title);

      this.m_Text = this.game.make.text(this.width / 4, this.height * 7 / 8, "投票阶段倒计时", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFF"});
      this.add(this.m_Text);

      this.m_TimeTxt = this.game.make.text(this.m_Text.x + this.m_Text.width + 20, this.m_Text.y, "00:00", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FF0000"});
      this.add(this.m_TimeTxt);
3
      this.m_List = new VoteList(this.game);
      this.m_List.x = (this.width - 848) >> 1;
      this.m_List.y = (this.height - 538) >> 1;
      this.add(this.m_List);

      this.m_LeftText = this.game.make.text(this.width * 3 / 4, this.height * 7 / 8, "剩余未投票", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFF"});
      this.add(this.m_LeftText);

      this.m_LeftNumTxt = this.game.make.bitmapText(this.m_LeftText.x + 140, this.m_LeftText.y + 4, Font.NumsLatinUppercase.getName(), "0", 24);
      this.add(this.m_LeftNumTxt);

      this.m_Bt = new NiceSliceButton(this.game, (this.width * 3 / 4) + 18, this.m_LeftNumTxt.y - 68, UI.ButtonRed.getName(), "button_over.png", "button_out.png", "button_down.png", 110, 45, {
          top: 7,
          bottom: 7,
          left: 7,
          right: 7
      }, "确认投票", 24);
      this.add(this.m_Bt);
  }

  public onDispose(): void {
      this.m_List.onDispose();
      this.m_List = null;
      super.onDispose();
  }
}
