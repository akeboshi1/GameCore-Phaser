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

  constructor(scene: Phaser.Scene, x, y) {
    super(scene, x, y);
    this.dpr = window.devicePixelRatio;
    this.mBackground = this.scene.make.image({
      key: "market",
      frame: "border.png"
    }, false);

    this.mBorder = this.scene.make.image({
      key: "market",
      frame: "item_border.png"
    }, false);
    this.mBorder.x = -37 * this.dpr;
    this.mPropImage = new DynamicImage(scene, 0, 0);
    this.mPropImage.scale = window.devicePixelRatio;

    this.mNickName = this.scene.make.text({
      y: -24 * this.dpr,
      style: {
        fontSize: 12 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        color: "#3399cc"
      }
    }, false);

    const priceBg = this.scene.make.image({
      x: 25 * this.dpr,
      y: 17 * this.dpr,
      key: "market",
      frame: "price_bg.png"
    }, false);

    this.mCoinIcon = this.scene.make.image({
      x: -15 * this.dpr,
      y: 17 * this.dpr,
      key: "market",
      frame: "tuding_icon.png"
    }, false);

    this.mPriceText = this.scene.make.text({
      x: 1 * this.dpr,
      y: 12 * this.dpr,
      style: {
        fontSize: 12 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        color: "#996600"
      }
    });

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