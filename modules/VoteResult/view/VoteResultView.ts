import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {CustomWebFonts, UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteResultList} from "./VoteResultList";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";

export class VoteResultView extends CommModalWindowView {

  public m_List: ListComponent;
  protected m_Static: Phaser.Text;
  public m_Desc: Phaser.Text;
  protected m_Tip: Phaser.Text;
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
      this.m_CloseBt = this.game.make.button(this.width - 30, 4, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);

      this.m_Static = this.game.make.text(this.width - 350, 200, "完整剧情", {
          font: "30px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff"
      });
      this.add(this.m_Static);

      this.m_Desc = this.game.make.text(this.width - 350, 240, "", {
          font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff"
      });

      const bounds = new Phaser.Rectangle(this.width - 350, 240, 510, 520);
      this.scroller = new ScrollArea(this.game, bounds);
      this.scroller.add(this.m_Desc);
      this.scroller.start();
      this.add(this.scroller);

      this.m_List = new VoteResultList(this.game);
      this.m_List.x = 320;
      this.m_List.y = 130;
      this.add(this.m_List);

      this.m_Tip = this.game.make.text(this.game.world.centerX, this.height - 150, "...按任意位置退出该局游戏...", {
          font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff"
      });
      this.m_Tip.anchor.setTo(0.5);
      this.add(this.m_Tip);
  }
}
