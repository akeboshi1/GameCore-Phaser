import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {PageComponent} from "../../../base/component/page/core/PageComponent";
import {Font, UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteList} from "./VoteList";
import {VoteListItem} from "./item/VoteListItem";

export class VoteView extends CommModalWindowView {

  public m_Title: Phaser.Text;
  public m_Text: Phaser.Text;
  public m_List: ListComponent;
  public m_TimeTxt: Phaser.BitmapText;
  public m_LeftText: Phaser.Text;
  public m_LeftNumTxt: Phaser.BitmapText;
  constructor(game: Phaser.Game) {
    super(game);
  }

    protected preInit(): void {
        this.graphics = this.game.add.graphics(0, 0, this);
        this.graphics.beginFill(0x000, 0.6);
        this.graphics.drawRect(0, 0, GameConfig.GameWidth, GameConfig.GameHeight);
        this.graphics.endFill();
        this.m_Width = 1280;
        this.m_Height = 730;
    }

  protected init(): void {
      this.m_CloseBt = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);

      this.m_Title = this.game.make.text(560, 37, "疑凶投票");
      this.add(this.m_Title);

      this.m_Text = this.game.make.text(560, 37, "投票阶段倒计时");
      this.add(this.m_Text);

      this.m_TimeTxt = this.game.make.bitmapText(540, 613, Font.NumsLatinUppercase.getName(), "00:00", 24);
      this.add(this.m_TimeTxt);

      this.m_LeftText = this.game.make.text(1092, 675, "剩余未投票");
      this.add(this.m_LeftText);

      this.m_LeftNumTxt = this.game.make.bitmapText(1234, 687, Font.NumsLatinUppercase.getName(), "0", 24);
      this.add(this.m_LeftNumTxt);


      this.m_List = new VoteList(this.game);
      this.m_List.x = 8;
      this.m_List.y = 64;
      let i: number = 0;
      let len: number = 36;
      let item: VoteListItem;
      for (; i < len; i++) {
          item = new VoteListItem(this.game);
          this.m_List.addItem(item);
      }
      this.add(this.m_List);
  }

  public setData(): void {

  }
}
