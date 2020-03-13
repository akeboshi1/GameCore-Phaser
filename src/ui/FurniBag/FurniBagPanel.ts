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
import { Url } from "../../utils/resUtil";
import { LabelInput } from "../components/label.input";

export class FurniBagPanel extends Panel {
  private key: string = "furni_bag";
  private mTiltle: Phaser.GameObjects.Text;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mBackground: Phaser.GameObjects.Graphics;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mCategeoriesContainer: Phaser.GameObjects.Container;
  private mPropsContainer: Phaser.GameObjects.Container;
  private mDetailDisplay: DetailDisplay;
  private mAdd: NinePatchButton;
  private mItems: Item[];
  private mCategeories: TextButton[];
  private mBg: Phaser.GameObjects.Image;
  private mSeachInput: SeachInput;
  private mSelectedCategory: op_def.IStrMap;
  private mSelectedFurni: op_client.ICountablePackageItem;

  private mDetailBubble: DetailBubble;
  private mSceneType: op_def.SceneTypeEnum;

  constructor(scene: Phaser.Scene, world: WorldService, sceneType: op_def.SceneTypeEnum) {
    super(scene, world);
    this.mSceneType = sceneType;
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
    this.mSeachInput.y = 20 * this.dpr;

    this.mPropsContainer.y = 7 * this.dpr + this.mCategeoriesContainer.height;

    this.mBg.x = width / 2;
    this.mBg.y = this.mBg.height / 2 + 48 * this.dpr;

    this.mTiltle.x = width / 2;

    this.mAdd.x = width - this.mAdd.width / 2 - 20 * this.dpr;
    this.mAdd.y = this.mShelfContainer.y - this.mAdd.height / 2 - 9 * this.dpr;

    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = this.mBg.y;

    this.setSize(width, height);
    // this.setInteractive(new Phaser.Geom.Rectangle(width / 2, height / 2, width, height), Phaser.Geom.Rectangle.Contains);
  }

  setCategories(subcategorys: op_def.IStrMap[]) {
    const group = new CheckboxGroup();
    const capW = 56 * this.dpr;
    const capH = 41 * this.dpr;
    this.mSelectedCategory = null;
    this.mCategeories = [];
    const _x = this.mSeachInput.x; // + this.mSeachInput.width / 2 + 6 * this.dpr;
    for (let i = 0; i < subcategorys.length; i++) {
      const textBtn = new TextButton(this.scene, subcategorys[i].value, i * capW + capW / 2 + this.mSeachInput.x + _x , capH / 2);
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
    this.mSelectedFurni = null;
    for (const item of this.mItems) {
      item.destroy();
    }
    if (!props || props.length < 1) {
      return;
    }
    for (let i = 0; i < props.length; i++) {
      const item = new Item(this.scene, Math.floor(i / 4) * (57 * this.dpr) + (35 * this.dpr), Math.floor(i % 4) * (57 * this.dpr) + 25 * this.dpr, this.key, this.dpr);
      item.setProp(props[i]);
      item.on("select", this.onSelectItemHandler, this);
      this.mItems[i] = item;
    }
    this.mPropsContainer.add(this.mItems);
    this.setSelectedItem(props[0]);
  }

  public setSelectedResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE) {
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.mDetailDisplay.loadAvatar(content);
    } else {
      // this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
    }
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

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.y = this.mBg.y + this.mBg.height / 2;

    this.mDetailBubble = new DetailBubble(this.scene, this.key, this.dpr);
    this.mDetailBubble.x = 10 * this.dpr;
    this.mDetailDisplay.scale = this.mWorld.scaleRatio;

    this.mSeachInput = new SeachInput(this.scene, this.key, this.dpr);
    this.mSeachInput.x = this.mSeachInput.width / 2 + 6 * this.dpr;

    this.add([this.mBackground, this.mBg, this.mTiltle, this.mCloseBtn, this.mDetailDisplay, this.mDetailBubble, this.mShelfContainer]);
    this.mShelfContainer.add([this.mCategeoriesContainer, this.mPropsContainer]);
    this.mCategeoriesContainer.add([this.mCategoriesBar, this.mSeachInput]);
    if (this.mSceneType === op_def.SceneTypeEnum.EDIT_SCENE_TYPE) {
      this.add(this.mAdd);
    }
    super.init();

    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachInput.on("seach", this.onSeachHandler, this);
    this.mAdd.on("pointerup", this.onAddFurniToSceneHandler, this);
    this.emit("getCategories");

    this.resize(0, 0);
  }

  private setSelectedItem(prop: op_client.ICountablePackageItem) {
    if (!prop) {
      return;
    }
    this.mSelectedFurni = prop;
    this.emit("queryPropResource", prop);
    this.mDetailBubble.setProp(prop);
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
  }

  private onSelectSubCategoryHandler(gameobject: Phaser.GameObjects.GameObject) {
    const category: op_def.IStrMap = gameobject.getData("category");
    if (category) {
      this.mSelectedCategory = category;
      this.emit("queryPackage", category.key);
    }
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onSelectItemHandler(prop: op_client.ICountablePackageItem) {
    this.setSelectedItem(prop);
  }

  private onSeachHandler(val: string) {
    if (this.mSelectedCategory) {
      this.emit("seachPackage", val, this.mSelectedCategory.key);
    }
  }

  private onAddFurniToSceneHandler() {
    if (!this.mSelectedFurni) {
      return;
    }
    this.emit("addFurniToScene", this.mSelectedFurni.id);
  }
}

class SeachInput extends Phaser.GameObjects.Container {
  private mSeachBtn: Phaser.GameObjects.Image;
  private mLabelInput: LabelInput;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene);

    const bg = scene.make.image({
      key,
      frame: "seach_bg.png"
    }, false);

    this.mLabelInput = new LabelInput(this.scene, {
      x: -10 * dpr,
      y: 0,
      width: 160,
      height: 60,
      fontSize: 14 * dpr + "px",
      color: "#666666",
    });

    this.mSeachBtn = scene.make.image({
      key,
      frame: "seach_normal.png"
    }, false).setInteractive();
    this.mSeachBtn.x = (bg.width - this.mSeachBtn.width) / 2 - 4 * dpr,
    this.add([bg, this.mLabelInput, this.mSeachBtn]);
    this.setSize(bg.width, bg.height);

    this.mSeachBtn.on("pointerup", this.onSeachHandler, this);
  }

  private onSeachHandler() {
    if (!this.mLabelInput.text) {
      return;
    }
    this.emit("seach", this.mLabelInput.text);
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
    this.dpr = dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    const bubbleW = 110 * dpr;
    const bubbleH = 96 * dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);

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
    this.add([this.mDetailBubble, this.mNickName, this.mDesText, this.mSource]);
    this.setSize(bubbleW, bubbleH);
  }

  setProp(prop: op_client.ICountablePackageItem): this {
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
    this.mPropImage.scale = dpr;

    this.mCounter = scene.make.text({
      x: background.width / 2 - 4 * dpr,
      y: background.height / 2 - 4 * dpr,
      style: {
        fontSize: 12 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(1);
    this.add([background, this.mPropImage]);

    this.setSize(background.width, background.height);
    this.setInteractive(new Phaser.Geom.Rectangle(0, 0, background.width, background.height), Phaser.Geom.Rectangle.Contains);
    this.on("pointerup", this.onSelectedHandler, this);
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
