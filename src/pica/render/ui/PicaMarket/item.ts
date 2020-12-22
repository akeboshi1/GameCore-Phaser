import { DynamicImage } from "gamecoreRender";
import { ModuleName } from "structure";
import { Coin, Font, Logger, Url } from "utils";

export class MarketItem extends Phaser.GameObjects.Container {
  private mBackground: Phaser.GameObjects.Image;
  private mBorder: Phaser.GameObjects.Image;
  private mPropImage: DynamicImage;
  private mNickName: Phaser.GameObjects.Text;
  private mCoinIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private mTagIcon: Phaser.GameObjects.Image;
  private mProp: any;// op_client.IMarketCommodity
  private zoom: number = 1;
  private readonly dpr: number;

  constructor(scene: Phaser.Scene, x, y, dpr, zoom) {
    super(scene, x, y);
    this.dpr = dpr;
    this.zoom = zoom;
    this.mBackground = this.scene.make.image({
      key: ModuleName.PICAMARKET_NAME,
      frame: "border"
    }, false).setOrigin(0);
    this.mBackground.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mBorder = this.scene.make.image({
      x: 3 * dpr,
      y: 3 * dpr,
      key: ModuleName.PICAMARKET_NAME,
      frame: "item_border"
    }, false).setOrigin(0);
    this.mBorder.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mPropImage = new DynamicImage(scene, 0, 0);
    this.mPropImage.scale = this.dpr / this.zoom;

    this.mNickName = this.scene.make.text({
      x: 62 * this.dpr,
      y: 6 * this.dpr,
      style: {
        fontSize: 13 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        color: "#3399cc"
      }
    }, false);

    this.mCoinIcon = this.scene.make.image({
      x: 45 * this.dpr,
      y: 40 * this.dpr,
      key: ModuleName.PICAMARKET_NAME,
    }, false).setOrigin(0);

    const priceBg = this.scene.make.image({
      x: 62 * this.dpr,
      y: 39 * this.dpr,
      key: ModuleName.PICAMARKET_NAME,
      frame: "price_border"
    }, false).setOrigin(0);

    this.mPriceText = this.scene.make.text({
      x: 92 * this.dpr,
      y: 49 * this.dpr,
      style: {
        fontSize: 13 * this.dpr,
        fontFamily: Font.NUMBER,
        color: "#996600"
      }
    }).setOrigin(0.5);

    this.mTagIcon = this.scene.make.image({
      key: ModuleName.PICAMARKET_NAME,
      frame: "tip_red",
      x: -86 * this.dpr,
      y: -34 * this.dpr
    }, false).setOrigin(0);

    this.add([this.mBackground, this.mBorder, this.mPropImage, this.mNickName, priceBg, this.mCoinIcon, this.mPriceText]);
    this.setSize(this.mBackground.displayWidth, this.mBackground.displayHeight);

  }

  setProp(content: any) {// op_client.IMarketCommodity
    this.mProp = content;
    if (content.icon) {
      const url = Url.getOsdRes(content.icon);
      this.mPropImage.load(url, this, this.onPropLoadComplete);
    } else {
      Logger.getInstance().error(`${content.name} : ${content.id} icon value is empty`);
    }
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
