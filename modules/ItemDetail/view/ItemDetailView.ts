import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {CustomWebFonts, UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {NiceSliceButton} from "../../../base/component/button/NiceSliceButton";
import {BaseIcon} from "../../../base/component/icon/BaseIcon";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import {Log} from "../../../Log";

export class ItemDetailView extends CommModalWindowView {
  public m_Icon: BaseIcon;
  public m_Text: Phaser.Text;
  public m_Bt: NiceSliceButton;
  public scroller: ScrollArea;
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
      this.m_CloseBt = this.game.make.button(this.width * 5 / 6, this.height / 8, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);

      this.m_Icon = new BaseIcon(this.game);
      this.m_Icon.x = this.width >> 1;
      this.m_Icon.y = 95;
      this.add(this.m_Icon);

      this.m_Text = this.game.make.text(0, 0, "", {font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFF", align: "left", wordWrap: true, wordWrapWidth: 600});

      const bounds = new Phaser.Rectangle((this.width - 600) >> 1, this.height - 420, 600, 300);
      this.scroller = new ScrollArea(this.game, bounds);
      this.scroller.add(this.m_Text);
      this.scroller.start();
      this.add(this.scroller);

      this.m_Bt = new NiceSliceButton(this.game, (this.width - 110) >> 1, this.height - 95, UI.ButtonBlue.getName(), "button_over.png", "button_out.png", "button_down.png", 110, 45, {
          top: 7,
          bottom: 7,
          left: 7,
          right: 7
      }, "获取", 24);
      this.add(this.m_Bt);
  }

  public loadIcon(value: string): void {
      if (this.m_Icon) {
          this.m_Icon.load(value, this, this.loadComplete);
      }
  }

  private loadComplete(): void {
      // Log.trace("图标宽度", this.m_Icon.iconWidth);
  }
}
