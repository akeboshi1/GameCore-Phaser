import { NumberCounter } from "./NumberCounter";
import { op_client, op_def } from "pixelpai_proto";
import { NineSliceButton } from "tooqingui";
import { i18n } from "../../i18n";
import { Logger } from "../../utils/log";
import { DetailDisplay } from "./DetailDisplay";
import { Font } from "../../utils/font";
import { WorldService } from "../../game/world.service";
import { Coin } from "../../utils/resUtil";

export class ElementDetail extends Phaser.GameObjects.Container {
  private mWorld: WorldService;
  private mCounter: NumberCounter;
  private mBuyBtn: NineSliceButton;
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

    // this.mBackground = this.scene.make.image({
    //   x: this.scene.cameras.main.width >> 1,
    //   key: this.key,
    //   frame: "bg"
    // });
    // this.mBackground.y = (this.mBackground.height >> 1) + 43 * this.dpr;

    this.mCounter = new NumberCounter(this.scene, $key, 360, 700, this.dpr, uiScale);

    const frame = this.scene.textures.getFrame(this.key, "yellow_button_normal");
    let w = 60;
    let h = 65;
    if (frame) {
      w = frame.width;
      h = frame.height;
    }
    this.mBuyBtn = new NineSliceButton(this.scene, 440, 700, 81 * this.dpr, 41 * this.dpr, this.key, "yellow_button", i18n.t("market.buy_button"), this.dpr, this.scale, {
      left: 14 * this.dpr,
      top: 14 * this.dpr,
      right: w - 2 - 14 * this.dpr,
      bottom: h - 2 - 14 * this.dpr
    }).setScale(uiScale);
    this.mBuyBtn.setTextStyle({
      color: "#976400",
      fontSize: 16 * this.dpr * uiScale,
      fontFamily: Font.DEFULT_FONT
    });
    this.mBuyBtn.setFontStyle("bold");
    // this.mBuyBtn.setTextOffset(0, 10 * this.dpr);
    this.mBuyBtn.on("pointerup", this.onBuyHandler, this);

    // this.mNickNameContainer = this.scene.make.container(undefined, false);

    // this.mNickNameBg = this.scene.make.image({
    //   key: this.key,
    //   frame: "name_bg"
    // }, false);
    // this.mNickNameContainer.setSize(this.mNickNameBg.width, this.mNickNameBg.height);

    this.mNickName = this.scene.make.text({
      x: 7 * this.dpr,
      y: 9 * this.dpr,
      style: {
        fontSize: 12 * this.dpr * uiScale,
        fontFamily: Font.DEFULT_FONT,
        color: "#FFFF00",
        align: "center"
      }
    });

    this.mPriceContainer = this.scene.make.container(undefined, false);
    this.mPriceIcon = this.scene.make.image({
      x: -78,
      key: this.key,
      frame: "iv_coin"
    }, false).setScale(uiScale);
    this.mPriceText = this.scene.make.text({
      x: 0,
      style: {
        fontSize: 14 * this.dpr * uiScale,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    const priceBg = this.scene.make.image({
      key: this.key,
      frame: "price_bg"
    }).setScale(uiScale);

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.scale = this.dpr;
    this.mDetailDisplay.y = 110 * this.dpr;

    const bubbleW = 110 * this.dpr * this.uiScale;
    const bubbleH = 96 * this.dpr * this.uiScale;
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
        fontSize: 10 * this.dpr * uiScale,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 90 * this.dpr * uiScale,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mSource = this.scene.make.text({
      x: 8 * this.dpr,
      y: 38 * this.dpr,
      style: {
        fontSize: 10 * this.dpr * uiScale,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);

    this.add([this.mDetailDisplay, this.mPriceContainer, this.mCounter, this.mBuyBtn, this.mDetailBubbleContainer]);
    this.mDetailBubbleContainer.add([this.mDetailBubble, this.mNickName, this.mDesText, this.mSource]);
    this.mPriceContainer.add([priceBg, this.mPriceIcon, this.mPriceText]);
    // this.mNickNameContainer.add([this.mNickNameBg, this.mNickName]);

    this.addActionListener();
  }

  resize(w: number, h: number) {
    const width = (this.scene.cameras.main.width);
    const height = ((this.scene.cameras.main.height) >> 1) - 150;
    const centerX = this.scene.cameras.main.centerX;

    this.mBuyBtn.x = width - this.mBuyBtn.displayWidth / 2 - 10 * this.dpr * this.uiScale;
    this.mBuyBtn.y = this.height - this.y - this.mBuyBtn.displayHeight / 2 - 12 * this.dpr * this.uiScale;

    const counterX = this.mBuyBtn.x - this.mBuyBtn.displayWidth / 2 - this.mCounter.displayWidth / 2 - 17 * this.dpr * this.uiScale;
    // if (counterX < this.mCounter.displayWidth / 2 + 10) {
    //   counterX = this.mCounter.displayWidth / 2 + 10;
    // }
    this.mCounter.x = counterX;
    this.mCounter.y = this.mBuyBtn.y;

    this.mDetailBubbleContainer.x = 10 * this.dpr;
    const endW = width - (width - this.mCounter.x) - this.mCounter.width / 2;
    if (this.mDetailBubbleContainer.displayWidth + this.mDetailBubbleContainer.x + 10 * this.dpr > endW) {
      const bubbleW = endW - 16 * this.dpr * this.uiScale;
      this.mDesText.setWordWrapWidth(bubbleW - 10 * this.dpr * this.uiScale, true);

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
      this.mPriceIcon.setTexture(this.key, Coin.getIcon(prop.price[0].coinType));
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
      const player = this.mWorld.roomManager.currentRoom.playerManager.actor;
      const avatar = player.model.avatar;
      for (const key in avatar) {
        if (avatar.hasOwnProperty(key)) {
          const element = avatar[key];
          if (element && !content.avatar[key]) content.avatar[key] = element;
        }
      }
      const offset = new Phaser.Geom.Point(0, 35 * 2);
      this.mDetailDisplay.loadAvatar(content, 2, offset);
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
    const bubbleH = this.mDesText.height + 60 * this.dpr * this.uiScale;
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
