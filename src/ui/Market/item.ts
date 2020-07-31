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
    this.mBackground.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mBorder = this.scene.make.image({
      x: 3 * dpr * zoom,
      y: 3 * dpr * zoom,
      key: "market",
      frame: "item_border"
    }, false).setOrigin(0).setScale(zoom);
    this.mBorder.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    // this.mBorder.x = -42 * this.dpr;
    // this.mBorder.x = -this.mBackground.width / 2 + this.mBorder.width / 2 + (this.mBackground.height - this.mBorder.height / 2);
    // this.mBorder.x = -(this.mBackground.displayWidth - this.mBorder.displayWidth) / 2 + (this.mBackground.displayHeight - this.mBorder.displayHeight) / 2;
    this.mPropImage = new DynamicImage(scene, 0, 0);
    this.mPropImage.scale = this.dpr * zoom;

    this.mNickName = this.scene.make.text({
      x: 62 * this.dpr * zoom,
      y: 6 * this.dpr * zoom,
      style: {
        fontSize: 13 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        color: "#3399cc"
      }
    }, false);

    this.mCoinIcon = this.scene.make.image({
      x: 45 * this.dpr * zoom,
      y: 40 * this.dpr * zoom,
      key: "market",
      frame: "tuding_icon"
    }, false).setOrigin(0).setScale(zoom);

    const priceBg = this.scene.make.image({
      x: 62 * this.dpr * zoom,
      y: 39 * this.dpr * zoom,
      key: "market",
      frame: "price_border"
    }, false).setOrigin(0).setScale(zoom);

    this.mPriceText = this.scene.make.text({
      x: 92 * this.dpr * zoom,
      y: 49 * this.dpr * zoom,
      style: {
        fontSize: 13 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        color: "#996600"
      }
    }).setOrigin(0.5);

    this.mTagIcon = this.scene.make.image({
      key: "market",
      frame: "tip_red",
      x: -86 * this.dpr,
      y: -34 * this.dpr
    }, false).setOrigin(0).setScale(zoom);

    this.add([this.mBackground, this.mBorder, this.mPropImage, this.mNickName, priceBg, this.mCoinIcon, this.mPriceText]);

    this.setSize(this.mBackground.displayWidth, this.mBackground.displayHeight);

  }

  setProp(content: op_client.IMarketCommodity) {
    this.mProp = content;
    this.mPropImage.load(Url.getOsdRes(content.icon), this, this.onPropLoadComplete);
    this.mPropImage.x = this.mBorder.x + this.mBorder.displayWidth / 2;
    this.mPropImage.y = this.mBorder.y + this.mBorder.displayHeight / 2;
    let nickname = content.shortName || content.name;

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
    this.mNickName.setText(nickname);
    this.mPriceText.setText(content.price[0].price.toString());
    const coinIcon = Coin.getIcon(content.price[0].coinType);
    this.mCoinIcon.setFrame(coinIcon);
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
}
