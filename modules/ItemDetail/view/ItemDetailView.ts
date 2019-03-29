import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {PageComponent} from "../../../base/component/page/core/PageComponent";
import {UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";

export class ItemDetailView extends CommModalWindowView {
  public m_Icon: DisplayLoaderAvatar;
  public m_Text: Phaser.Text;
  constructor(game: Phaser.Game) {
    super(game);
  }

    protected preInit(): void {
        this.graphics = this.game.add.graphics(0, 0, this);
        this.graphics.beginFill(0x000, 0.6);
        this.graphics.drawRect(0, 0, GameConfig.GameWidth, GameConfig.GameHeight);
        this.graphics.endFill();
        this.m_Width = 620;
        this.m_Height = 460;
    }

  protected init(): void {
      this.m_CloseBt = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);
      this.m_Icon = new DisplayLoaderAvatar(this.game);
      this.add(this.m_Icon);
      this.m_Text = this.game.make.text(340, 370, "", {fontSize: 24, fill: "#FFF"});
      this.add(this.m_Text);
  }

  public setData(): void {

  }
}
