import { DetailDisplay } from "./DetailDisplay";
import { NineSliceButton, ClickEvent, BBCodeText, NineSlicePatch } from "apowophaserui";
import { Render } from "gamecoreRender";
import { NumberCounter } from "./NumberCounter";
import { Coin, Font, i18n } from "utils";
import { UIAtlasKey } from "picaRes";

export class ElementDetail extends Phaser.GameObjects.Container {
  private mCounter: NumberCounter;
  private mBuyBtn: NineSliceButton;
  private mPriceContainer: Phaser.GameObjects.Container;
  private mDetailBubble: DetailBubble;
  private mSelectedProp: any;// op_client.IMarketCommodity
  private mPriceIcon: Phaser.GameObjects.Image;
  private mPriceText: Phaser.GameObjects.Text;
  private mDetailDisplay: DetailDisplay;
  private readonly key: string;
  private readonly dpr: number;
  constructor(scene: Phaser.Scene, protected render: Render, $key: string, dpr: number) {
    super(scene);
    this.key = $key;
    this.dpr = dpr;

    this.setPosition(0, 0);
    this.mCounter = new NumberCounter(this.scene, $key, 360, 700, this.dpr, render.uiScale);
    const frame = this.scene.textures.getFrame(this.key, "yellow_button_normal");
    let w = 60;
    let h = 65;
    if (frame) {
      w = frame.width;
      h = frame.height;
    }
    this.mBuyBtn = new NineSliceButton(this.scene, 440, 700, 81 * this.dpr, 41 * this.dpr, this.key, "yellow_button", i18n.t("common.buy"), this.dpr, this.scale, {
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
    this.mBuyBtn.on(String(ClickEvent.Tap), this.onBuyHandler, this);
    this.mPriceContainer = this.scene.make.container(undefined, false);
    this.mPriceIcon = this.scene.make.image({
      x: -78,
      key: this.key,
      frame: "iv_coin"
    }, false);
    this.mPriceIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mPriceText = this.scene.make.text({
      x: 0,
      style: {
        fontSize: 14 * this.dpr,
        fontFamily: Font.NUMBER
      }
    }).setOrigin(0.5);

    const priceBg = this.scene.make.image({
      key: this.key,
      frame: "price_bg"
    });
    priceBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
    this.mDetailDisplay.scale = this.dpr / this.scale;
    this.mDetailDisplay.y = 110 * this.dpr;
    this.mDetailBubble = new DetailBubble(this.scene, this.key, this.dpr);
    this.mDetailBubble.x = 4 * this.dpr;
    this.mDetailBubble.y = 400 * this.dpr;
    this.add([this.mDetailDisplay, this.mPriceContainer, this.mCounter, this.mBuyBtn, this.mDetailBubble]);
    this.mPriceContainer.add([priceBg, this.mPriceIcon, this.mPriceText]);
    // this.mDetailBubble.visible = false;

    this.addActionListener();
  }

  resize(w: number, h: number) {
    const width = w;
    const height = h / 2 - 150;
    const centerX = w / 2;

    this.mBuyBtn.x = width - this.mBuyBtn.displayWidth / 2 - 10 * this.dpr;
    this.mBuyBtn.y = this.height - this.y - this.mBuyBtn.displayHeight / 2 - 12 * this.dpr;

    const counterX = this.mBuyBtn.x - this.mBuyBtn.displayWidth / 2 - this.mCounter.displayWidth / 2 - 17 * this.dpr;

    this.mCounter.x = counterX;
    this.mCounter.y = this.mBuyBtn.y;

    this.mDetailBubble.x = 4 * this.dpr;
    this.mDetailBubble.y = this.mCounter.y - 70 * this.dpr;
    this.mPriceContainer.x = this.mCounter.x;
    this.mPriceContainer.y = this.mCounter.y - 35 * this.dpr;

    this.mDetailDisplay.x = centerX;
    this.mDetailDisplay.y = (this.height - this.y) / 2;

    const clickW = width * 0.8;
    const clickH = height * 0.7;
    this.setInteractive(new Phaser.Geom.Rectangle((width >> 1) + (width - clickW >> 1), height >> 1, clickW, clickH), Phaser.Geom.Rectangle.Contains);
    this.mCounter.resize();
    this.mDetailBubble.visible = true;
  }

  addActionListener() {
    if (!this.mCounter) {
      return;
    }
    this.mCounter.addActionListener();
    this.mCounter.on("change", this.onChangeCounterHandler, this);
    this.on("pointerup", this.onPointerUpHandler, this);
  }

  removeActionListener() {
    if (!this.mCounter) {
      return;
    }
    this.mCounter.removeActionListener();
    this.mCounter.off("change", this.onChangeCounterHandler, this);
    this.off("gameobjectup", this.onPointerUpHandler, this);
  }

  setProp(prop: any) {// op_client.IMarketCommodity
    this.mSelectedProp = prop;
    if (prop.price && prop.price.length > 0) {
      this.mPriceIcon.setTexture(this.key, Coin.getIcon(prop.price[0].coinType));
      this.updatePrice(prop.price[0].price.toString());
    } else {
      this.mPriceText.setText("");
    }
    let property = null;
    this.render.mainPeer.getUserData_PlayerProperty()
      .then((val) => {
        property = val;
        return this.serviceTimestamp;
      })
      .then((t) => {
        this.mDetailBubble.setProp(prop, Math.floor(t / 1000), property);
        this.mDetailBubble.y = this.height - this.y - this.mDetailBubble.height - 6 * this.dpr;
        this.mCounter.setCounter(1);
      });
  }

  setResource(content: any) {
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.render.mainPeer.getPlayerAvatar()
        .then(({ avatar, suits }) => {
          for (const key in avatar) {
            if (avatar.hasOwnProperty(key)) {
              const element = avatar[key];
              if (element && !content.avatar[key]) content.avatar[key] = element;
            }
          }
          if (suits) {
            const newsuit = content.suits[0];
            for (const suit of suits) {
              if (suit.suit_type !== newsuit.suit_type) {
                content.suits.push(suit);
              }
            }
          }
          const offset = new Phaser.Geom.Point(0, 35 * 2);
          this.mDetailDisplay.loadAvatar(content, 2, offset);
        });
    } else {
      this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
    }
  }
  private get serviceTimestamp(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.render.mainPeer.requestCurTime().then((t) => {
        resolve(t);
      });
    });
  }
  private updatePrice(price: string) {
    this.mPriceText.setText(price);
    this.mPriceIcon.x = this.mPriceText.x - this.mPriceText.width / 2 - 16 * this.dpr;
  }

  private onBuyHandler() {
    if (!this.mSelectedProp) {
      return;
    }
    const prop = { id: null, quantity: null, category: null };// op_def.OrderCommodities.create()
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
    // this.emit("popItemCard", this.mSelectedProp, this.mDetailDisplay.display);
    this.mCounter.setBlur();
  }
}

class DetailBubble extends Phaser.GameObjects.Container {
  private dpr: number;
  private timeID: any;
  private tipsbg: NineSlicePatch;
  private tipsText: BBCodeText;
  private mExpires: BBCodeText;
  // private testText: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.dpr = dpr;
    const tipsWidth = 100 * dpr;
    const tipsHeight = 96 * dpr;
    this.setSize(tipsWidth, tipsHeight);
    this.tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, UIAtlasKey.common2Key, "tips_bg", {
      left: 10 * this.dpr,
      top: 10 * this.dpr,
      right: 10 * this.dpr,
      bottom: 10 * this.dpr
    }, undefined, undefined, 0.5);
    this.tipsbg.setPosition(tipsWidth * 0.5, tipsHeight * 0.5);
    this.tipsbg.alpha = 0.6;
    this.tipsText = new BBCodeText(this.scene, 7 * dpr, -tipsHeight + 60 * this.dpr, "", {
      color: "#333333",
      fontSize: 10 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
      lineSpacing: 6 * dpr,
      padding: {
        top: 2 * dpr
      }
    }).setOrigin(0);
    this.tipsText.setWrapMode("string");
    this.mExpires = new BBCodeText(scene, 7 * dpr, 85 * dpr, "", {
      fontSize: 10 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
    }).setOrigin(0);
    this.add([this.tipsbg, this.tipsText, this.mExpires]);
    this.tipsText.addImage("iv_coin", { key: UIAtlasKey.commonKey, frame: "iv_coin" });
    this.tipsText.addImage("iv_diamond", { key: UIAtlasKey.commonKey, frame: "iv_diamond" });
  }

  setProp(prop: any, servertime: number, property: any): this {// op_client.IMarketCommodity, PlayerProperty
    if (!prop) {
      this.tipsText.setText(i18n.t("furni_bag.empty_backpack"));
      this.mExpires.text = "";
      this.resize();
    } else {
      this.tipsText.setWrapWidth(undefined);
      const name = `[color=#32347b][b][size=${14 * this.dpr}]${prop.shortName || prop.name}[/size][/b][/color]`;
      // let price = "";
      // let source = "";
      let describle = "";
      let attri = "";
      let need = "";
      let tips = name + "\n";
      let maxWidth: number = 100 * this.dpr;
      // if (prop.price && prop.price.length > 0) {
      //   price = `${i18n.t("furni_bag.sale_price")}：[img=${Coin.getIcon(prop.price[0].coinType)}] x${prop.price[0].price}`;
      //   tips += `[color=#ff0000]${price}[/color]` + "\n";
      //   this.tipsText.text = price;
      //   maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      // }
      this.tipsText.text = tips;
      maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      // if (prop.source) {
      //   source = `${i18n.t("furni_bag.source")}：${prop.source}`;
      //   tips += `[color=#ffffff][size=${12 * this.dpr}]${source}[/size][/color]`;
      //   this.tipsText.text = source;
      //   maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      // }
      if (prop.des && prop.des !== "") {
        describle = prop.des;
        tips += "\n" + describle;
        this.tipsText.text = describle;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      let isline = false;
      if (prop.affectValues) {
        const len = prop.affectValues.length;
        for (let i = 0; i < len; i++) {
          const affect = prop.affectValues[i];
          if (property.propertiesMap.has(affect.key)) {
            const proper = property.propertiesMap.get(affect.key);
            const value = affect.value > 0 ? `[color=#ffff00]+${affect.value}[/color]` : `[color=#ff0000]${affect.value}[/color]`;
            attri += "\n" + `${proper.name}: ${value}`;
          }
        }
        if (attri.length > 0) {
          if (!isline) {
            isline = true;
            tips += "\n-- -- -- -- -- -- -- --";
          }
          tips += `\n[color=#ffffff]${i18n.t("furni_bag.properties")}[/color]` + `${attri}`;
        }
      }
      if (prop.requireValues) {
        const len = prop.requireValues.length;
        for (let i = 0; i < len; i++) {
          const require = prop.requireValues[i];
          if (property.propertiesMap.has(require.key)) {
            const proper = property.propertiesMap.get(require.key);
            const value = proper.value >= require.value ? `[color=#00ff00](${require.value})[/color]` : `[color=#00ff00](${require.value})[/color]`;
            need += `\n${proper.name}: ${value}`;
          }
        }
        if (need.length > 0) {
          if (!isline) {
            isline = true;
            tips += "\n-- -- -- -- -- -- -- --";
          }
          tips += `\n${i18n.t("furni_bag.needproper")}:${need}`;
        }
      }
      this.tipsText.setWrapWidth(maxWidth);
      this.tipsText.text = tips;
      this.width = maxWidth + 14 * this.dpr;
      // if (prop.expiredTime > 0) {
      //   if (!isline) {
      //     isline = true;
      //     tips += "\n-- -- -- -- -- -- -- --";
      //   }
      //   let interval = prop.expiredTime - servertime;
      //   const timeout = () => {
      //     (<any>this.mExpires).visible = true;
      //     this.mExpires.text = this.getDataFormat(interval * 1000);
      //     if (interval > 0) {
      //       this.timeID = setTimeout(() => {
      //         interval -= 1;
      //         timeout();
      //       }, 1000);
      //     } else {
      //       this.timeID = undefined;
      //     }
      //   };
      //   timeout();
      // } else {
      //   (<any>this.mExpires).visible = false;
      //   if (this.timeID) clearTimeout(this.timeID);
      // }
      this.resize();
    }
    return this;
  }
  private resize(w?: number, h?: number) {
    const mixheight: number = 96 * this.dpr;
    let height = this.tipsText.height;
    if ((<any>this.mExpires).visible) height += this.mExpires.height + 3 * this.dpr;
    height += 14 * this.dpr;
    height = height < mixheight ? mixheight : height;
    this.setSize(this.width, height);
    this.tipsbg.resize(this.width, this.height);
    this.tipsbg.x = this.width * 0.5;
    this.tipsbg.y = this.height * 0.5;
    this.tipsText.y = 7 * this.dpr;
    this.mExpires.y = this.tipsText.y + this.tipsText.height + 3 * this.dpr;

  }

  private getDataFormat(time: number) {
    const day = Math.floor(time / 86400000);
    const hour = Math.floor(time / 3600000) % 24;
    const minute = Math.floor(time / 60000) % 60;
    const second = Math.floor(time / 1000) % 60;
    let text = i18n.t("furni_bag.timelimit") + ":  ";
    if (day > 0) {
      const temptime = `${day}-${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    } else if (hour > 0 || minute > 0 || second > 0) {
      const temptime = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    } else {
      const temptime = `${i18n.t("furni_bag.expires")}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    }
    // else if (minute > 0) {
    //   const temptime = `${this.stringFormat(minute)}:${this.stringFormat(second)}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // } else if (second > 0) {
    //   const temptime = `${this.stringFormat(second)}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // }
    //  else {
    //   const temptime = `${i18n.t("furni_bag.expires")}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // }
    return text;
  }
  private stringFormat(num: number) {
    let str = num + "";
    if (str.length <= 1) {
      str = "0" + str;
    }
    return str;
  }

  private getComparTag(value: number) {
    let tag = "";
    switch (value) {
      case 1:
        tag = "=";
      case 2:
        tag = "!=";
      case 3:
        tag = "<=";
      case 4:
        tag = "<";
      case 5:
        tag = ">=";
      case 6:
        tag = ">";
      default:
        tag = "=";
    }
    return tag;
  }
}
