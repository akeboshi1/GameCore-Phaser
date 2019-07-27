import { UI, CustomWebFonts } from "../../../Assets";
import { CommWindowModuleView } from "../../../common/view/CommWindowModuleView ";
import { op_gameconfig, op_client } from "pixelpai_proto";
import { ShopListItem } from "./ShopListItem";
import { Rectangle } from "phaser-ce";
import { ScrollBar } from "../../../base/component/scroll/ScrollBar";
import { NiceSliceButton } from "../../../base/component/button/NiceSliceButton";

export class ShopView extends CommWindowModuleView {
  private _items: op_gameconfig.IItem[];
  private _itemsGroup: Phaser.Group;
  private _balanceIcon: Phaser.Image;
  private _balance: Phaser.Text;
  private _scroll: ScrollBar;
  public payBtn: NiceSliceButton;
  public syncTuDing: NiceSliceButton;
  public onBuyItem: Phaser.Signal;
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected preInit() {
    this.m_Width = 550;
    this.m_Height = 380;
  }

  protected init() {
    // this.inputEnableChildren = true;
    this.m_Bg = this.game.add.nineSlice(0, 0, UI.BagBg.getName(), null, this.width, this.height, this);
    this.m_Bg.events.onInputOver.add(this.mouseOverHandler, this);
    this.m_Bg.events.onInputOut.add(this.mouseOutHandler, this);

    const title = this.game.make.image(12, -14,  UI.ShopTitle.getName());
    this.add(title);
    const titleLabel = this.game.make.text(46, -12, "内购商店", {font: "bold 20px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF" });
    titleLabel.stroke = "#000000";
    titleLabel.strokeThickness = 2;
    this.add(titleLabel);

    this.payBtn = new NiceSliceButton(this.game, this.m_Width - 100, -14, UI.ButtonBlue.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 30, {
      top: 7,
      bottom: 7,
      left: 7,
      right: 7
    }, "＋充值", 14);
    this.payBtn.setTextFill("#000000");
    this.add(this.payBtn);

    this.syncTuDing = new NiceSliceButton(this.game, this.payBtn.x - 70, this.payBtn.y, UI.ButtonBlue.getName(), "button_over.png", "button_out.png", "button_down.png", 60, 30, {
      top: 7,
      bottom: 7,
      left: 7,
      right: 7
    }, "刷新", 14);
    this.syncTuDing.setTextFill("#000000");
    this.add(this.syncTuDing);

    this._balanceIcon = this.game.make.image(this.m_Width - 230, this.payBtn.y, UI.TuDing22.getName());
    this.add(this._balanceIcon);
    this._balance = this.game.make.text(this.m_Width - 200, -11, "", {font: "bold 16px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF" });
    this._balance.stroke = "#000000";
    this._balance.strokeThickness = 2;
    this.add(this._balance);

    this.m_CloseBt = this.game.make.button(this.width - 30, -5, UI.WindowClose.getName(), null, this, 1, 0 , 2);
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

  setUserBalance(balance: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SYNC_USER_BALANCE) {
    const tuDing = balance.tuDing;
    if (typeof tuDing === "number") {
      this._balance.setText(balance.tuDing.toString());
      this._balance.x = this.m_Width - this._balance.width - 180;
      this._balanceIcon.x = this._balance.x - 30;
    }
  }

  public get scroll(): ScrollBar {
    return this._scroll;
  }

  public get price(): number {
    if (!!this._balance === false) {
      return 0;
    }
    return parseInt(this._balance.text);
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