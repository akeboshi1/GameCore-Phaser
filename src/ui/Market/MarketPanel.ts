import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Url } from "../../utils/resUtil";
import { ElementDetail } from "./ElementDetail";
import { i18n } from "../../i18n";
import { op_client, op_def } from "pixelpai_proto";
import { NinePatchButton } from "../components/ninepatch.button";
import { CheckboxGroup } from "../components/checkbox.group";
import { TextButton } from "./TextButton";
import { MarketItem } from "./item";
import { TabButton } from "../components/tab.button";
import { Font } from "../../utils/font";
import { Logger } from "../../utils/log";

export class MarketPanel extends Panel {
  private readonly key = "market";
  private mBackgroundColor: Phaser.GameObjects.Graphics;
  private mSelectItem: ElementDetail;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mTIle: Phaser.GameObjects.Text;
  private mTabs: NinePatchButton[];
  private mSubTabs: TextButton[];
  private mSelectedCategories: Phaser.GameObjects.GameObject;
  private mSelectedSubCategories: Phaser.GameObjects.GameObject;
  private mPropContainer: Phaser.GameObjects.Container;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoriesContainer: Phaser.GameObjects.Container;
  private mSubCategeoriesContainer: Phaser.GameObjects.Container;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mItems: MarketItem[];
  private readonly dpr: number = 1;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    this.mSubTabs = [];
    this.mTabs = [];
    this.dpr = Math.floor(window.devicePixelRatio || 1);
  }

  public resize(w: number, h: number) {
    // super.resize(w, h);
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    const centerX = this.scene.cameras.main.centerX;
    // this.setScale(scale);

    this.setSize(width, height);

    this.mBackgroundColor.clear();
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff, 1);
    this.mBackgroundColor.fillRect(0, 0, width, height);
    this.mBackgroundColor.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    this.mTIle.x = centerX;

    this.mShelfContainer.setSize(width, 305 * this.dpr);
    this.mShelfContainer.setPosition(0, height - this.mShelfContainer.height);

    this.mSelectItem.setSize(width, height - this.mShelfContainer.height);
    // this.mSelectItem.y = 45 * this.dpr;
    this.mSelectItem.resize(w, h);

    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3ee1ff);
    this.mCategoriesBar.fillRect(0, 0, width, 41 * this.dpr);
    this.mCategoriesBar.fillStyle(0x04b3d3);
    this.mCategoriesBar.fillRect(0, 41 * this.dpr, width, 4 * this.dpr);
    this.mSubCategeoriesContainer.setSize(width, 45 * this.dpr);

    this.setInteractive();
    // this.setInteractive(new Phaser.Geom.Rectangle(-(width >> 1), -(height >> 1), width, height), Phaser.Geom.Rectangle.Contains);
  }

  public setCategories(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES) {
    if (!this.mCategoriesContainer) {
      return;
    }
    this.mCategoriesContainer.removeAll(true);
    const categorys = content.marketCategory;
    this.mTabs = [];
    const config = {
      left: 24,
      top: 27,
      right: 19,
      bottom: 13
    };
    const group: CheckboxGroup = new CheckboxGroup();
    const capW = 78 * this.dpr;
    const capH = 39 * this.dpr;
    for (let i = 0; i < categorys.length; i++) {
      const btn = new TabButton(this.scene, i * 80 * this.dpr + capW / 2, capH / 2, capW, capH, this.key, "categories", categorys[i].category.value, config);
      // btn.removeAllListeners();
      btn.setTextStyle({
        fontSize: 18 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
      });
      this.mTabs[i] = btn;
      btn.setData("category", categorys[i]);
      // this.add(btn);
    }
    this.mCategoriesContainer.setSize(this.mTabs.length * capW, capH);
    this.mShelfContainer.add(this.mTabs);
    this.mSubCategeoriesContainer.y = this.mCategoriesContainer.height;
    this.mPropContainer.y = this.mSubCategeoriesContainer.y + this.mSubCategeoriesContainer.height + 9 * this.dpr;
    group.on("selected", this.onSelectCategoryHandler, this);
    group.appendItemAll(this.mTabs);

    group.selectIndex(0);
    // for (const category of categorys) {
    //   const btn = new NinePatchButton(this.scene, )
    // }
  }

  public setProp(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
    this.clearCategories(this.mItems);
    this.mItems = [];
    const commodities = content.commodities;
    for (let i = 0; i < commodities.length; i++) {
      const item = new MarketItem(this.scene, Math.floor(i / 3) * (142 * this.dpr) + (76 * this.dpr), Math.floor(i % 3) * (71 * this.dpr) + 31 * this.dpr);
      item.setProp(commodities[i]);
      item.on("select", this.onSelectItemHandler, this);
      this.mItems[i] = item;
    }
    this.mPropContainer.add(this.mItems);

    if (commodities.length > 0) this.onSelectItemHandler(commodities[0]);
  }

  public setCommodityResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (this.mSelectItem) {
      this.mSelectItem.setResource(content);
    }
  }

  protected preload() {
    this.scene.load.atlas(this.key, Url.getUIRes(this.dpr, "market/market.png"), Url.getUIRes(this.dpr, "market/market.json"));
    super.preload();
  }

  protected init() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.mBackgroundColor = this.scene.make.graphics(undefined, false);
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    // this.mBackgroundColor.fillStyle(0x6f75ff);
    this.mBackgroundColor.fillRect(0, 0, w, h);
    this.addAt(this.mBackgroundColor, 0);

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow.png",
      x: 21 * this.dpr,
      y: 51 * this.dpr
    }).setInteractive();

    this.mShelfContainer = this.scene.make.container({
      x: (w / 2),
      y: h
    }, false).setSize(w, 430 * this.dpr);
    this.add(this.mShelfContainer);
    this.mPropContainer = this.scene.make.container(undefined, false);
    this.mCategoriesContainer = this.scene.make.container(undefined, false);
    this.mSubCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.add([this.mCategoriesContainer, this.mSubCategeoriesContainer, this.mPropContainer]);

    this.mSelectItem = new ElementDetail(this.scene, this.mWorld, this.key);
    this.mSelectItem.setSize(w, h - this.mShelfContainer.height);

    this.mTIle = this.scene.make.text({
      text: i18n.t("market.title"),
      y: 51 * this.dpr,
      style: {
        fontSize: 40 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    this.add([this.mTIle, this.mSelectItem, this.mCloseBtn]);
    super.init();

    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mSubCategeoriesContainer.addAt(this.mCategoriesBar, 0);

    this.resize(0, 0);

    this.emit("getCategories");
    this.mSelectItem.on("buyItem", this.onBuyItemHandler, this);
    this.mSelectItem.on("popItemCard", this.onPopItemCardHandler, this);
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    // 多层容器嵌套必须把input的点击区域移到中间去，否则点击pointer会有坐标问题
    // this.input.hitArea.x += this.width / 2;
    // this.input.hitArea.y += this.height / 2;
  }

  protected setSelect() {
    // this.mSelectItem.setProp();
  }

  private clearCategories(tabs) {
    if (!tabs) {
      return;
    }
    tabs.map((tab) => tab.destroy());
    tabs = undefined;
  }

  private onSelectCategoryHandler(gameobject: Phaser.GameObjects.GameObject) {
    if (!this.mSubCategeoriesContainer) {
      return;
    }
    this.clearCategories(this.mSubTabs);
    const subcategory: op_def.IMarketCategory = gameobject.getData("category");
    this.mSelectedCategories = gameobject;
    if (subcategory) {
      this.mSubTabs = [];
      const group = new CheckboxGroup();
      const subcategorys = subcategory.subcategory;
      const capW = 56 * this.dpr;
      const capH = 41 * this.dpr;
      for (let i = 0; i < subcategorys.length; i++) {
        const textBtn = new TextButton(this.scene, subcategorys[i].value, i * capW + capW / 2, capH / 2);
        textBtn.setData("category", subcategorys[i]);
        textBtn.setSize(capW, capH);
        this.mSubTabs[i] = textBtn;
      }
      group.appendItemAll(this.mSubTabs);
      this.mSubCategeoriesContainer.add(this.mSubTabs);

      group.on("selected", this.onSelectSubCategoryHandler, this);
      group.selectIndex(0);
    }
  }

  private onSelectSubCategoryHandler(gameobject: Phaser.GameObjects.GameObject) {
    if (!this.mSelectedCategories) {
      return;
    }
    const categories: op_def.IMarketCategory = this.mSelectedCategories.getData("category");
    if (!categories) {
      return;
    }
    const subCategories = gameobject.getData("category");
    if (!subCategories) {
      return;
    }

    this.queryProp(categories.category.key, subCategories.key);
  }

  private queryProp(category: string, subCategory: string) {
    this.emit("queryProp", 1, category, subCategory);
  }

  private onSelectItemHandler(prop: op_client.IMarketCommodity) {
    this.mSelectItem.setProp(prop);
    this.emit("queryPropResource", prop);
  }

  private onBuyItemHandler(prop: op_def.IOrderCommodities) {
    this.emit("buyItem", prop);
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onPopItemCardHandler(prop, display) {
    if (prop) {
      this.emit("popItemCard", prop, display);
    }
  }
}
