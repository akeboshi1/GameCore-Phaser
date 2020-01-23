import { op_def, op_client } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { Url } from "../../utils/resUtil";

export class MarketItem extends Phaser.GameObjects.Container {
  private mBackground: Phaser.GameObjects.Image;
  private mBorder: Phaser.GameObjects.Image;
  private mPropImage: DynamicImage;
  private mNickName: Phaser.GameObjects.Text;
  private mPriceText: Phaser.GameObjects.Text;
  private mUnlcokText: Phaser.GameObjects.Text;
  private mProp: op_client.IMarketCommodity;

  constructor(scene: Phaser.Scene, x, y) {
    super(scene, x, y);
    this.mBackground = this.scene.make.image({
      key: "market",
      frame: "border.png"
    }, false);

    this.mBorder = this.scene.make.image({
      key: "market",
      frame: "item_border.png"
    }, false);
    this.mBorder.x = -100;
    this.mPropImage = new DynamicImage(scene, 0, 0);

    this.mNickName = this.scene.make.text({
      y: -76,
      style: {
        font: "42px YaHei",
        color: "#3399cc"
      }
    }, false);

    this.mUnlcokText = this.scene.make.text({
      style: {
        font: "42px YaHei",
        color: "#FF0000"
      }
    });

    const priceBg = this.scene.make.image({
      x: 80,
      y: 40,
      key: "market",
      frame: "price_bg.png"
    }, false);

    this.mPriceText = this.scene.make.text({
      x: 16,
      y: 14,
      style: {
        font: "42px YaHei",
        color: "#996600"
      }
    });

    this.add([this.mBackground, this.mBorder, this.mPropImage, this.mNickName, this.mUnlcokText, priceBg, this.mPriceText]);

    // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, 385, 180), Phaser.Geom.Rectangle.Contains);

    this.setSize(this.mBackground.width, this.mBackground.height);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBackground.width, this.mBackground.height), Phaser.Geom.Rectangle.Contains);
    this.on("pointerup", this.onPointerUpHandler, this);
  }

  setProp(content: op_client.IMarketCommodity) {
    this.mProp = content;
    this.mPropImage.load(Url.getOsdRes(content.icon));
    this.mPropImage.x = this.mBorder.x;
    this.mPropImage.y = this.mBorder.y;
    this.mNickName.setText(content.name);
    this.mPriceText.setText(content.price[0].price.toString());
    // if (content.) {
    //   this.mUnlcokText.setText("");
    // } else {
    //   this.mUnlcokText.setText("");
    // }
  }

  private onPointerUpHandler() {
    this.emit("select", this.mProp);
  }
}
