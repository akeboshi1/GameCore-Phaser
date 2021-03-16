import { ElementDetail } from "./ElementDetail";
import { MarketItem } from "./item";
import { NinePatchTabButton, GameGridTable, NineSliceButton, Button, ClickEvent } from "apowophaserui";
import { BasePanel, CheckboxGroup, TextButton, UiManager } from "gamecoreRender";
import { AvatarSuitType, ModuleName } from "structure";
import { Font, i18n } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
import { IPrice } from "picaStructure";
export class PicaMarketPanel extends BasePanel {
  private mSelectItem: ElementDetail;
  private mCloseBtn: Button;
  private mTIle: Phaser.GameObjects.Text;
  private mTabs: NinePatchTabButton[];
  private mSubTabs: TextButton[];
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
  private mItems: MarketItem[];
  private mPreSubCategoris: any;// op_def.IStrPair
  private mPreSubCategorisItem: TextButton;
  private mPropGrid: GameGridTable;
  private randomCon: Phaser.GameObjects.Container;
  private randomRefeshTime: Phaser.GameObjects.Text;
  private randomRefreshBtn: NineSliceButton;
  private refreshIcon: Phaser.GameObjects.Image;
  private refreshNeedCount: Phaser.GameObjects.Text;
  private moneyValue: number;
  private diamondValue: number;
  constructor(uiManager: UiManager) {
    super(uiManager.scene, uiManager.render);
    this.key = ModuleName.PICAMARKET_NAME;
    this.mSubTabs = [];
    this.mTabs = [];
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mSelectItem.on("buyItem", this.onBuyItemHandler, this);
    this.mSelectItem.on("popItemCard", this.onPopItemCardHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mSelectItem.off("buyItem", this.onBuyItemHandler, this);
    this.mSelectItem.off("popItemCard", this.onPopItemCardHandler, this);
    //  this.mCloseBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
  }

  public resize(w: number, h: number) {
    // super.resize(w, h);
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.setSize(width, height);
    this.mTIle.x = width / 2;

    const shelfHeight = 290 * this.dpr;
    this.mBackgroundColor.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    this.mShelfContainer.setSize(width, shelfHeight);
    this.mShelfContainer.setPosition(0, height - this.mShelfContainer.height);

    this.mShelfBackground.clear();
    this.mShelfBackground.fillStyle(0x02ccff);
    this.mShelfBackground.fillRect(0, 0, this.mShelfContainer.width, this.mShelfContainer.height);
    this.mShelfBackground.y = this.mSubCategeoriesContainer.y + 43 * this.dpr;
    this.mSelectItem.resize(width, height);
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3ee1ff);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x04b3d3);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);
    this.mSubCategeoriesContainer.setSize(width, 43 * this.dpr);
  }

  public setCategories(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
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
      left: w / 2,
      top: 12 * this.dpr,
      right: 4 * this.dpr,
      bottom: 2 * this.dpr
    };
    const group: CheckboxGroup = new CheckboxGroup();
    const capW = 77 * this.dpr;
    const capH = 38 * this.dpr;
    for (let i = 0; i < categorys.length; i++) {
      const btn = new NinePatchTabButton(this.scene, capW, capH, this.key, "categories_normal", "categories_down", categorys[i].category.value, [config0], 1, 1);
      // btn.removeAllListeners();
      btn.setTextStyle({
        fontSize: 18 * this.dpr,
        fontFamily: Font.DEFULT_FONT,
      });
      this.mTabs[i] = btn;
      btn.setData("category", categorys[i]);
      btn.x = i * 80 * this.dpr + capW / 2;
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

  public setMoneyData(money: number, diamond: number) {
    this.moneyValue = money;
    this.diamondValue = diamond;
  }

  public setProp(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY
    this.clearCategories(this.mItems);
    this.mItems = [];
    const commodities = content.commodities;
    this.mPropGrid.setItems(commodities);
    this.mPropGrid.layout();
    this.mPropGrid.setT(0);
    if (commodities.length > 0) this.onSelectItemHandler(commodities[0]);
  }

  public setCommodityResource(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
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

  public onPropConfirmHandler(prop: any, count: number) {// op_client.CountablePackageItem
    this.render.renderEmitter(this.key + "_buyItem", prop);
  }

  protected layoutCategories() {
    this.mCategoriesBar.y = this.mCategoriesContainer.height + this.mShelfContainer.y;
    this.mSubCategeoriesContainer.addAt(this.mCategoriesBar, 0);
    this.mPropContainer.y = this.mSubCategeoriesContainer.y + 43 * this.dpr + this.mSubCategeoriesContainer.height + 9 * this.dpr;
    this.mShelfBackground.y = this.mSubCategeoriesContainer.y + 43 * this.dpr;
    this.mSubCategorisScroll.y = this.mCategoriesBar.y + (25 * this.dpr);
    this.randomCon.y = this.mSubCategorisScroll.y;
    this.mPropGrid.y = this.mCategoriesBar.y + this.mSubCategeoriesContainer.height + this.mPropGrid.height * 0.5 + 5 * this.dpr;
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
    const w = this.scaleWidth;
    const h = this.scaleHeight;
    this.mBackgroundColor = this.scene.make.graphics(undefined, false);
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    // this.mBackgroundColor.fillStyle(0x6f75ff);
    this.mBackgroundColor.fillRect(0, 0, w, h);
    this.add(this.mBackgroundColor);

    this.mShelfContainer = this.scene.make.container({
      x: (w / 2),
      y: h
    }, false).setSize(w, 290 * this.dpr);

    const frame = this.scene.textures.getFrame(this.key, "bg");
    const countW = Math.ceil(w / (frame.width));
    const countH = Math.ceil((h - this.mShelfContainer.height + frame.height) / (frame.height));
    for (let i = 0; i < countW; i++) {
      for (let j = 0; j < countH; j++) {
        const bg = this.scene.make.image({
          x: i * frame.width,
          y: j * frame.height,
          key: this.key,
          frame: "bg"
        }, false);
        bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(bg);
      }
    }

    this.mShelfBackground = this.scene.make.graphics(undefined, false);
    this.mCloseBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
    this.mCloseBtn.setPosition(21 * this.dpr, 45 * this.dpr);
    this.mCloseBtn.setInteractive(new Phaser.Geom.Rectangle(-28 * this.dpr, -20 * this.dpr, 56 * this.dpr, 40 * this.dpr), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);

    this.mPropContainer = this.scene.make.container(undefined, false);
    this.mCategoriesContainer = this.scene.make.container(undefined, false);
    this.mSubCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.add([this.mShelfBackground, this.mCategoriesContainer, this.mPropContainer]);
    this.add([this.mShelfContainer, this.mSubCategeoriesContainer]);

    this.mSelectItem = new ElementDetail(this.scene, this.render, this.key, this.dpr, this.scale);
    this.mSelectItem.setSize(w, h - this.mShelfContainer.height);

    this.mTIle = this.scene.make.text({
      text: i18n.t("market.title"),
      y: 30 * this.dpr,
      style: {
        fontSize: 36 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);
    this.mTIle.y = this.mCloseBtn.y - 5 * this.dpr;
    this.add([this.mTIle, this.mSelectItem, this.mCloseBtn]);
    super.init();

    this.mCategoriesBar = this.scene.make.graphics(undefined, false);

    const capW = 56 * this.dpr;
    const capH = 41 * this.dpr;
    const config = {
      x: w / 2,
      y: 0,
      table: {
        width: w,
        height: 50 * this.dpr,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        zoom: this.scale,
        mask: false
      },
      scrollMode: 1,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new TextButton(scene, this.dpr);
        }
        const subCategories = cellContainer.getData("item");
        if (subCategories !== item) {
          cellContainer.setText(item.value);
          cellContainer.setData({ item });
          if (item && this.mPreSubCategoris && this.mPreSubCategoris.key === item.key) {
            cellContainer.changeDown();
          } else {
            cellContainer.changeNormal();
          }
        }
        return cellContainer;
      },
    };
    this.mSubCategorisScroll = new GameGridTable(this.scene, config);
    this.mSubCategorisScroll.on("cellTap", (cell, index) => {
      this.onSelectSubCategoryHandler(cell);
    });
    this.add(this.mSubCategorisScroll);
    this.randomCon = this.scene.make.container(undefined, false);
    this.randomCon.x = w * 0.5;
    this.randomCon.visible = false;
    this.add(this.randomCon);
    this.randomRefeshTime = this.scene.make.text({
      x: -w * 0.5 + 10 * this.dpr, y: -12 * this.dpr,
      text: i18n.t("market.refreshtime"),
      style: {
        color: "#007AAE",
        fontSize: 13 * this.dpr,
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
      fontFamily: Font.DEFULT_FONT
    });
    this.randomRefreshBtn.setFontStyle("bold");

    this.refreshIcon = this.scene.make.image({ key: UIAtlasKey.commonKey, frame: "iv_coin" }).setScale(0.8);
    this.refreshIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.refreshIcon.setPosition(-10 * this.dpr, -8 * this.dpr);
    this.refreshNeedCount = this.scene.make.text({
      x: 0 * this.dpr, y: this.refreshIcon.y,
      text: "100",
      style: {
        fontSize: 10 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0, 0.5);
    this.randomRefreshBtn.add([this.refreshIcon, this.refreshNeedCount]);
    this.randomCon.add([this.randomRefeshTime, this.randomRefreshBtn]);
    const propFrame = this.scene.textures.getFrame(this.key, "border");
    const cellWidth = propFrame.width + 6 * this.dpr;
    const cellHeight = propFrame.height + 10 * this.dpr;
    const propGridConfig = {
      x: w / 2 + 4 * this.dpr,
      y: 0,
      table: {
        width: w,
        height: 224 * this.dpr,
        columns: 3,
        cellWidth,
        cellHeight,
        reuseCellContainer: true,
        cellOriginX: 0,
        cellOriginY: 0,
        zoom: this.scale,
        mask: false
      },
      scroller: {
        backDeceleration: false,
        slidingDeceleration: false
      },
      scrollMode: 1,
      clamplChildOY: false,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new MarketItem(scene, 0, 0, this.dpr, this.scale);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        return cellContainer;
      },
    };
    this.mPropGrid = new GameGridTable(this.scene, propGridConfig);
    this.mPropGrid.layout();
    this.mPropGrid.on("cellTap", (cell) => {
      const data = cell.getData("item");
      if (data) {
        this.onSelectItemHandler(data);
      }
    });
    this.add(this.mPropGrid);
    this.resize(0, 0);

    this.render.renderEmitter(this.key + "_getCategories");
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
    this.mSubCategorisScroll.setT(0);
    this.mPreSubCategoris = null;
    this.clearCategories(this.mSubTabs);
    const subcategory: any = gameobject.getData("category");// op_def.IMarketCategory
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

  private onSelectSubCategoryHandler(gameobject: TextButton) {
    if (!this.mSelectedCategories) {
      return;
    }
    if (!(gameobject instanceof TextButton)) {
      return;
    }
    const categories: any = this.mSelectedCategories.getData("category");// op_def.IMarketCategory
    if (!categories) {
      return;
    }
    const subCategories = gameobject.getData("item");
    if (!subCategories) {
      return;
    }
    this.queryProp(categories.category.key, subCategories.key);
    this.mPreSubCategoris = subCategories;
    if (this.mPreSubCategorisItem) this.mPreSubCategorisItem.changeNormal();
    gameobject.changeDown();
    this.mPreSubCategorisItem = gameobject;

  }

  private queryProp(category: string, subCategory: string) {
    this.render.renderEmitter(this.key + "_queryProp", { page: 1, category, subCategory });
  }

  private onSelectItemHandler(prop: any) {// op_client.IMarketCommodity
    this.mSelectItem.setProp(prop);
    this.mSelectItem.setData("propdata", prop);
    if (!prop.suitType || prop.suitType === "") {
      // this.render.renderEmitter(this.key + "_queryPropResource", prop);
      const content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
      content.display = prop.animationDisplay ? prop.animationDisplay : prop.display;
      content.animations = <any>prop.animations;
      this.setCommodityResource(content);
    } else {
      const content = this.getCommodityResource(prop);
      this.setCommodityResource(content);
    }
  }

  private onBuyItemHandler(prop: any) {// op_def.IOrderCommodities
    const itemdata = this.getBuyPackageData();
    itemdata.count = prop.quantity;
    const allPrice = prop.quantity * itemdata.sellingPrice.price;
    if (allPrice > this.moneyValue) {
      const tempdata = {
        text: [{ text: i18n.t("market.moneyless"), node: undefined }]
      };
      this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
      return;
    }
    const data = itemdata;
    const title = i18n.t("market.payment");
    const resource = this.mSelectItem.getData("display");
    const resultHandler = { key: this.key, confirmFunc: "onPropConfirmHandler", confirmAddData: prop };
    this.showPropFun({ resultHandler, data, resource, slider: false, title });
  }

  private onCloseHandler() {
    this.render.renderEmitter(this.key + "_close");
  }

  private onPopItemCardHandler(prop, display) {
    if (prop) {
      this.render.renderEmitter(this.key + "_popItemCard", { prop, display });
    }
  }
  private getBuyPackageData() {
    const propdata: any = this.mSelectItem.getData("propdata");// op_client.IMarketCommodity
    const itemdata = { id: null, sellingPrice: null, name: null, shortName: null, count: 1 };// op_client.CountablePackageItem.create()
    itemdata.id = propdata.id;
    itemdata.sellingPrice = propdata.price[0];
    itemdata.name = propdata.name;
    itemdata.shortName = propdata.shortName;
    return itemdata;
  }
  private showPropFun(config: any) {// PicPropFunConfig
    this.render.mainPeer.showMediator(ModuleName.PICAPROPFUN_NAME, true, config);
  }
  private getCommodityResource(data: op_client.IMarketCommodity) {
    const content: any = {};
    content.avatar = AvatarSuitType.createAvatarBySn(data.suitType, data.sn, data.slot, data.tag, data.version);
    content.suits = [{ suit_type: data.suitType, sn: data.sn, tag: data.tag, version: data.version }];
    return content;
  }
}
