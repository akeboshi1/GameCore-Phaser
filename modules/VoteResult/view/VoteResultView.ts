import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {PageComponent} from "../../../base/component/page/core/PageComponent";
import {UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteResultList} from "./VoteResultList";
import {VoteResultListItem} from "./item/VoteResultListItem";

export class VoteResultView extends CommModalWindowView {

  public m_Text: Phaser.Text;
  public m_IconBg: Phaser.Image;
  public m_Icon: Phaser.Image;
  public m_Name: Phaser.Text;
  public m_List: ListComponent;
  public m_Desc: Phaser.Text;
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

      this.m_Text = this.game.make.text(740, 65, "凶手：");

      this.m_IconBg = this.game.make.image(914, 65, "");
      this.add(this.m_IconBg);
      this.m_Icon = this.game.make.image(914, 65);
      this.add(this.m_Icon);
      this.m_Name = this.game.make.text(914, 284, "剧本角色");
      this.add(this.m_Name);

      this.m_Desc = this.game.make.text(30, 360, "完整剧情");

      this.m_List = new VoteResultList(this.game);
      this.m_List.x = 8;
      this.m_List.y = 64;
      let i: number = 0;
      let len: number = 36;
      let item: VoteResultListItem;
      for (; i < len; i++) {
          item = new VoteResultListItem(this.game);
          this.m_List.addItem(item);
      }
      this.add(this.m_List);
  }

  public setData(): void {

  }
}
