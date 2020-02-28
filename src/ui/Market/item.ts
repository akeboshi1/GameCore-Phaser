import { op_def, op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Url } from "../../utils/resUtil";
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

  constructor(scene: Phaser.Scene, x, y, dpr) {
    super(scene, x, y);
    this.dpr = dpr;
    this.mBackground = this.scene.make.image({
      key: "market",
      frame: "border.png"
    }, false);

    this.mBorder = this.scene.make.image({
      key: "market",
      frame: "item_border.png"
    }, false);
    // this.mBorder.x = -42 * this.dpr;
    // this.mBorder.x = -this.mBackground.width / 2 + this.mBorder.width / 2 + (this.mBackground.height - this.mBorder.height / 2);
    this.mBorder.x = -(this.mBackground.width - this.mBorder.width) / 2 + (this.mBackground.height - this.mBorder.height) / 2;
    this.mPropImage = new DynamicImage(scene, 0, 0);
    this.mPropImage.scale = this.dpr;

    this.mNickName = this.scene.make.text({
      y: -30 * this.dpr,
      style: {
        fontSize: 14 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        color: "#3399cc"
      }
    }, false);

    const priceBg = this.scene.make.image({
      x: 25 * this.dpr,
      // y: 17 * this.dpr,
      key: "market",
      frame: "price_border.png"
    }, false);
    priceBg.y = this.mBorder.y + this.mBorder.height / 2 - priceBg.height / 2;

    this.mCoinIcon = this.scene.make.image({
      x: -15 * this.dpr,
      // y: 17 * this.dpr,
      key: "market",
      frame: "tuding_icon.png"
    }, false);
    this.mCoinIcon.y = priceBg.y;

    this.mPriceText = this.scene.make.text({
      x: 1 * this.dpr,
      // y: 12 * this.dpr,
      style: {
        fontSize: 14 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        color: "#996600"
      }
    });
    this.mPriceText.y = this.mCoinIcon.y - this.mPriceText.height / 2;

    this.mTagIcon = this.scene.make.image({
      key: "market",
      frame: "tip_red.png",
      x: -86 * this.dpr,
      y: -34 * this.dpr
    }, false);

    this.add([this.mBackground, this.mBorder, this.mPropImage, this.mNickName, priceBg, this.mCoinIcon, this.mPriceText]);

    this.setSize(this.mBackground.width, this.mBackground.height);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBackground.width, this.mBackground.height), Phaser.Geom.Rectangle.Contains);
    this.on("pointerup", this.onPointerUpHandler, this);
  }

  setProp(content: op_client.IMarketCommodity) {
    this.mProp = content;
    this.mPropImage.load(Url.getOsdRes(content.icon));
    this.mPropImage.x = this.mBorder.x;
    this.mPropImage.y = this.mBorder.y;
    this.mNickName.setText(content.shortName || content.name);
    this.mPriceText.setText(content.price[0].price.toString());
  }

  private onPointerUpHandler() {
    this.emit("select", this.mProp);
  }
}
