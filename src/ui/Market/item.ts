import { op_def, op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Url, Coin } from "../../utils/resUtil";
import { Font } from "../../utils/font";

export class MarketItem extends Phaser.GameObjects.Container {
  private mBackground: Phaser.GameObjects.Image;
  private mBorder: Phaser.GameObjects.Image;
  private mPropImage: DynamicImage;
  private mNickName: Phaser.GameObjects.Text;
  private mCoinIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private mTagIcon: Phaser.GameObjects.Image;
  private mProp: op_client.IMarketCommodity;
  private readonly dpr: number;

  constructor(scene: Phaser.Scene, x, y, dpr, zoom) {
    super(scene, x, y);
    this.dpr = dpr;
    this.mBackground = this.scene.make.image({
      key: "market",
      frame: "border"
    }, false).setOrigin(0).setScale(zoom);

    this.mBorder = this.scene.make.image({
      x: 3 * dpr * zoom,
      y: 3 * dpr * zoom,
      key: "market",
      frame: "item_border"
    }, false).setOrigin(0).setScale(zoom);
    // this.mBorder.x = -42 * this.dpr;
    // this.mBorder.x = -this.mBackground.width / 2 + this.mBorder.width / 2 + (this.mBackground.height - this.mBorder.height / 2);
    // this.mBorder.x = -(this.mBackground.displayWidth - this.mBorder.displayWidth) / 2 + (this.mBackground.displayHeight - this.mBorder.displayHeight) / 2;
    this.mPropImage = new DynamicImage(scene, 0, 0);
    this.mPropImage.scale = this.dpr * zoom;

    this.mNickName = this.scene.make.text({
      x: 62 * this.dpr * zoom,
      y: 6 * this.dpr * zoom,
      style: {
        fontSize: 14 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        color: "#3399cc"
      }
    }, false);

    const priceBg = this.scene.make.image({
      x: 62 * this.dpr * zoom,
      y: 34 * this.dpr * zoom,
      // y: 17 * this.dpr,
      key: "market",
      frame: "price_border"
    }, false).setOrigin(0).setScale(zoom);
    // priceBg.y = this.mBorder.y + this.mBorder.displayHeight / 2 - priceBg.displayHeight / 2;

    this.mCoinIcon = this.scene.make.image({
      x: 48 * this.dpr * zoom,
      y: 35 * this.dpr * zoom,
      // y: 17 * this.dpr,
      key: "market",
      frame: "tuding_icon"
    }, false).setOrigin(0).setScale(zoom);
    // this.mCoinIcon.y = priceBg.y;

    this.mPriceText = this.scene.make.text({
      x: 92 * this.dpr * zoom,
      y: 44 * this.dpr * zoom,
      // y: 12 * this.dpr,
      style: {
        fontSize: 14 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        color: "#996600"
      }
    }).setOrigin(0.5);
    // this.mPriceText.y = this.mCoinIcon.y + this.mPriceText.displayHeight / 2;

    this.mTagIcon = this.scene.make.image({
      key: "market",
      frame: "tip_red",
      x: -86 * this.dpr,
      y: -34 * this.dpr
    }, false).setOrigin(0).setScale(zoom);

    this.add([this.mBackground, this.mBorder, this.mPropImage, this.mNickName, priceBg, this.mCoinIcon, this.mPriceText]);

    this.setSize(this.mBackground.displayWidth, this.mBackground.displayHeight);
    // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBackground.width, this.mBackground.height), Phaser.Geom.Rectangle.Contains);
    // this.on("pointerup", this.onPointerUpHandler, this);
  }

  setProp(content: op_client.IMarketCommodity) {
    this.mProp = content;
    this.mPropImage.load(Url.getOsdRes(content.icon), this, this.onPropLoadComplete);
    this.mPropImage.x = this.mBorder.x + this.mBorder.displayWidth / 2;
    this.mPropImage.y = this.mBorder.y + this.mBorder.displayHeight / 2;
    this.mNickName.setText(content.shortName || content.name);
    this.mPriceText.setText(content.price[0].price.toString());
    const coinIcon = Coin.getIcon(content.price[0].coinType);
    this.mCoinIcon.setFrame(coinIcon);
  }

  private onPropLoadComplete() {
    if (this.mPropImage) {
      const texture = this.mPropImage.texture;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

  private onPointerUpHandler() {
    this.emit("select", this.mProp);
  }
}
