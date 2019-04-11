import {CommModalWindowView} from "../../../common/view/CommModalWindowView";
import {CustomWebFonts, UI} from "../../../Assets";
import {GameConfig} from "../../../GameConfig";
import {ListComponent} from "../../../base/component/list/core/ListComponent";
import {VoteResultList} from "./VoteResultList";
import {ScrollArea} from "../../../base/component/scroll/ScrollArea";
import Globals from "../../../Globals";

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
      this.m_CloseBt = this.game.make.button(this.width * 15 / 16, this.height / 16, UI.WindowClose.getName(), null, this
          , 1, 0 , 2);
      this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
      this.add(this.m_CloseBt);

      this.m_Static = this.game.make.text(this.width * 6 / 8, this.height / 10, "完整剧情", {
          font: "30px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff"
      });
      this.add(this.m_Static);

      this.m_Desc = this.game.make.text(0, 0, "", {
          font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff", wordWrap: true, wordWrapWidth: 510});

      const bounds = new Phaser.Rectangle(this.width * 2/ 3, this.m_Static.y + 100, 510, 660);
      this.scroller = new ScrollArea(this.game, bounds);
      this.scroller.add(this.m_Desc);
      this.scroller.start();
      this.add(this.scroller);

      this.m_List = new VoteResultList(this.game);
      this.m_List.x = this.width / 6;
      this.m_List.y = this.height / 16;
      this.add(this.m_List);

      this.m_Tip = this.game.make.text(this.width >> 1, this.height * 19 / 20, "...按任意位置退出该局游戏...", {
          font: "24px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#fff"});
      this.m_Tip.anchor.setTo(0.5);
      this.add(this.m_Tip);
  }

    public onDispose(): void {
        this.m_List.onDispose();
        this.m_List = null;
        this.scroller.stop();
        this.scroller = null;
        super.onDispose();
    }

  public setDesc(value: string): void {
      this.m_Desc.text = value;
      Globals.Tool.formatChinese(this.m_Desc, 510);
  }
}
