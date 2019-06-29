import { UI, CustomWebFonts } from "../../../Assets";
import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { op_gameconfig } from "pixelpai_proto";
import { ShopListItem } from "./ShopListItem";
import { Rectangle } from "phaser-ce";
import { ScrollBar } from "../../../base/component/scroll/ScrollBar";

export class ShopView extends CommWindowModuleView {
  private _items: op_gameconfig.IItem[];
  private _itemsGroup: Phaser.Group;
  private _scroll: ScrollBar;
  public onBuyItem: Phaser.Signal;
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected preInit() {
    this.m_Width = 550;
    this.m_Height = 380;
  }

  protected init() {
    this.inputEnableChildren = true;
    this.m_Bg = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, this.width, this.height, this);
    this.m_Bg.events.onInputOver.add(this.mouseOverHandler, this);
    this.m_Bg.events.onInputOut.add(this.mouseOutHandler, this);

    const title = this.game.make.image(12, -14,  UI.ShopTitle.getName());
    this.add(title);
    const titleLabel = this.game.make.text(46, -10, "内购商店", {font: "20px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF" });
    this.add(titleLabel);

    this.m_CloseBt = this.game.make.button(this.width - 30, -8, UI.WindowClose.getName(), null, this, 1, 0 , 2);
    this.m_CloseBt.events.onInputUp.add(this.onCloseClick, this);
    this.add(this.m_CloseBt);

    this._itemsGroup = this.game.add.group(this);
    this._itemsGroup.x = 34;
    this._itemsGroup.y = 30;
    this._scroll = new ScrollBar(this.game, this._itemsGroup, this, new Rectangle(0, 20, 510, 350));
    this._scroll.start();

    this.onBuyItem = new Phaser.Signal();
  }

  public addItems(items: op_gameconfig.IItem[]) {
    if (!this._items) {
      this._items = [];
    }
    let len = items.length;
    let index = this._items.length;
    for (let i = 0; i < len; i++) {
      let item = new ShopListItem(this.game);
      item.data = items[i];
      item.onAdded();
      item.x = (index + i) % 5 * 98;
      item.y = Math.floor( (index + i) / 5) * 98;
      item.inputEnabled = true;
      this._itemsGroup.add(item);
      item.events.onInputUp.add(this.buyItemHandler, this);
    }
    this._items = this._items.concat(items);
    // let graphics = this.game.make.graphics();
    // graphics.beginFill(0xFF9900, .5);
    // graphics.drawRect(this._itemsGroup.x, this._itemsGroup.y, this._itemsGroup.width, this._itemsGroup.height);
    // graphics.endFill();
    // this.add(graphics);
  }

  update() {
    if (this._scroll) this._scroll.update();
  }

  public get scroll(): ScrollBar {
    return this._scroll;
  }

  private buyItemHandler(target) {
    this.onBuyItem.dispatch(target.data);
  }

  private mouseOverHandler(target) {
    // console.log("over");
    this._scroll.start();
  }

  private mouseOutHandler(target, pointer) {
    if ((pointer.x > this.x + this.m_Width || pointer.x < this.x) ||
        (pointer.y > this.y + this.m_Height || pointer.y < this.y)) {
      this._scroll.stop();
    }
  }
}