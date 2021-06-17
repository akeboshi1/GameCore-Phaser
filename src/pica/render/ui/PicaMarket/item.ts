import { DynamicImage } from "gamecoreRender";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Coin, Font, i18n, Logger, UIHelper, Url } from "utils";
import { ICurrencyLevel, IMarketCommodity } from "picaStructure";
import { BBCodeText } from "apowophaserui";

export class MarketItem extends Phaser.GameObjects.Container {
  private mSelectBg: Phaser.GameObjects.Image;
  private mBackground: Phaser.GameObjects.Image;
  private mPropImage: DynamicImage;
  private mNickName: Phaser.GameObjects.Text;
  private mCoinIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private limitText: Phaser.GameObjects.Text;
  private mTagIcon: Phaser.GameObjects.Image;
  private starImg: Phaser.GameObjects.Image;
  private mProp: any;// op_client.IMarketCommodity
  private zoom: number = 1;
  private readonly dpr: number;
  private atals: string;
  private currency: ICurrencyLevel;

  constructor(scene: Phaser.Scene, x, y, dpr, zoom) {
    super(scene, x, y);
    this.dpr = dpr;
    this.zoom = zoom;
    this.atals = UIAtlasName.market;
    this.mSelectBg = this.scene.make.image({ key: this.atals, frame: "shop_list_select_bg" });
    this.mBackground = this.scene.make.image({ key: this.atals, frame: "item_bg" }, false);
    this.setSize(this.mSelectBg.width, this.mSelectBg.height);
    this.mPropImage = new DynamicImage(scene, 0, 0);
    this.mPropImage.x = -this.width * 0.5 + 28 * dpr;
    this.mPropImage.y = 0;
    this.mPropImage.scale = this.dpr / this.zoom;
    // this.limitText = this.scene.make.text({ style: UIHelper.colorStyle("#FF3366", dpr * 11) }).setOrigin(0, 0.5);
    this.limitText = new BBCodeText(this.scene, 0, 0, "", UIHelper.colorStyle("#ff3366", dpr * 11)).setOrigin(0, 0.5);
    this.limitText.y = -2 * dpr;
    this.limitText.x = -5 * dpr;
    this.mNickName = this.scene.make.text({ x: -5 * this.dpr, y: -23 * this.dpr, style: UIHelper.colorStyle("#3399cc", 13 * dpr) }, false);
    this.mCoinIcon = this.scene.make.image({ x: -17 * this.dpr, y: 15 * this.dpr, key: UIAtlasName.uicommon, frame: "iv_coin" }, false);
    this.starImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_star_small_1" }).setOrigin(1, 0);
    this.starImg.x = - 12 * dpr;
    this.starImg.y = -this.height * 0.5 + 8 * dpr;
    this.starImg.visible = false;
    const priceBg = this.scene.make.image({ x: -5 * this.dpr, y: 15 * this.dpr, key: this.atals, frame: "price_border" }, false).setOrigin(0, 0.5);
    this.mPriceText = this.scene.make.text({ x: 2 * this.dpr, y: 16 * this.dpr, style: UIHelper.colorStyle("#996600", 13 * dpr) }).setOrigin(0, 0.5);
    this.mTagIcon = this.scene.make.image({ key: this.atals, frame: "tip_red", x: -86 * this.dpr, y: -34 * this.dpr }, false);
    this.add([this.mSelectBg, this.mBackground, this.mPropImage, this.starImg, this.limitText, this.mNickName, priceBg, this.mCoinIcon, this.mPriceText]);
    this.setSize(this.mBackground.displayWidth, this.mBackground.displayHeight);
    this.mSelectBg.visible = false;
  }

  setProp(data: IMarketCommodity, currency: ICurrencyLevel) {
    this.currency = currency;
    this.mProp = data;
    const item = data["item"];
    if (data.icon) {
      const url = Url.getOsdRes(data.icon);
      this.mPropImage.load(url, this, this.onPropLoadComplete);
    } else {
      Logger.getInstance().error(`${data.name} : ${data.id} icon value is empty`);
    }
    let nickname = data.shortName || data.name;
    nickname = this.getNickNameText(nickname);
    this.mNickName.setText(nickname);
    this.mPriceText.setText(data.price[0].price.toString());
    const coinIcon = Coin.getIcon(data.price[0].coinType);
    this.mCoinIcon.setFrame(coinIcon);
    if (item.grade > 0) {
      this.starImg.visible = true;
      const starFrame = "bag_star_small_" + item.grade;
      this.starImg.setFrame(starFrame);
    } else this.starImg.visible = false;
    const limit = data.limit || 0;
    if (data.marketName === "shop") {
      if (currency.level >= limit) {
        this.limitText.visible = false;
      } else {
        this.limitText.visible = true;
        this.limitText.text = `lv${limit}` + i18n.t("market.unlock");
      }
    } else if (data.marketName === "gradeshop") {
      this.limitText.visible = true;
      if (currency.reputationLv < limit) {
        this.limitText.text = `${i18n.t("common.reputation")}:${limit}` + i18n.t("market.unlock");
        return;
      }
      data.buyedCount = data.buyedCount || 0;
      if (data.limitType === 1) {
        const color = data.buyedCount === data.limitCount ? "#ff3366" : "#000000";
        this.limitText.text = `${i18n.t("market.daylimit")}: [color=${color}]${data.limitCount - data.buyedCount}/${data.limitCount}[/color]`;
      } else if (data.limitType === 2) {
        const color = data.buyedCount === data.limitCount ? "#ff3366" : "#000000";
        this.limitText.text = `${i18n.t("market.weeklimit")}: [color=${color}]${data.limitCount - data.buyedCount}/${data.limitCount}[/color]`;
      } else {
        this.limitText.visible = false;
      }
    } else {
      this.limitText.visible = false;
    }

  }

  private onPropLoadComplete() {
    if (this.mPropImage) {
      const texture = this.mPropImage.texture;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    }
  }

  private onPointerUpHandler() {
    this.emit("select", this.mProp);
  }
  private getNickNameText(nickname: string) {
    if (nickname.length > 4) {
      const maxWidth = 50 * this.dpr;
      for (let i = 4; i < nickname.length; i++) {
        let text = nickname.slice(0, i);
        const width = this.mNickName.setText(text).width;
        if (width > maxWidth) {
          text += "...";
          nickname = text;
          break;
        }
      }
    }
    return nickname;
  }
  set select(value) {
    this.mSelectBg.visible = value;
  }
}
