import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {PageComponent} from "../../../base/component/page/core/PageComponent";
import {CustomWebFonts, Font, UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteList} from "./VoteList";
import {VoteListItem} from "./item/VoteListItem";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";

export class VoteView extends CommModalWindowView {

  public m_Title: Phaser.Text;
  public m_Text: Phaser.Text;
  public m_List: ListComponent;
  public m_TimeTxt: Phaser.BitmapText;
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
      this.m_CloseBt = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);

      this.m_Title = this.game.make.text((this.width - 178) >> 1, 150, "・疑凶投票・", {fontSize: 24, fill: "#FFF", boundsAlignH: "center", boundsAlignV: "middle"});
      this.add(this.m_Title);

      // this.m_Text = this.game.make.text(430, this.height - 250, "投票阶段倒计时", {fontSize: 24, fill: "#FFF", boundsAlignH: "center", boundsAlignV: "middle"});

      this.m_Text = this.game.add.text(430, this.height - 250, "投票阶段倒计时", {
          font: "30px " + CustomWebFonts.Fonts2DumbWebfont.getFamily()
      });
      this.add(this.m_Text);

      this.m_TimeTxt = this.game.make.bitmapText(640, this.height - 255, Font.NumsLatinUppercase.getName(), "00:00", 24);
      this.add(this.m_TimeTxt);

      // this.m_LeftText = this.game.make.text(1092, 675, "剩余未投票");
      // this.add(this.m_LeftText);

      // this.m_LeftNumTxt = this.game.make.bitmapText(1234, 687, Font.NumsLatinUppercase.getName(), "0", 24);
      // this.add(this.m_LeftNumTxt);

      this.m_List = new VoteList(this.game);
      this.m_List.x = 430;
      this.m_List.y = 240;
      this.add(this.m_List);

      this.m_Bt = new NiceSliceButton(this.game, this.width - 400, this.height - 250, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", 110, 45, {
          top: 7,
          bottom: 7,
          left: 7,
          right: 7
      }, "确认投票", 24);
      this.add(this.m_Bt);
  }
}
