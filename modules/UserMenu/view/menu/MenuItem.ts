import { NiceSliceButton } from "../../../../base/component/button/NiceSliceButton";
import { VisualComponent } from "../../../../base/VisualComponent";
import { op_gameconfig_01 } from "pixelpai_proto";
import { UI } from "../../../../Assets";

export class MenuItem extends NiceSliceButton {
  protected mMenus: MenuItem[];
  protected mChild: VisualComponent;
  protected mArrow: Phaser.Image;
  protected graphics: Phaser.Graphics;
  protected mBackground: PhaserNineSlice.NineSlice;
  constructor(game: Phaser.Game, x: number, y: number, key: string, overFrame: string, outFrame: string, downFrame: string, width: number, height: number, data?: PhaserNineSlice.NineSliceCacheData, text?: string, fontSize?: number) {
    super(game, x, y, key, overFrame, outFrame, downFrame, width, height, data, text, fontSize);
  }

  protected init() {
    super.init();
  }

  public appendItems(menus: MenuItem[]) {
    for (const menu of menus) {
      this.appendItem(menu);
    }
  }

  public appendItem(menu: MenuItem) {
    if (!!this.mChild === false) {
      this.mMenus = [];
      this.mChild = new VisualComponent(this.game, null);
      this.mChild.x = this.width;

      this.mArrow = this.game.make.image(this.width - 10, 14, UI.ArrowDown.getName());
      this.mArrow.anchor.set(0.5, 0.5);
      this.mArrow.angle = 270;
      this.add(this.mArrow);

      this.mBackground = this.game.make.nineSlice(0, 0, UI.Background.getName(), null, 0, 0);
      this.mChild.addAt(this.mBackground, 0);

      // this.graphics = this.game.make.graphics();
      // this.graphics.inputEnabled = true;
      // this.graphics.events.onInputOut.add(this.onInputOutHandler, this);
      // this.graphics.events.onInputOver.add(this.onInputOverHandler, this);
      // this.add(this.graphics);
    }
    // let button = new MenuItem(this.game, 66, this.mChild.length * 32, UI.ButtonChat.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 29, {
    //   top: 4,
    //   bottom: 4,
    //   left: 4,
    //   right: 4}, menu.text, 14);
    // button.node = menu.node;
    this.mChild.add(menu);
    this.mMenus.push(menu);

    this.setSize(this.width, this.menus.length * 30);

    // if (this.graphics) {
    //   this.graphics.clear();
    //   this.graphics.beginFill(0xFF0000, 1);
    //   this.graphics.drawRect(0, 0, 126, this.menus.length * 30);
    //   this.graphics.endFill();
    //   this.bringToTop(this.graphics);
    // }
  }

  private onInputOverHandler() {
    if (this.mChild) {
      this.add(this.mChild);
    }
  }

  private onInputOutHandler() {
    if (this.mChild) {
      this.remove(this.mChild);
    }
  }

  public show() {
    this.add(this.mChild);
  }

  private setSize(width: number, height: number) {
    if (this.mBackground) {
      this.mBackground.resize(width, height);
    }
  }

  public get menus(): MenuItem[] {
    return this.mMenus || [];
  }
}