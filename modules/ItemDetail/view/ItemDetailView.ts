import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {DisplayLoaderAvatar} from "../../../common/avatar/DisplayLoaderAvatar";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {BaseIcon} from "../../../base/component/icon/BaseIcon";

export class ItemDetailView extends CommModalWindowView {
  public m_Icon: BaseIcon;
  public m_Text: Phaser.Text;
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
      this.m_Icon = new BaseIcon(this.game);
      this.m_Icon.x = this.width >> 1;
      this.m_Icon.y = this.height / 3;
      this.add(this.m_Icon);
      this.m_Text = this.game.make.text(this.width >> 1, this.height / 2, "", {fontSize: 24, fill: "#FFF", boundsAlignH: "center", boundsAlignV: "middle"});
      this.add(this.m_Text);

      this.m_Bt = new NiceSliceButton(this.game, this.width >> 1, this.height * 2 / 3, UI.Button.getName(), "button_over.png", "button_out.png", "button_down.png", 110, 45, {
          top: 7,
          bottom: 7,
          left: 7,
          right: 7
      }, "获取", 24);
      this.add(this.m_Bt);
  }
}
