import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
import { DetailDisplay } from "../Market/DetailDisplay";
import { Font } from "../../utils/font";
import { op_client, op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { CheckboxGroup } from "../components/checkbox.group";
import { TextButton } from "../Market/TextButton";
import { Logger } from "../../utils/log";
import { Url } from "../../utils/resUtil";

export class FurniBagPanel extends Panel {
  private key: string = "furni_bag";
  private mTiltle: Phaser.GameObjects.Text;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mBackground: Phaser.GameObjects.Graphics;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mSelectedElement: SelectedElement;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mCategeoriesContainer: Phaser.GameObjects.Container;
  private mPropsContainer: Phaser.GameObjects.Container;
  private mAdd: NinePatchButton;
  private mItems: Item[];
  private mCategeories: TextButton[];
  private mBg: Phaser.GameObjects.Image;

  private mDetailBubble: DetailBubble;

  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    this.mItems = [];
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width / this.scale;
    const height = this.scene.cameras.main.height / this.scale;
    super.resize(width, height);
    this.mBackground.clear();
    this.mBackground.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackground.fillRect(0, 0, width, height);

    this.mShelfContainer.setSize(width, 277 * this.dpr * this.scale);
    this.mShelfContainer.y = height - this.mShelfContainer.height;

    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x33ccff);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x00cccc);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);
    this.mCategeoriesContainer.setSize(width, 43 * this.dpr);

    this.mPropsContainer.y = 7 * this.dpr * this.mCategeoriesContainer.height;

    this.mBg.x = width / 2;
    this.mBg.y = this.mBg.height / 2 + 48 * this.dpr;

    this.mTiltle.x = width / 2;

    this.mAdd.x = width - this.mAdd.width / 2 - 20 * this.dpr;
    this.mAdd.y = this.mShelfContainer.y - this.mAdd.height / 2 - 9 * this.dpr;
  }

  setCategories(subcategorys: op_def.IStrMap[]) {
    const group = new CheckboxGroup();
    const capW = 56 * this.dpr;
    const capH = 41 * this.dpr;
    this.mCategeories = [];
    for (let i = 0; i < subcategorys.length; i++) {
      const textBtn = new TextButton(this.scene, subcategorys[i].value, i * capW + capW / 2 , capH / 2);
      textBtn.setData("category", subcategorys[i]);
      textBtn.setSize(capW, capH);
      textBtn.setFontSize(15 * this.dpr);
      this.mCategeories[i] = textBtn;
    }
    this.mCategeoriesContainer.add(this.mCategeories);
    group.appendItemAll(this.mCategeories);
    group.on("selected", this.onSelectSubCategoryHandler, this);
    group.selectIndex(0);
  }

  public setProp(props: op_client.ICountablePackageItem[]) {
    for (const item of this.mItems) {
      item.destroy();
    }
    for (let i = 0; i < props.length; i++) {
      const item = new Item(this.scene, Math.floor(i / 4) * (57 * this.dpr) + (35 * this.dpr), Math.floor(i % 3) * (57 * this.dpr), this.key, this.dpr);
      item.setProp(props[i]);
      item.on("select", this.onSelectItemHandler, this);
      this.mItems[i] = item;
    }
    this.mPropsContainer.add(this.mItems);
  }

  protected preload() {
    this.addAtlas(this.key, "furni_bag/furni_bag.png", "furni_bag/furni_bag.json");
    super.preload();
  }

  protected init() {
    this.mBackground = this.scene.make.graphics(undefined, false);

    this.mBg =this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false);

    this.mSelectedElement = new SelectedElement(this.scene, this.key, this.dpr);
    this.mShelfContainer = this.scene.make.container(undefined, false);
    this.mPropsContainer = this.scene.make.container(undefined, false);
    this.mCategeoriesContainer = this.scene.make.container(undefined, false);

    this.mCategoriesBar = this.scene.make.graphics(undefined, false);

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow.png",
      x: 21 * this.dpr,
      y: 30 * this.dpr
    }).setInteractive();

    this.mTiltle = this.scene.make.text({
      text: i18n.t("furni_bag.furni"),
      y: 30 * this.dpr,
      style: {
        fontSize: 36 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    const frame = this.scene.textures.getFrame(this.key, "yellow_btn_normal");
    this.mAdd = new NinePatchButton(this.scene, 0, 0, 80 * this.dpr, 40 * this.dpr, this.key, "yellow_btn", i18n.t("furni_bag.add"), {
      left: 14 * this.dpr,
      top: 14 * this.dpr,
      right: frame.width - 2 - 14 * this.dpr,
      bottom: frame.height - 2 - 14 * this.dpr
    });
    this.mAdd.setTextStyle({
      color: "#976400",
      fontSize: 16 * this.dpr * this.scale,
      fontFamily: Font.DEFULT_FONT
    });
    this.mAdd.setFontStyle("bold");
    // this.mAdd.on("pointerup", this.onBuyHandler, this);

    this.mDetailBubble = new DetailBubble(this.scene, this.key, this.dpr);

    this.add([this.mBackground, this.mBg, this.mTiltle, this.mCloseBtn, this.mSelectedElement, this.mDetailBubble, this.mAdd, this.mShelfContainer]);
    this.mShelfContainer.add([this.mCategeoriesContainer, this.mPropsContainer]);
    this.mCategeoriesContainer.add(this.mCategoriesBar);
    super.init();

    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.emit("getCategories");

    this.resize(0, 0);
  }

  private onSelectSubCategoryHandler(gameobject: Phaser.GameObjects.GameObject) {
    const category: op_def.IStrMap = gameobject.getData("category");
    if (category) {
      this.emit("queryPackage", category.key);
    }
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onSelectItemHandler(prop: op_client.IMarketCommodity) {
    Logger.getInstance().log("=================>>>", prop);
  }
}

class DetailBubble extends Phaser.GameObjects.Container {
  private mDetailBubble: Phaser.GameObjects.Graphics;
  private mNickName: Phaser.GameObjects.Text;
  private mDesText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private dpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene);
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    const bubbleW = 110 * dpr;
    const bubbleH = 96 * dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);

    this.mDesText = this.scene.make.text({
      x: 8 * dpr,
      y: 56 * dpr,
      style: {
        color: "#32347b",
        fontSize: 10 * dpr,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 90 * dpr,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.mSource = this.scene.make.text({
      x: 8 * dpr,
      y: 38 * dpr,
      style: {
        fontSize: 10 * dpr,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);
  }

  setProp(prop): this {
    this.mNickName.setText(prop.shortName || prop.name);
    this.mDesText.setText(prop.des);
    if (prop.source) {
      this.mSource.setText(`来源： ${prop.source}`);
    } else {
      this.mSource.setText("");
    }
    this.resize();
    return this;
  }

  private resize(w?: number, h?: number) {
    if (w === undefined) w = this.width;
    const bubbleH = this.mDesText.height + 60 * this.dpr;
    if (w === this.width && bubbleH === this.height) {
      return;
    }
    this.mDetailBubble.clear();
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, w, bubbleH);

    this.setSize(w, bubbleH);
    // this.mDetailBubbleContainer.y = this.height - this.y - this.mDetailBubbleContainer.height - 6 * this.dpr;
  }
}

class SelectedElement extends Phaser.GameObjects.Container {
  private mDetailDisplay: DetailDisplay;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene, dpr);
  }

  setResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.mDetailDisplay.loadAvatar(content);
    } else {
      // this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
    }
    // this.mDetailDisplay.loadDisplay(content.display || this.mSelectedProp.icon);
  }
}

class Item extends Phaser.GameObjects.Container {
  private mCounter: Phaser.GameObjects.Text;
  private mPropImage: DynamicImage;
  private mProp: op_client.ICountablePackageItem;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number) {
    super(scene, x, y);

    const background = scene.make.image({
      key,
      frame: "prop_bg.png"
    }, false);

    this.mPropImage = new DynamicImage(this.scene, 0, 0);

    this.mCounter = scene.make.text({
      style: {
        fontSize: 12 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false);
    this.add([background, this.mPropImage]);

    this.setSize(background.width, background.height);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, background.width, background.height), Phaser.Geom.Rectangle.Contains);
    this.emit("pointer", this.onSelectedHandler, this);
  }

  setProp(prop: op_client.ICountablePackageItem) {
    this.mProp = prop;
    this.mPropImage.load(Url.getOsdRes(prop.display.texturePath));
    if (prop.count > 1) {
      this.mCounter.setText(prop.count.toString());
      this.add(this.mCounter);
    }
  }

  private onSelectedHandler() {
    this.emit("select", this.mProp);
  }
}
