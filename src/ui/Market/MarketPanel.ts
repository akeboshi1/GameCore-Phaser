import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { i18n } from "../../i18n";
import { op_client, op_def } from "pixelpai_proto";
import { CheckboxGroup } from "../components/checkbox.group";
import { Font } from "../../utils/font";
import { GameGridTable } from "apowophaserui";
import { GridTableConfig } from "apowophaserui";
import { NinePatchTabButton } from "apowophaserui";
import { Logger } from "../../utils/log";
import { PicPropFunConfig } from "../PicPropFun/PicPropFunConfig";
import { Handler } from "../../Handler/Handler";
import { NineSliceButton } from "apowophaserui";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
export class MarketPanel extends BasePanel {
  private readonly key = "market";
  private mSelectItem: any;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mTIle: Phaser.GameObjects.Text;
  private mTabs: NinePatchTabButton[];
  private mSubTabs: any[];
  private mSelectedCategories: Phaser.GameObjects.GameObject;
  private mSelectedSubCategories: Phaser.GameObjects.GameObject;
  private mPropContainer: Phaser.GameObjects.Container;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoriesContainer: Phaser.GameObjects.Container;
  private mSubCategeoriesContainer: Phaser.GameObjects.Container;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mBackgroundColor: Phaser.GameObjects.Graphics;
  private mShelfBackground: Phaser.GameObjects.Graphics;
  private mSubCategorisScroll: GameGridTable;
  private mItems: any[];
  private mPreSubCategoris: op_def.IStrPair;
  private mPropGrid: GameGridTable;
  private randomCon: Phaser.GameObjects.Container;
  private randomRefeshTime: Phaser.GameObjects.Text;
  private randomRefreshBtn: NineSliceButton;
  private refreshIcon: Phaser.GameObjects.Image;
  private refreshNeedCount: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.mSubTabs = [];
    this.mTabs = [];
    this.scale = 1;
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mSelectItem.on("buyItem", this.onBuyItemHandler, this);
    this.mSelectItem.on("popItemCard", this.onPopItemCardHandler, this);
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mSelectItem.off("buyItem", this.onBuyItemHandler, this);
    this.mSelectItem.off("popItemCard", this.onPopItemCardHandler, this);
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
  }

  public resize(w: number, h: number) {
    // super.resize(w, h);
    const scale = this.scale;
    const zoom = this.mWorld.uiScale;
    const width = this.scene.cameras.main.width / scale;
    const height = this.scene.cameras.main.height / scale;
    const centerX = this.scene.cameras.main.centerX / scale;

    this.setSize(width, height);

    this.mTIle.x = centerX;

    const shelfHeight = 290 * this.dpr * zoom;
    this.mBackgroundColor.setInteractive(new Phaser.Geom.Rectangle(0, 0, width * zoom, height * zoom), Phaser.Geom.Rectangle.Contains);

    this.mShelfContainer.setSize(width, shelfHeight);
    this.mShelfContainer.setPosition(0, height - this.mShelfContainer.height);

    this.mShelfBackground.clear();
    this.mShelfBackground.fillStyle(0x02ccff);
    this.mShelfBackground.fillRect(0, 0, this.mShelfContainer.width, this.mShelfContainer.height);
    this.mShelfBackground.y = this.mSubCategeoriesContainer.y + 43 * this.dpr * zoom;

    this.mSelectItem.setSize(width, height - this.mShelfContainer.height);
    this.mSelectItem.resize(w, h);

    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3ee1ff);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr * zoom);
    this.mCategoriesBar.fillStyle(0x04b3d3);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr * zoom, width, 3 * this.dpr * zoom);
    this.mSubCategeoriesContainer.setSize(width, 43 * this.dpr * zoom);
    // this.setInteractive();
    // this.setInteractive(new Phaser.Geom.Rectangle(-(width >> 1), -(height >> 1), width, height), Phaser.Geom.Rectangle.Contains);
  }

  public setCategories(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES) {
    if (!this.mCategoriesContainer) {
      return;
    }
    this.mCategoriesContainer.removeAll(true);
    const categorys = content.marketCategory;
    this.mTabs = [];
    const frame = this.scene.textures.getFrame(this.key, "categories_normal");
    let w = 60;
    let h = 65;
    if (frame) {
      w = frame.width;
      h = frame.height;
    }
    const config0 = {
      left: w / 2 + 2 * this.dpr,
      top: 12 * this.dpr,
      right: w / 2 - 4 * this.dpr,
      bottom: 2 * this.dpr
    };
    const group: CheckboxGroup = new CheckboxGroup();
    const zoom = this.mWorld.uiScale;
    const capW = 77 * this.dpr * zoom;
    const capH = 38 * this.dpr * zoom;
    for (let i = 0; i < categorys.length; i++) {
      const btn = new NinePatchTabButton(this.scene, capW, capH, this.key, "categories_normal", "categories_down", categorys[i].category.value, [config0], this.dpr, this.scale);
      // btn.removeAllListeners();
      btn.setTextStyle({
        fontSize: 18 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
      });
      this.mTabs[i] = btn;
      btn.setData("category", categorys[i]);
      btn.x = i * 80 * this.dpr * zoom + capW / 2;
      btn.y = capH / 2;
      // this.add(btn);
    }
    this.mCategoriesContainer.setSize(this.mTabs.length * capW, capH);
    this.mShelfContainer.add(this.mTabs);
    this.layoutCategories();
    group.on("selected", this.onSelectCategoryHandler, this);
    group.appendItemAll(this.mTabs);
    group.selectIndex(0);
  }

  public setProp(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY) {
    this.clearCategories(this.mItems);
    this.mItems = [];
    const commodities = content.commodities;
    this.mPropGrid.setItems(commodities);
    this.mPropGrid.layout();
    this.mPropGrid.setT(0);
    if (commodities.length > 0) this.onSelectItemHandler(commodities[0]);
  }

  public setCommodityResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (this.mSelectItem) {
      this.mSelectItem.setResource(content);
      this.mSelectItem.setData("display", content);
    }
  }

  public destroy() {
    if (this.mSubCategorisScroll) {
      this.mSubCategorisScroll.destroy();
    }
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    super.destroy();
  }

  protected layoutCategories() {
    this.mCategoriesBar.y = this.mCategoriesContainer.height + this.mShelfContainer.y;
    this.mSubCategeoriesContainer.addAt(this.mCategoriesBar, 0);
    this.mPropContainer.y = this.mSubCategeoriesContainer.y + 43 * this.dpr + this.mSubCategeoriesContainer.height + 9 * this.dpr;
    this.mShelfBackground.y = this.mSubCategeoriesContainer.y + 43 * this.dpr;
    this.mSubCategorisScroll.y = this.mCategoriesBar.y + (33 * this.dpr);
    this.randomCon.y = this.mSubCategorisScroll.y;
    this.mPropGrid.y = this.mCategoriesBar.y + this.mSubCategeoriesContainer.height + 122 * this.dpr;
    this.mPropGrid.layout();
    this.mSubCategorisScroll.layout();
    this.mSubCategorisScroll.resetMask();
    this.mPropGrid.resetMask();
  }

  protected preload() {
    // this.scene.load.atlas(this.key, Url.getUIRes(this.dpr, "market/market"), Url.getUIRes(this.dpr, "market/market.json"));
    this.addAtlas(this.key, "market/market.png", "market/market.json");
    this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
    super.preload();
  }

  protected init() {
    if (this.mInitialized) return;
    const w = this.scene.scale.width / this.scale;
    const h = this.scene.scale.height / this.scale;
    const zoom = this.mWorld.uiScale;
    this.mBackgroundColor = this.scene.make.graphics(undefined, false);
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    // this.mBackgroundColor.fillStyle(0x6f75ff);
    this.mBackgroundColor.fillRect(0, 0, w, h);
    this.add(this.mBackgroundColor);

    this.mShelfContainer = this.scene.make.container({
      x: (w / 2),
      y: h
    }, false).setSize(w, 290 * this.dpr * zoom);

    const frame = this.scene.textures.getFrame(this.key, "bg");
    const countW = Math.ceil(w / (frame.width * zoom));
    const countH = Math.ceil((h - this.mShelfContainer.height + frame.height * zoom) / (frame.height * zoom));
    for (let i = 0; i < countW; i++) {
      for (let j = 0; j < countH; j++) {
        const bg = this.scene.make.image({
          x: i * frame.width * zoom,
          y: j * frame.height * zoom,
          key: this.key,
          frame: "bg"
        }, false).setScale(zoom);
        this.add(bg);
      }
    }

    this.mShelfBackground = this.scene.make.graphics(undefined, false);

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow",
      x: 21 * this.dpr,
      y: 30 * this.dpr
    }).setInteractive().setScale(zoom);

    this.mPropContainer = this.scene.make.container(undefined, false);
    this.mCategoriesContainer = this.scene.make.container(undefined, false);
    this.mSubCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.add([this.mShelfBackground, this.mCategoriesContainer, this.mPropContainer]);
    this.add([this.mShelfContainer, this.mSubCategeoriesContainer]);

    // this.mSelectItem = new ElementDetail(this.scene, this.mWorld, this.key, this.dpr, this.mWorld.uiScale);
    // this.mSelectItem.setSize(w, h - this.mShelfContainer.height);

    this.mTIle = this.scene.make.text({
      text: i18n.t("market.title"),
      y: 30 * this.dpr * zoom,
      style: {
        fontSize: 36 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    this.add([this.mTIle, this.mSelectItem, this.mCloseBtn]);
    super.init();

    this.mCategoriesBar = this.scene.make.graphics(undefined, false);

    const capW = 56 * this.dpr;
    const capH = 41 * this.dpr;
    // const config: GridTableConfig = {
    //   x: w / 2,
    //   // y: 0,
    //   // width: w,
    //   // height: capH,
    //   table: {
    //     width: w - 30 * this.dpr,
    //     height: capH,
    //     cellWidth: capW,
    //     cellHeight: capH,
    //     reuseCellContainer: true,
    //     cellOriginX: 0,
    //     cellOriginY: 0,
    //   },
    //   scrollMode: 1,
    //   createCellContainerCallback: (cell, cellContainer) => {
    //     const scene = cell.scene,
    //       item = cell.item;
    //     if (cellContainer === null) {
    //       cellContainer = new TextButton(scene, this.dpr, zoom);
    //       // cellContainer.width = capW;
    //       // cellContainer.height = capH;
    //       this.add(cellContainer);
    //     }
    //     cellContainer.setText(item.value);
    //     // cellContainer.setSize(width, height);
    //     cellContainer.setData({ item });
    //     if (item && this.mPreSubCategoris && this.mPreSubCategoris.key === item.key) {
    //       cellContainer.changeDown();
    //     } else {
    //       cellContainer.changeNormal();
    //     }
    //     return cellContainer;
    //   },
    // };
    const config = { };
    this.mSubCategorisScroll = new GameGridTable(this.scene, config);
    this.mSubCategorisScroll.on("cellTap", (cell, index) => {
      this.onSelectSubCategoryHandler(cell);
    });
    this.add(this.mSubCategorisScroll.table);
    this.randomCon = this.scene.make.container(undefined, false);
    this.randomCon.x = w * 0.5;
    this.randomCon.visible = false;
    this.add(this.randomCon);
    this.randomRefeshTime = this.scene.make.text({
      x: -w * 0.5 + 10 * this.dpr, y: -12 * this.dpr,
      text: i18n.t("market.refreshtime"),
      style: {
        color: "#007AAE",
        fontSize: 13 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0, 0.5);
    const btnWidth = 80 * this.dpr, btnHeight = 30 * this.dpr;
    this.randomRefreshBtn = new NineSliceButton(this.scene, w * 0.5, this.randomRefeshTime.y, btnWidth, btnHeight, UIAtlasKey.commonKey, "button_g", i18n.t("market.refresh"), this.dpr, this.scale, {
      left: 15 * this.dpr,
      top: 15 * this.dpr,
      right: 15 * this.dpr,
      bottom: 15 * this.dpr
    });
    this.randomRefreshBtn.x = w * 0.5 - this.randomRefreshBtn.width * 0.5 - 10 * this.dpr;
    this.randomRefreshBtn.setTextOffset(0, 5 * this.dpr);
    this.randomRefreshBtn.setTextStyle({
      color: "#0",
      fontSize: 13 * this.dpr,
      fontFamily: Font.BOLD_FONT
    });
    this.randomRefreshBtn.setFontStyle("bold");

    this.refreshIcon = this.scene.make.image({ key: UIAtlasKey.commonKey, frame: "iv_coin" }).setScale(0.8);
    this.refreshIcon.setPosition(-10 * this.dpr, -8 * this.dpr);
    this.refreshNeedCount = this.scene.make.text({
      x: 0 * this.dpr, y: this.refreshIcon.y,
      text: "100",
      style: {
        fontSize: 10 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0, 0.5);
    this.randomRefreshBtn.add([this.refreshIcon, this.refreshNeedCount]);
    this.randomCon.add([this.randomRefeshTime, this.randomRefreshBtn]);
    const propFrame = this.scene.textures.getFrame(this.key, "border");
    const cellWidth = propFrame.width * zoom + 10 * this.dpr;
    const cellHeight = propFrame.height * zoom + 10 * this.dpr;
    // const propGridConfig: GridTableConfig = {
    //   x: w / 2,
    //   y: 1050 + (41 * this.dpr * zoom) / 2,
    //   // y: 0,
    //   table: {
    //     width: w - 20 * this.dpr * zoom,
    //     height: 224 * this.dpr * zoom,
    //     columns: 3,
    //     cellWidth,
    //     cellHeight,
    //     reuseCellContainer: true,
    //     // mask: false,
    //     cellOriginX: 0,
    //     cellOriginY: 0
    //   },
    //   scrollMode: 1,
    //   clamplChildOY: false,
    //   createCellContainerCallback: (cell, cellContainer) => {
    //     const scene = cell.scene,
    //       item = cell.item;
    //     if (cellContainer === null) {
    //       cellContainer = new MarketItem(scene, 0, 0, this.dpr, zoom);
    //       // cellContainer.width = capW;
    //       // cellContainer.height = capH;
    //       this.add(cellContainer);
    //     }
    //     // cellContainer.setSize(width, height);
    //     cellContainer.setData({ item });
    //     cellContainer.setProp(item);
    //     return cellContainer;
    //   },
    // };

    const propGridConfig = { };
    this.mPropGrid = new GameGridTable(this.scene, propGridConfig);
    this.mPropGrid.layout();
    this.mPropGrid.on("cellTap", (cell) => {
      const data = cell.getData("item");
      if (data) {
        this.onSelectItemHandler(data);
      }
    });
    this.add(this.mPropGrid.table);

    this.resize(0, 0);

    this.emit("getCategories");
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
    this.mPreSubCategoris = null;
    this.clearCategories(this.mSubTabs);
    const subcategory: op_def.IMarketCategory = gameobject.getData("category");
    this.mSelectedCategories = gameobject;
    if (subcategory) {
      const subcategorys = subcategory.subcategory;
      if (this.mSubCategorisScroll) {
        this.mSubCategorisScroll.setItems(subcategorys);
        this.mSubCategorisScroll.layout();
        const cell = this.mSubCategorisScroll.getCell(0);
        this.onSelectSubCategoryHandler(cell.container);
      }
    }
  }

  private onSelectSubCategoryHandler(gameobject: any) {
    if (!this.mSelectedCategories) {
      return;
    }
    // if (!(gameobject instanceof TextButton)) {
    //   return;
    // }
    const categories: op_def.IMarketCategory = this.mSelectedCategories.getData("category");
    if (!categories) {
      return;
    }
    const subCategories = gameobject.getData("item");
    if (!subCategories) {
      return;
    }
    this.queryProp(categories.category.key, subCategories.key);
    this.mPreSubCategoris = subCategories;
    this.mSubCategorisScroll.refresh();
  }

  private queryProp(category: string, subCategory: string) {
    this.emit("queryProp", 1, category, subCategory);
  }

  private onSelectItemHandler(prop: op_client.IMarketCommodity) {
    this.mSelectItem.setProp(prop);
    this.mSelectItem.setData("propdata", prop);
    this.emit("queryPropResource", prop);
  }

  private onBuyItemHandler(prop: op_def.IOrderCommodities) {
    const itemdata = this.getBuyPackageData();
    itemdata.count = prop.quantity;
    const data = itemdata;
    const title = i18n.t("market.payment");
    const resource = this.mSelectItem.getData("display");
    const confirmHandler = new Handler(this, () => {
      this.emit("buyItem", prop);
    }, [prop]);
    this.showPropFun({ confirmHandler, data, resource, slider: false, title });
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onPopItemCardHandler(prop, display) {
    if (prop) {
      this.emit("popItemCard", prop, display);
    }
  }
  private getBuyPackageData() {
    const propdata: op_client.IMarketCommodity = this.mSelectItem.getData("propdata");
    const itemdata = op_client.CountablePackageItem.create();
    itemdata.id = propdata.id;
    itemdata.sellingPrice = propdata.price[0];
    itemdata.name = propdata.name;
    itemdata.shortName = propdata.shortName;
    return itemdata;
  }
  private showPropFun(config: PicPropFunConfig) {
    const uimanager = this.mWorld.uiManager;
    uimanager.showMed("PicPropFun", config);
  }
}
