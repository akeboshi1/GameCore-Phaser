import { NumberCounter } from "./NumberCounter";
import { op_client, op_def } from "pixelpai_proto";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
import { Logger } from "../../utils/log";
import { DetailDisplay } from "./DetailDisplay";

export class ElementDetail extends Phaser.GameObjects.Container {
  private mBackground: Phaser.GameObjects.Image;
  private mCounter: NumberCounter;
  private mBuyBtn: NinePatchButton;
  private mNickNameBg: Phaser.GameObjects.Image;
  private mNickName: Phaser.GameObjects.Text;
  private mDetailBubble: Phaser.GameObjects.Image;
  private mDesText: Phaser.GameObjects.Text;
  private mSelectedProp: op_client.IMarketCommodity;
  private mPriceIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private mDetailDisplay: DetailDisplay;
  private readonly key: string;
  constructor(scene: Phaser.Scene, $key: string, ) {
    super(scene);
    this.key = $key;

    this.setPosition(0, 250);

    this.mBackground = this.scene.make.image({
      x: this.scene.cameras.main.width >> 1,
      key: this.key,
      frame: "bg.png"
    });
    this.mBackground.y = (this.mBackground.height >> 1) - 50;

    this.mCounter = new NumberCounter(this.scene, $key, 360, 700);

    this.mBuyBtn = new NinePatchButton(this.scene, 880, 700, 328, 164, this.key, "yellow_button", i18n.t("market.buy_button"), {
      left: 36,
      top: 34,
      right: 20,
      bottom: 24
    });
    this.mBuyBtn.setTextStyle({
      color: "#976400",
      font: "bold 48px YaHei"
    });
    this.mBuyBtn.setTextOffset(0, 33);
    this.mBuyBtn.on("pointerup", this.onBuyHandler, this);

    this.mNickNameBg = this.scene.make.image({
      x: 360,
      y: 580,
      key: this.key,
      frame: "name_bg.png"
    }, false);

    this.mNickName = this.scene.make.text({
      x: 360,
      y: 580,
      text: "小黄鸭奶油小食棚",
      style: {
        font: "42px YaHei",
        align: "center"
      }
    }).setOrigin(0.5);

    this.mDetailBubble = this.scene.make.image({
      x: 830,
      y: 330,
      key: this.key,
      frame: "detail_bubble.png"
    }, false);

    this.mDesText = this.scene.make.text({
      x: 720,
      y: 185,
      style: {
        font: "40px",
        wordWrap: {
          width: 260,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mPriceIcon = this.scene.make.image({
      x: -55,
      y: -30,
      key: this.key,
      frame: "tuding_icon.png"
    }, false);
    this.mPriceText = this.scene.make.text({
      x: -30,
      y: -56,
      style: {
        font: "40px YaHei"
      }
    });

    this.mSource = this.scene.make.text({
      x: 710,
      y: 440,
      style: {
        font: "32px"
      }
    }, false);

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.x = 360;
    this.mDetailDisplay.y = 350;

    this.add([this.mBackground, this.mDetailDisplay, this.mCounter, this.mBuyBtn, this.mNickNameBg, this.mNickName, this.mDetailBubble, this.mDesText, this.mSource]);
    this.mBuyBtn.add([this.mPriceIcon, this.mPriceText]);

    this.addActionListener();
  }

  resize(w: number, h: number) {
    const scale = this.scene.cameras.main.height / 1920;
    const width = (this.scene.cameras.main.width / scale);
    const height = ((this.scene.cameras.main.height / scale) >> 1) - 150;
    this.mBackground.x = this.scene.cameras.main.centerX / scale;
    this.setSize(width, height);

    this.setInteractive(new Phaser.Geom.Rectangle(width >> 1, height >> 1, width, height), Phaser.Geom.Rectangle.Contains);

    // test interactive
    // const graphics = this.scene.make.graphics(undefined, false);
    // graphics.fillStyle(0xFF9900, 0.5);
    // graphics.fillRect(0, 0, width, height);
    // this.add(graphics);

    this.mCounter.resize();
  }

  addActionListener() {
    this.mCounter.addActionListener();
    this.mCounter.on("change", this.onChangeCounterHandler, this);
    this.on("pointerup", this.onPointerUpHandler, this);
  }

  removeActionListener() {
    this.mCounter.removeActionListener();
    this.mCounter.off("change", this.onChangeCounterHandler, this);
    this.off("gameobjectup", this.onPointerUpHandler, this);
  }

  setProp(prop: op_client.IMarketCommodity) {
    this.mSelectedProp = prop;
    this.mNickName.setText(prop.name);
    this.mDesText.setText(prop.des);
    if (prop.price && prop.price.length > 0) {
      this.mPriceIcon.setTexture(this.key, "tuding_icon.png");
      this.mPriceText.setText(prop.price[0].price.toString());
    } else {
      this.mPriceText.setText("");
    }
    if (prop.source) {
      this.mSource.setText(`来源： ${prop.source}`);
    } else {
      this.mSource.setText("");
    }
    this.mCounter.setCounter(1);
  }

  setResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.mDetailDisplay.loadAvatar(content);
    } else {
      this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
    }
    // this.mDetailDisplay.loadDisplay(content.display || this.mSelectedProp.icon);
  }

  private onBuyHandler() {
    if (!this.mSelectedProp) {
      return;
    }
    const prop = op_def.OrderCommodities.create();
    prop.id = this.mSelectedProp.id;
    prop.quantity = this.mCounter.number;
    prop.category = this.mSelectedProp.category;
    this.emit("buyItem", prop);
  }

  private onChangeCounterHandler(num: number) {
    if (!this.mSelectedProp) {
      return;
    }
    if (!this.mSelectedProp.price || this.mSelectedProp.price.length < 1) {
      return;
    }
    this.mPriceText.setText((this.mSelectedProp.price[0].price * this.mCounter.number).toString());
  }

  private onPointerUpHandler() {
    this.emit("popItemCard", this.mSelectedProp);
  }

}
