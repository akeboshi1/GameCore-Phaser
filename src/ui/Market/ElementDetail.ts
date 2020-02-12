import { NumberCounter } from "./NumberCounter";
import { op_client, op_def } from "pixelpai_proto";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
import { Logger } from "../../utils/log";
import { DetailDisplay } from "./DetailDisplay";
import { Font } from "../../utils/font";
import { WorldService } from "../../game/world.service";

export class ElementDetail extends Phaser.GameObjects.Container {
  private mWorld: WorldService;
  private mBackground: Phaser.GameObjects.Image;
  private mCounter: NumberCounter;
  private mBuyBtn: NinePatchButton;
  private mNickNameContainer: Phaser.GameObjects.Container;
  private mNickNameBg: Phaser.GameObjects.Image;
  private mNickName: Phaser.GameObjects.Text;
  private mDetailBubbleContainer: Phaser.GameObjects.Container;
  private mDetailBubble: Phaser.GameObjects.Image;
  private mDesText: Phaser.GameObjects.Text;
  private mSelectedProp: op_client.IMarketCommodity;
  private mPriceIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private mDetailDisplay: DetailDisplay;
  private readonly key: string;
  private readonly dpr: number;
  constructor(scene: Phaser.Scene, world: WorldService, $key: string, ) {
    super(scene);
    this.key = $key;
    this.mWorld = world;

    this.dpr = Math.floor(window.devicePixelRatio || 1);

    this.setPosition(0, 0);

    this.mBackground = this.scene.make.image({
      x: this.scene.cameras.main.width >> 1,
      key: this.key,
      frame: "bg.png"
    });
    this.mBackground.y = (this.mBackground.height >> 1) + 43 * this.dpr;

    this.mCounter = new NumberCounter(this.scene, $key, 360, 700);

    const frame = this.scene.textures.getFrame(this.key, "yellow_button_normal");
    let w = 60;
    let h = 65;
    if (frame) {
      w = frame.width;
      h = frame.height;
    }
    this.mBuyBtn = new NinePatchButton(this.scene, 440, 700, 115 * this.dpr, 58 * this.dpr, this.key, "yellow_button", i18n.t("market.buy_button"), {
      left: 20 * this.dpr,
      top: 18 * this.dpr,
      right: w - 2 - 20 * this.dpr,
      bottom: h - 2 - 18 * this.dpr
    });
    this.mBuyBtn.setTextStyle({
      color: "#976400",
      fontSize: 20 * this.dpr,
      fontFamily: Font.DEFULT_FONT
    });
    this.mBuyBtn.setTextOffset(0, 10 * this.dpr);
    this.mBuyBtn.on("pointerup", this.onBuyHandler, this);

    this.mNickNameContainer = this.scene.make.container(undefined, false);

    this.mNickNameBg = this.scene.make.image({
      key: this.key,
      frame: "name_bg.png"
    }, false);
    this.mNickNameContainer.setSize(this.mNickNameBg.width, this.mNickNameBg.height);

    this.mNickName = this.scene.make.text({
      text: "",
      style: {
        fontSize: 15 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        align: "center"
      }
    }).setOrigin(0.5);

    this.mPriceIcon = this.scene.make.image({
      x: -78,
      y: -16 * this.dpr,
      key: this.key,
      frame: "tuding_icon.png"
    }, false);
    this.mPriceText = this.scene.make.text({
      x: 0,
      y: -16 * this.dpr,
      style: {
        fontSize: 14 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.scale = this.dpr * 2;
    this.mDetailDisplay.y = 110 * this.dpr;

    this.mDetailBubble = this.scene.make.image({
      x: 0,
      y: 0,
      key: this.key,
      frame: "detail_bubble.png"
    }, false);

    this.mDetailBubbleContainer = this.scene.make.container({
      y: this.mDetailDisplay.y
    }, false);
    this.mDetailBubbleContainer.setSize(this.mDetailBubble.width, this.mDetailBubble.height);

    this.mDesText = this.scene.make.text({
      x: -(this.mDetailBubbleContainer.width >> 1) + 15 * this.dpr,
      y: -(this.mDetailBubbleContainer.height >> 1) + 10 * this.dpr,
      style: {
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 90 * this.dpr,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mSource = this.scene.make.text({
      x: -(this.mDetailBubbleContainer.width >> 1) + 40,
      y: (this.mDetailBubbleContainer.height >> 1) - 23 * this.dpr,
      style: {
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);

    this.add([this.mBackground, this.mDetailDisplay, this.mCounter, this.mBuyBtn, this.mNickNameContainer, this.mDetailBubbleContainer]);
    this.mDetailBubbleContainer.add([this.mDetailBubble, this.mDesText, this.mSource]);
    this.mBuyBtn.add([this.mPriceIcon, this.mPriceText]);
    this.mNickNameContainer.add([this.mNickNameBg, this.mNickName]);

    this.addActionListener();
  }

  resize(w: number, h: number) {
    const width = (this.scene.cameras.main.width );
    const height = ((this.scene.cameras.main.height) >> 1) - 150;
    const centerX = this.scene.cameras.main.centerX;
    this.mBackground.x = this.scene.cameras.main.centerX;

    this.mDetailBubbleContainer.x = centerX + this.mDetailBubbleContainer.width / 2 + 57 * this.dpr;

    this.mBuyBtn.x = width - this.mBuyBtn.width / 2 - 18 * this.dpr;
    this.mBuyBtn.y = this.height - this.y - this.mBuyBtn.height / 2 - 12 * this.dpr;

    let counterX = this.mBuyBtn.x - this.mBuyBtn.width / 2 - this.mCounter.width / 2 -  42 * this.dpr;
    if (counterX < this.mCounter.width / 2 + 10) {
      counterX = this.mCounter.width / 2 + 10;
    }
    this.mCounter.x = counterX;
    this.mCounter.y = this.mBuyBtn.y;
    this.mDetailDisplay.x = centerX;
    this.mDetailDisplay.y = (this.height - this.y) / 2;
    this.mDetailBubbleContainer.y = this.mDetailDisplay.y;

    const clickW = width * 0.8;
    const clickH = height * 0.7;
    this.setInteractive(new Phaser.Geom.Rectangle((width >> 1) + (width - clickW >> 1), height >> 1, clickW, clickH), Phaser.Geom.Rectangle.Contains);

    // test interactive
    // const graphics = this.scene.make.graphics(undefined, false);
    // graphics.fillStyle(0xFF9900, 0.5);
    // graphics.fillRect(width - clickW >> 1, 0, clickW, clickH);
    // this.add(graphics);

    this.mCounter.resize();
  }

  addActionListener() {
    if (!this.mCounter) {
      return;
    }
    this.mCounter.addActionListener();
    this.mCounter.on("change", this.onChangeCounterHandler, this);
    this.mDetailDisplay.on("show", this.onShowDisplayHandler, this);
    this.on("pointerup", this.onPointerUpHandler, this);
  }

  removeActionListener() {
    if (!this.mCounter) {
      return;
    }
    this.mCounter.removeActionListener();
    this.mCounter.off("change", this.onChangeCounterHandler, this);
    this.mDetailDisplay.off("show", this.onShowDisplayHandler, this);
    this.off("gameobjectup", this.onPointerUpHandler, this);
  }

  setProp(prop: op_client.IMarketCommodity) {
    this.mSelectedProp = prop;
    this.mNickName.setText(prop.shortName || prop.name);
    this.mDesText.setText(prop.des +  "了速度法律上的肌肤螺丝钉解放螺丝钉解放少了几分了解丽江老君山辣鸡");
    if (prop.price && prop.price.length > 0) {
      this.mPriceIcon.setTexture(this.key, "tuding_icon.png");
      this.updatePrice(prop.price[0].price.toString());
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

  private updatePrice(price: string) {
    this.mPriceText.setText(price);
    this.mPriceIcon.x = this.mPriceText.x - this.mPriceText.width / 2 - 16 * this.dpr;
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
    this.updatePrice((this.mSelectedProp.price[0].price * this.mCounter.number).toString());
  }

  private onPointerUpHandler() {
    this.emit("popItemCard", this.mSelectedProp, this.mDetailDisplay.display);
    this.mCounter.setBlur();
  }

  private onShowDisplayHandler(image: Phaser.GameObjects.Image) {
    if (!image) {
      return;
    }
    this.mNickNameContainer.x = this.mDetailDisplay.x; // + this.mDetailDisplay.width / 2 - this.mNickNameContainer.width / 2;
    let _y = this.mDetailDisplay.y + this.mDetailDisplay.height / 2 + this.mNickNameContainer.height / 2 + 45;
    if (_y > this.mCounter.y - this.mNickNameContainer.height - 45) {
      _y = this.mCounter.y - this.mNickNameContainer.height - 45;
    }
    this.mNickNameContainer.y = _y;
  }

}
