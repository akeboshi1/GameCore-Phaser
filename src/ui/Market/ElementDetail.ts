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
  private mPriceContainer: Phaser.GameObjects.Container;
  private mNickName: Phaser.GameObjects.Text;
  private mDetailBubbleContainer: Phaser.GameObjects.Container;
  private mDetailBubble: Phaser.GameObjects.Graphics;
  private mDesText: Phaser.GameObjects.Text;
  private mSelectedProp: op_client.IMarketCommodity;
  private mPriceIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private mDetailDisplay: DetailDisplay;
  private readonly key: string;
  private readonly dpr: number;
  private readonly uiScale: number;
  constructor(scene: Phaser.Scene, world: WorldService, $key: string, dpr: number, uiScale?: number) {
    super(scene);
    this.key = $key;
    this.mWorld = world;
    this.uiScale = uiScale || 1;

    this.dpr = dpr;

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
    this.mBuyBtn = new NinePatchButton(this.scene, 440, 700, 81 * this.dpr, 41 * this.dpr, this.key, "yellow_button", i18n.t("market.buy_button"), {
      left: 14 * this.dpr,
      top: 14 * this.dpr,
      right: w - 2 - 14 * this.dpr,
      bottom: h - 2 - 14 * this.dpr
    });
    this.mBuyBtn.setTextStyle({
      color: "#976400",
      fontSize: 16 * this.dpr,
      fontFamily: Font.DEFULT_FONT
    });
    this.mBuyBtn.setFontStyle("bold");
    // this.mBuyBtn.setTextOffset(0, 10 * this.dpr);
    this.mBuyBtn.on("pointerup", this.onBuyHandler, this);

    // this.mNickNameContainer = this.scene.make.container(undefined, false);

    // this.mNickNameBg = this.scene.make.image({
    //   key: this.key,
    //   frame: "name_bg.png"
    // }, false);
    // this.mNickNameContainer.setSize(this.mNickNameBg.width, this.mNickNameBg.height);

    this.mNickName = this.scene.make.text({
      x: 7 * this.dpr,
      y: 9 * this.dpr,
      style: {
        fontSize: 12 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        color: "#FFFF00",
        align: "center"
      }
    });

    this.mPriceContainer = this.scene.make.container(undefined, false);
    this.mPriceIcon = this.scene.make.image({
      x: -78,
      key: this.key,
      frame: "tuding_icon.png"
    }, false);
    this.mPriceText = this.scene.make.text({
      x: 0,
      style: {
        fontSize: 14 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    const priceBg = this.scene.make.image({
      key: this.key,
      frame: "price_bg.png"
    });

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.scale = this.dpr;
    this.mDetailDisplay.y = 110 * this.dpr;

    const bubbleW = 110 * this.dpr;
    const bubbleH = 96 * this.dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);

    this.mDetailBubbleContainer = this.scene.make.container(undefined, false);
    this.mDetailBubbleContainer.setSize(bubbleW, bubbleH);

    this.mDesText = this.scene.make.text({
      x: 8 * this.dpr,
      y: 56 * this.dpr,
      style: {
        color: "#32347b",
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 90 * this.dpr,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mSource = this.scene.make.text({
      x: 8 * this.dpr,
      y: 38 * this.dpr,
      style: {
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);

    this.add([this.mBackground, this.mDetailDisplay, this.mPriceContainer, this.mCounter, this.mBuyBtn, this.mDetailBubbleContainer]);
    this.mDetailBubbleContainer.add([this.mDetailBubble, this.mNickName, this.mDesText, this.mSource]);
    this.mPriceContainer.add([priceBg, this.mPriceIcon, this.mPriceText]);
    // this.mNickNameContainer.add([this.mNickNameBg, this.mNickName]);

    this.addActionListener();
  }

  resize(w: number, h: number) {
    const width = (this.scene.cameras.main.width / this.uiScale);
    const height = ((this.scene.cameras.main.height / this.uiScale) >> 1) - 150;
    const centerX = this.scene.cameras.main.centerX / this.uiScale;
    this.mBackground.x = this.scene.cameras.main.centerX / this.uiScale;

    this.mBuyBtn.x = width - this.mBuyBtn.width / 2 - 10 * this.dpr;
    this.mBuyBtn.y = this.height - this.y - this.mBuyBtn.height / 2 - 12 * this.dpr;

    let counterX = this.mBuyBtn.x - this.mBuyBtn.width / 2 - this.mCounter.width / 2 -  20 * this.dpr;
    if (counterX < this.mCounter.width / 2 + 10) {
      counterX = this.mCounter.width / 2 + 10;
    }
    this.mCounter.x = counterX;
    this.mCounter.y = this.mBuyBtn.y;

    this.mDetailBubbleContainer.x = 10 * this.dpr;
    const endW = width - this.mCounter.x - this.mCounter.width / 2;
    if (this.mDetailBubbleContainer.width + this.mDetailBubbleContainer.x > endW) {
      const bubbleW = endW - 16 * this.dpr;
      this.mDesText.setWordWrapWidth(bubbleW - 10 * this.dpr, true);
      this.resizeDesBubble(bubbleW, this.mDetailBubbleContainer.height);
    }
    // this.mDetailBubbleContainer.y = this.height - this.y - this.mDetailBubbleContainer.height - 6 * this.dpr;

    this.mPriceContainer.x = this.mCounter.x;
    this.mPriceContainer.y = this.mCounter.y - 35 * this.dpr;

    this.mDetailDisplay.x = centerX;
    this.mDetailDisplay.y = (this.height - this.y) / 2;
    // this.mDetailBubbleContainer.y = this.mDetailDisplay.y;

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
    // this.mDetailDisplay.on("show", this.onShowDisplayHandler, this);
    this.on("pointerup", this.onPointerUpHandler, this);
  }

  removeActionListener() {
    if (!this.mCounter) {
      return;
    }
    this.mCounter.removeActionListener();
    this.mCounter.off("change", this.onChangeCounterHandler, this);
    // this.mDetailDisplay.off("show", this.onShowDisplayHandler, this);
    this.off("gameobjectup", this.onPointerUpHandler, this);
  }

  setProp(prop: op_client.IMarketCommodity) {
    this.mSelectedProp = prop;
    this.mNickName.setText(prop.shortName || prop.name);
    this.mDesText.setText(prop.des);
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
    this.resizeDesBubble();
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

  private resizeDesBubble(w?, h?) {
    // const bubbleW = 110 * this.dpr;
    if (w === undefined) w = this.mDetailBubbleContainer.width;
    const bubbleH = this.mDesText.height + 60 * this.dpr;
    if (w === this.mDetailBubbleContainer.width && bubbleH === this.mDetailBubbleContainer.height) {
      return;
    }
    this.mDetailBubble.clear();
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, w, bubbleH);

    this.mDetailBubbleContainer.setSize(w, bubbleH);
    this.mDetailBubbleContainer.y = this.height - this.y - this.mDetailBubbleContainer.height - 6 * this.dpr;
  }

  private onShowDisplayHandler(image: Phaser.GameObjects.Image) {
    if (!image) {
      return;
    }
    // this.mNickNameContainer.x = this.mDetailDisplay.x; // + this.mDetailDisplay.width / 2 - this.mNickNameContainer.width / 2;
    // let _y = this.mDetailDisplay.y + this.mDetailDisplay.height / 2 + this.mNickNameContainer.height / 2 + 45;
    // if (_y > this.mCounter.y - this.mNickNameContainer.height - 45) {
    //   _y = this.mCounter.y - this.mNickNameContainer.height - 45;
    // }
    // this.mNickNameContainer.y = _y;
  }

}
