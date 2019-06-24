import { UI, CustomWebFonts } from "../../../Assets";
import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { op_gameconfig } from "pixelpai_proto";
import { ShopListItem } from "./ShopListItem";
import { ToolTip } from "../../../base/component/tooltip/ToolTip";

export class ShopView extends CommWindowModuleView {
  private _items: op_gameconfig.IItem[];
  private _itemsGroup: Phaser.Group;
  public onBuyItem: Phaser.Signal;
  protected mToolTip: ToolTip;
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected preInit() {
    this.m_Width = 550;
    this.m_Height = 380;
  }

  protected init() {
    this.m_Bg = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, this.width, this.height, this);

    const title = this.game.make.image(12, -14,  UI.ShopTitle.getName());
    this.add(title);
    const titleLabel = this.game.make.text(50, -10, "内购商店", {font: "20px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF" });
    this.add(titleLabel);

    this.m_CloseBt = this.game.make.button(this.width - 30, -8, UI.WindowClose.getName(), null, this, 1, 0 , 2);
    this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
    this.add(this.m_CloseBt);

    this._itemsGroup = this.game.add.group(this);

    this.mToolTip = new ToolTip(this.game);

    this.onBuyItem = new Phaser.Signal();
  }

  public addItems(items: op_gameconfig.IItem[]) {
    if (!this._items) {
      this._items = [];
    }
    this._items = this._items.concat(items);
    for (let i = 0; i < this._items.length; i++) {
      let item = new ShopListItem(this.game);
      item.data = items[i];
      item.onAdded();
      item.x = i % 5 * 98 + 34;
      item.y = Math.floor(i / 5) * 98 + 45;
      item.inputEnabled = true;
      this._itemsGroup.add(item);
      item.events.onInputUp.add(this.buyItemHandler, this);
    }
  }

  private buyItemHandler(target) {
    this.onBuyItem.dispatch(target.data);
  }
}