import { ListItemComponent } from "../../../base/component/list/core/ListItemComponent";
import { IListItemComponent } from "../../../base/component/list/interfaces/IListItemComponent";
import { UI } from "../../../Assets";
import { BaseIcon } from "../../../base/component/icon/BaseIcon";

export class ShopListItem extends ListItemComponent implements IListItemComponent {
  protected m_icon: BaseIcon;
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected init() {
    let bg = this.game.add.image(0, 0, UI.BagItemBg.getName(), 0);
    this.addChild(bg);

    this.m_icon = new BaseIcon(this.game);
    this.m_icon.icon.anchor.set(0.5, 0.5);
    this.m_icon.x = 26;
    this.m_icon.y = 26;
    this.addChild(this.m_icon);
    super.init();
  }

  public getHeight(): number {
    return 52;
  }

  public getWidth(): number {
    return 52;
  }

  protected render(): void {
    if (this.m_icon && this.data && this.data.display) {
      this.m_icon.load(this.data.display.texturePath, this);
    }
  }
}
