import { ListItemComponent } from "../../../base/component/list/core/ListItemComponent";
import { IListItemComponent } from "../../../base/component/list/interfaces/IListItemComponent";
import { UI, CustomWebFonts } from "../../../Assets";
import { BaseIcon } from "../../../base/component/icon/BaseIcon";
import Globals from "../../../Globals";
import { ToolTip } from "../../../base/component/tooltip/ToolTip";
import { op_gameconfig, op_def } from "pixelpai_proto";
import { Rectangle } from "phaser-ce";

export class ShopListItem extends ListItemComponent implements IListItemComponent {
  protected m_icon: BaseIcon;
  protected mToolTipText: string;
  protected mToolTip: ToolTip;
  protected mPrice: Phaser.Text;
  protected mMoneyGroup: Phaser.Group;
  constructor(game: Phaser.Game) {
    super(game);
  }

  protected init() {
    const bg = this.game.add.image(0, 0, UI.BagItemBg.getName(), 0);
    this.addChild(bg);

    this.m_icon = new BaseIcon(this.game);
    this.m_icon.icon.anchor.set(0.5, 0.5);
    this.m_icon.x = 26;
    this.m_icon.y = 26;
    this.addChild(this.m_icon);

    this.mMoneyGroup = this.game.make.group(this);
    this.mMoneyGroup.y = 56;

    super.init();
  }

  public getHeight(): number {
    return 95;
  }

  public getWidth(): number {
    return 52;
  }

  protected render(): void {
    if (this.m_icon && this.data && this.data.display) {
      const item: op_gameconfig.IItem = this.data;
      this.m_icon.load(item.display.texturePath, this);
      // let prices = item.price;
      let prices = [{ price: 100, coinType: op_def.CoinType.TU_DING_COIN }, { price: 80, coinType: op_def.CoinType.TU_DING_COIN }];
      this.mMoneyGroup.removeAll(true);
      for (let i = 0; i < prices.length; i++) {
        this.makeCoin(prices[i], this.mMoneyGroup.width, i * 20);
      }
      this.setToolTipText(`${item.name}\n${item.shopDes}`);
      this.mMoneyGroup.x = this.getWidth() - this.mMoneyGroup.width >> 1;
    }
  }

  protected makeCoin(price: op_gameconfig.IPrice, offsetX: number, y: number) {
    let key = "";
    if (price.coinType === op_def.CoinType.TU_DING_COIN) {
      key = UI.TuDing18.getName();
    }
    const moneyIcon = this.game.make.image(0, y, key);
    this.mMoneyGroup.add(moneyIcon);

    const priceText = this.game.make.text(moneyIcon.x + moneyIcon.width + 4, y, "", {font: "16px " + CustomWebFonts.Fonts2DumbWebfont.getFamily(), fill: "#FFFFFF" });
    this.mMoneyGroup.add(priceText);
    priceText.setText(price.price.toString());
  }

  public setToolTip(toolTip: ToolTip) {
    this.mToolTip = toolTip;
    Globals.ToolTipManager.setToolTip(this, toolTip);
  }

  public setToolTipText(text: string) {
    this.mToolTipText = text;
    this.setToolTip(ToolTip.getInstance(this.game));
  }

  public initToolTip() {
    if (this.mToolTip) {
      this.mToolTip.setText(this.mToolTipText);
    }
  }

  public get height(): number {
    return this.getHeight();
  }

  public get width(): number {
    return this.getWidth();
  }

  public getBounds(): Rectangle {
    return new Rectangle(this.x, this.y, this.getWidth(), this.getHeight());
  }

  public destroy() {
    Globals.ToolTipManager.setToolTip(this, null);
    super.destroy();
  }
}
