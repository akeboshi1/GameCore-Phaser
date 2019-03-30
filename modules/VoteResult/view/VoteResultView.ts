import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteResultList} from "./VoteResultList";

export class VoteResultView extends CommModalWindowView {

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
        this.m_Width = GameConfig.GameWidth;
        this.m_Height = GameConfig.GameHeight;
    }

  protected init(): void {
      this.m_CloseBt = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);

      this.m_Desc = this.game.make.text(this.width - 350, 200, "完整剧情", {fontSize: 12, fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle"});
      this.add(this.m_Desc);

      this.m_List = new VoteResultList(this.game);
      this.m_List.x = 320;
      this.m_List.y = 130;
      this.add(this.m_List);
  }
}
