import { ElementDetail } from "./ElementDetail";
import { MarketItem } from "./item";
import { NinePatchTabButton, GameGridTable, NineSliceButton, Button, ClickEvent } from "apowophaserui";
import { CheckboxGroup, TextButton, UiManager } from "gamecoreRender";
import { AvatarSuitType, ModuleName } from "structure";
import { CoinType, Font, Handler, i18n, UIHelper } from "utils";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { op_client } from "pixelpai_proto";
import { ICurrencyLevel, IExtendCountablePackageItem, IMarketCommodity, IPrice } from "picaStructure";
import { MoneyCompent } from "picaRender";
import { PicaBasePanel } from "../pica.base.panel";
import { ImageValueButton } from "../Components/image.value.button";
export class PicaMarketPanel extends PicaBasePanel {
  protected moneycomp: MoneyCompent;
  protected imgBg: Phaser.GameObjects.Image;
  protected mCloseBtn: ImageValueButton;
  protected zoom: number;
  protected mSuperInit: boolean = true;
  private mSelectItem: ElementDetail;
  private mTabs: NinePatchTabButton[];
  private mSubTabs: TextButton[];
  private mSelectedCategories: Phaser.GameObjects.GameObject;
  private mPropContainer: Phaser.GameObjects.Container;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoriesContainer: Phaser.GameObjects.Container;
  private mSubCategeoriesContainer: Phaser.GameObjects.Container;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mBackgroundColor: Phaser.GameObjects.Graphics;
  private tileBg: Phaser.GameObjects.TileSprite;
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
  private mCurItem: MarketItem;
  private mCurItemData: IMarketCommodity;
  private moneyValue: number;
  private diamondValue: number;
  private playerLv: number;
  private reputation: number;
  private reputationLv: number;
  private reputationCoin: number;
  private currencyData: ICurrencyLevel;
  private propDatas: IMarketCommodity[];
  private buyedProps: any[];
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.key = ModuleName.PICAMARKET_NAME;
    this.atlas = UIAtlasName.market;
    this.loadAtlas = [UIAtlasName.uicommon, UIAtlasName.market];
    this.textures = [{ atlasName: "prestige_bg_texture", folder: UIAtlasName.market }];
    this.mSubTabs = [];
    this.mTabs = [];
    this.zoom = this.scale;
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
  }

  public resize(w: number, h: number) {
    // super.resize(w, h);
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.setSize(width, height);
    // this.mTIle.x = width / 2;

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
    this.layoutCategories();
  }
  public onShow() {
    this.updateMoneyData();
  }
  public setCategories(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_GET_MARKET_CATEGORIES
    if (!this.mCategoriesContainer) {
      return;
    }
    this.mCategoriesContainer.removeAll(true);
    const categorys = content.marketCategory;
    this.mTabs = [];
    const frame = this.scene.textures.getFrame(this.atlas, "categories_normal");
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
      const category = categorys[i];
      const btn = new NinePatchTabButton(this.scene, capW, capH, this.atlas, "categories_normal", "categories_down", category.category.value, [config0], 1, 1);
      btn.setTextStyle(UIHelper.whiteStyle(this.dpr, 18));
      this.mTabs[i] = btn;
      btn.setData("category", category);
      btn.x = i * 80 * this.dpr + capW / 2;
      btn.y = capH / 2;
      let img: Phaser.GameObjects.Image;
      if (category.category.shopName === "crownshop") {
        img = this.scene.make.image({ key: this.atlas, frame: "prestige_nav_icon" });
        btn.setTextColor("#FFF36E");
      } else if (category.category.shopName === "gradeshop") {
        img = this.scene.make.image({ key: this.atlas, frame: "prestige_nav_icon" });
      }
      if (img) {
        img.x = -capW * 0.5 + img.width * 0.5 + 8 * this.dpr;
        btn.add(img);
        btn.setTextOffset(10 * this.dpr, 0);
      }
    }
    this.mCategoriesContainer.setSize(this.mTabs.length * capW, capH);
    this.mShelfContainer.add(this.mTabs);
    this.layoutCategories();
    group.on("selected", this.onSelectCategoryHandler, this);
    group.appendItemAll(this.mTabs);
    group.selectIndex(0);
  }

  public setMoneyData(data: ICurrencyLevel) {
    this.moneyValue = data.money;
    this.diamondValue = data.diamond;
    this.playerLv = data.level;
    this.reputationCoin = data.reputationCoin;
    this.reputationLv = data.reputationLv;
    this.reputation = data.reputation;
    this.currencyData = data;
    if (!this.mInitialized) return;
    // this.moneycomp.setMoneyData(money, diamond);
    this.updateMoneyData();
  }
  public updateBuyedProps(buyedDatas: any[]) {
    if (!buyedDatas) return;
    this.buyedProps = buyedDatas;
    if (this.propDatas) {
      for (const temp of buyedDatas) {
        this.propDatas.find((value) => {
          if (value.id === temp.id) {
            value.buyedCount = temp.boughtCount;
          }
        });
      }
    }
    if (!this.mInitialized) return;
    this.mPropGrid.refresh();
  }
  public setProp(content: any) {
    this.clearCategories(this.mItems);
    this.mItems = [];
    const commodities = content.commodities;
    this.propDatas = commodities;
    this.updateBuyedProps(this.buyedProps);
    this.mPropGrid.setItems(commodities);
    this.mPropGrid.layout();
    this.mPropGrid.setT(0);
    if (commodities.length > 0) {
      const cell = this.mPropGrid.getCell(0);
      this.onSelectItemHandler(cell.container);
    }
  }

  public setCommodityResource(content: any) {
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

  public onPropConfirmHandler(prop: any, count: number) {
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

  protected init() {
    const w = this.scaleWidth;
    const h = this.scaleHeight;
    this.mBackgroundColor = this.scene.make.graphics(undefined, false);
    this.mBackgroundColor.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackgroundColor.fillRect(0, 0, w, h);
    this.add(this.mBackgroundColor);

    const bottomHeight = 290 * this.dpr;
    this.imgBg = this.scene.make.image({ key: "prestige_bg_texture" }).setOrigin(0);
    this.imgBg.visible = false;
    this.tileBg = this.scene.make.tileSprite({ x: 0, y: 0, width: w, height: h - bottomHeight, key: this.atlas, frame: "bg" }).setOrigin(0);
    this.mShelfBackground = this.scene.make.graphics(undefined, false);
    this.mCloseBtn = new ImageValueButton(this.scene, 60 * this.dpr, 23 * this.dpr, UIAtlasName.uicommon, "back_arrow", i18n.t("market.title"), this.dpr, UIHelper.whiteStyle(this.dpr, 20));
    this.mCloseBtn.setFontStyle("bold");
    this.mCloseBtn.enable = true;
    this.mCloseBtn.setPosition(this.mCloseBtn.width * 0.5 + 5 * this.dpr, 45 * this.dpr);
    this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
    this.moneycomp = new MoneyCompent(this.scene, 190 * this.dpr, 28 * this.dpr, this.dpr, this.zoom);
    this.moneycomp.setHandler(new Handler(this, this.onConvertHandler));
    this.moneycomp.x = w - 20 * this.dpr;
    this.moneycomp.y = this.mCloseBtn.y;

    this.mShelfContainer = this.scene.make.container({ x: (w / 2), y: h }, false).setSize(w, bottomHeight);
    this.mPropContainer = this.scene.make.container(undefined, false);
    this.mCategoriesContainer = this.scene.make.container(undefined, false);
    this.mSubCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.add([this.mShelfBackground, this.mCategoriesContainer, this.mPropContainer]);
    this.add([this.mShelfContainer, this.mSubCategeoriesContainer]);

    this.mSelectItem = new ElementDetail(this.scene, this.render, this.atlas, this.dpr, this.zoom);
    this.mSelectItem.setSize(w, h - this.mShelfContainer.height);
    this.add([this.imgBg, this.tileBg, this.mSelectItem, this.mCloseBtn, this.moneycomp]);
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
        zoom: this.zoom,
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
    this.randomRefreshBtn = new NineSliceButton(this.scene, w * 0.5, this.randomRefeshTime.y, btnWidth, btnHeight, UIAtlasName.uicommon, "button_g", i18n.t("market.refresh"), this.dpr, this.zoom, {
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

    this.refreshIcon = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "iv_coin" }).setScale(0.8);
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
    const cellWidth = 130 * this.dpr;
    const cellHeight = 68 * this.dpr;
    const propGridConfig = {
      x: w / 2,
      y: 0,
      table: {
        width: w,
        height: 224 * this.dpr,
        columns: 3,
        cellWidth,
        cellHeight,
        reuseCellContainer: true,
        zoom: this.zoom,
        mask: false
      },
      scrollMode: 1,
      clamplChildOY: false,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new MarketItem(scene, 0, 0, this.dpr, this.zoom);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item, this.currencyData);
        cellContainer.select = false;
        if (this.mCurItemData && this.mCurItemData.id === item.id) {
          this.mCurItem = cellContainer;
          this.mCurItemData = item;
          cellContainer.select = true;
        }
        return cellContainer;
      },
    };
    this.mPropGrid = new GameGridTable(this.scene, propGridConfig);
    this.mPropGrid.layout();
    this.mPropGrid.on("cellTap", (cell) => {
      this.onSelectItemHandler(cell);
    });
    this.add(this.mPropGrid);
    this.resize(0, 0);
    if (this.mSuperInit) super.init();
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
    const category = subcategory.category;
    if (category.shopName === "gradeshop") {
      this.tileBg.visible = false;
      this.imgBg.visible = true;
    } else {
      this.tileBg.visible = true;
      this.imgBg.visible = false;
    }
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
    this.updateMoneyData();
  }

  private updateMoneyData() {
    let category;
    if (this.mSelectedCategories) {
      const subcategory: any = this.mSelectedCategories.getData("category");// op_def.IMarketCategory
      category = subcategory.category;
    }
    if (category && category.shopName === "gradeshop") {
      this.moneycomp.setMoneyImgs("prestige_assets_icon", "iv_prestige");
      this.moneycomp.setMoneyData(this.reputation, this.reputationCoin);
    } else {
      this.moneycomp.setMoneyImgs("iv_coin", "iv_diamond");
      this.moneycomp.setMoneyData(this.moneyValue, this.diamondValue);
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
    this.queryProp(categories.category.key, subCategories.key, subCategories.shopName);
    this.mPreSubCategoris = subCategories;
    if (this.mPreSubCategorisItem) this.mPreSubCategorisItem.changeNormal();
    gameobject.changeDown();
    this.mPreSubCategorisItem = gameobject;

  }

  private queryProp(category: string, subCategory: string, shopName: string) {
    this.render.renderEmitter(this.key + "_queryProp", { page: 1, category, subCategory, shopName });
  }

  private onSelectItemHandler(obj: any) {// op_client.IMarketCommodity
    const data = obj.getData("item");
    if (!data) return;
    if (this.mCurItem) {
      this.mCurItem.select = false;
    }
    this.mCurItemData = data;
    obj.select = true;
    this.mCurItem = obj;
    this.mSelectItem.setProp(data);
    this.mSelectItem.setData("propdata", data);
    this.mSelectItem.setData("currency", this.currencyData);
    const item = data["item"];
    if (!item.suitType || item.suitType === "") {
      this.setCommodityResource(item);
    } else {
      const content = this.getCommodityResource(item);
      this.setCommodityResource(content);
    }
  }

  private onBuyItemHandler(prop: any) {// op_def.IOrderCommodities
    const itemdata = this.getBuyPackageData();
    itemdata.count = prop.quantity;
    const allPrice = prop.quantity * itemdata.sellingPrice.price;
    let haveValue = 0;
    const coinType = itemdata.sellingPrice.coinType;
    if (coinType === CoinType.DIAMOND) {
      haveValue = this.diamondValue;
    } else if (coinType === CoinType.COIN) {
      haveValue = this.moneyValue;
    } else if (coinType === CoinType.PRESTIGE) {
      haveValue = this.reputationCoin;
    }
    let notice;
    if (prop.level === false && prop.reputationLv === false) {
      notice = i18n.t("market.unlocktobuy");
    }
    if (allPrice > haveValue) {
      if (coinType === CoinType.PRESTIGE) {
        notice = i18n.t("market.reputationless");
      } else {
        notice = i18n.t("market.moneyless");
      }
    }
    if (notice) {
      const tempdata = {
        text: [{ text: notice, node: undefined }]
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
    const propdata: IMarketCommodity = this.mSelectItem.getData("propdata");// op_client.IMarketCommodity
    const currency: ICurrencyLevel = this.mSelectItem.getData("currency");
    const itemdata = { id: null, sellingPrice: null, name: null, shortName: null, count: 1, marketName: undefined, level: undefined, reputationLv: undefined };// op_client.CountablePackageItem.create()
    itemdata.id = propdata.id;
    itemdata.sellingPrice = propdata.price[0];
    itemdata.name = propdata.name;
    itemdata.shortName = propdata.shortName;
    itemdata.marketName = propdata.marketName;
    if (propdata.marketName === "shop") {
      itemdata.level = currency.level >= propdata.limit ? true : false;
    } else if (propdata.marketName === "gradeshop") {
      itemdata.reputationLv = currency.reputationLv >= propdata.limit ? true : false;
    }
    return itemdata;
  }
  private showPropFun(config: any) {// PicPropFunConfig
    this.render.mainPeer.showMediator(ModuleName.PICAPROPFUN_NAME, true, config);
  }
  private getCommodityResource(data: IExtendCountablePackageItem) {
    const content: any = {};
    content.avatar = AvatarSuitType.createAvatarBySn(data.suitType, data.sn, data.slot, data.tag, data.version);
    content.suits = [{ suit_type: data.suitType, sn: data.sn, tag: data.tag, version: data.version }];
    return content;
  }
  private onConvertHandler() {
    this.render.mainPeer.showMediator(ModuleName.PICAPRESTIGECONVERT_NAME, true);
  }
}
