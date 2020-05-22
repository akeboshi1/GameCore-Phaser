import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { ElementDetail } from "./ElementDetail";
import { i18n } from "../../i18n";
import { op_client, op_def } from "pixelpai_proto";
import { NinePatchButton } from "../components/ninepatch.button";
import { CheckboxGroup } from "../components/checkbox.group";
import { TextButton } from "./TextButton";
import { MarketItem } from "./item";
import { TabButton } from "../components/tab.button";
import { Font } from "../../utils/font";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
export class MarketPanel extends BasePanel {
  private readonly key = "market";
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
  private mBackgroundColor: Phaser.GameObjects.Graphics;
  private mShelfBackground: Phaser.GameObjects.Graphics;
  private mSubCategorisScroll: GameGridTable;
  private mItems: MarketItem[];
  private mPreSubCategoris: TextButton;
  private mPropGrid: GameGridTable;
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
    // if (shelfHeight > height / 2) {
    //   shelfHeight = height / 2;
    // }
    this.mBackgroundColor.setInteractive(new Phaser.Geom.Rectangle(0, 0, width * zoom, height * zoom), Phaser.Geom.Rectangle.Contains);

    this.mShelfContainer.setSize(width, shelfHeight);
    this.mShelfContainer.setPosition(0, height - this.mShelfContainer.height);

    this.mShelfBackground.clear();
    this.mShelfBackground.fillStyle(0x02ccff);
    this.mShelfBackground.fillRect(0, 0, this.mShelfContainer.width, this.mShelfContainer.height);
    this.mShelfBackground.y = this.mSubCategeoriesContainer.y + 43 * this.dpr * zoom;

    this.mSelectItem.setSize(width, height - this.mShelfContainer.height);
    // this.mSelectItem.y = 45 * this.dpr;
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
    const config = {
      left: 10 * this.dpr,
      top: 13 * this.dpr,
      right: w - 2 - 10 * this.dpr,
      bottom: h - 2 - 13 * this.dpr
    };
    const group: CheckboxGroup = new CheckboxGroup();
    const zoom = this.mWorld.uiScale;
    const capW = 77 * this.dpr * zoom;
    const capH = 38 * this.dpr * zoom;
    for (let i = 0; i < categorys.length; i++) {
      const btn = new TabButton(this.scene, i * 80 * this.dpr * zoom + capW / 2, capH / 2, capW, capH, this.key, "categories", categorys[i].category.value, config);
      // btn.removeAllListeners();
      btn.setTextStyle({
        fontSize: 18 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
      });
      this.mTabs[i] = btn;
      btn.setData("category", categorys[i]);
      // this.add(btn);
    }
    this.mCategoriesContainer.setSize(this.mTabs.length * capW, capH);
    this.mShelfContainer.add(this.mTabs);
    // this.mSubCategeoriesContainer.y = this.mCategoriesContainer.height;
    this.mCategoriesBar.y = this.mCategoriesContainer.height + this.mShelfContainer.y;
    this.mSubCategeoriesContainer.addAt(this.mCategoriesBar, 0);
    this.mPropContainer.y = this.mSubCategeoriesContainer.y + 43 * this.dpr * zoom + this.mSubCategeoriesContainer.height + 9 * this.dpr;
    this.mShelfBackground.y = this.mSubCategeoriesContainer.y + 43 * this.dpr * zoom;
    this.mSubCategorisScroll.y = this.mCategoriesBar.y + (33 * this.dpr);
    this.mPropGrid.y = this.mCategoriesBar.y + this.mSubCategeoriesContainer.height + 122 * this.dpr * zoom;
    this.mPropGrid.layout();
    this.mSubCategorisScroll.layout();
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
    // const zoom = this.mWorld.uiScale;
    // for (let i = 0; i < commodities.length; i++) {
    //   const item = new MarketItem(this.scene, Math.floor(i / 3) * (135 * this.dpr * zoom) + (72 * this.dpr * zoom), Math.floor(i % 3) * (68 * this.dpr * zoom) + 30 * this.dpr * zoom, this.dpr, zoom);
    //   item.setProp(commodities[i]);
    //   item.on("select", this.onSelectItemHandler, this);
    //   this.mItems[i] = item;
    // }
    // this.mPropContainer.add(this.mItems);
    this.mPropGrid.setItems(commodities);
    this.mPropGrid.layout();
    if (commodities.length > 0) this.onSelectItemHandler(commodities[0]);
  }

  public setCommodityResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE) {
    if (this.mSelectItem) {
      this.mSelectItem.setResource(content);
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

  protected preload() {
    // this.scene.load.atlas(this.key, Url.getUIRes(this.dpr, "market/market.png"), Url.getUIRes(this.dpr, "market/market.json"));
    this.addAtlas(this.key, "market/market.png", "market/market.json");
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

    const frame = this.scene.textures.getFrame(this.key, "bg.png");
    const countW = Math.ceil(w / (frame.width * zoom));
    const countH = Math.ceil((h - this.mShelfContainer.height + frame.height * zoom) / (frame.height * zoom));
    for (let i = 0; i < countW; i++) {
      for (let j = 0; j < countH; j++) {
        const bg = this.scene.make.image({
          x: i * frame.width * zoom,
          y: j * frame.height * zoom,
          key: this.key,
          frame: "bg.png"
        }, false).setScale(zoom);
        this.add(bg);
      }
    }

    this.mShelfBackground = this.scene.make.graphics(undefined, false);

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow.png",
      x: 21 * this.dpr,
      y: 30 * this.dpr
    }).setInteractive().setScale(zoom);

    this.mPropContainer = this.scene.make.container(undefined, false);
    this.mCategoriesContainer = this.scene.make.container(undefined, false);
    this.mSubCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.add([this.mShelfBackground, this.mCategoriesContainer, this.mPropContainer]);
    this.add([this.mShelfContainer, this.mSubCategeoriesContainer]);

    this.mSelectItem = new ElementDetail(this.scene, this.mWorld, this.key, this.dpr, this.mWorld.uiScale);
    this.mSelectItem.setSize(w, h - this.mShelfContainer.height);

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
    const config: GridTableConfig = {
      x: w / 2,
      // y: 0,
      // width: w,
      // height: capH,
      table: {
        width: w,
        height: capH,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        cellOriginX: 0,
        cellOriginY: 0,
      },
      scrollMode: 1,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new TextButton(scene, this.dpr, zoom);
          // cellContainer.width = capW;
          // cellContainer.height = capH;
          this.add(cellContainer);
        }
        cellContainer.setText(item.value);
        // cellContainer.setSize(width, height);
        cellContainer.setData({ item });
        if (!this.mPreSubCategoris) {
          this.onSelectSubCategoryHandler(cellContainer);
        }
        return cellContainer;
      },
    };
    this.mSubCategorisScroll = new GameGridTable(this.scene, config);
    this.mSubCategorisScroll.on("cellTap", (cell, index) => {
      this.onSelectSubCategoryHandler(cell);
    });
    this.add(this.mSubCategorisScroll.table);

    const propFrame = this.scene.textures.getFrame(this.key, "border.png");
    const cellWidth = propFrame.width * zoom + 10 * this.dpr;
    const cellHeight = propFrame.height * zoom + 10 * this.dpr;
    const propGridConfig: GridTableConfig = {
      x: w / 2,
      y: 1050 + (41 * this.dpr * zoom) / 2,
      // y: 0,
      table: {
        width: w - 20 * this.dpr * zoom,
        height: 224 * this.dpr * zoom,
        columns: 3,
        cellWidth,
        cellHeight,
        reuseCellContainer: true,
        // mask: false,
        cellOriginX: 0,
        cellOriginY: 0
      },
      scrollMode: 1,
      clamplChildOY: false,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new MarketItem(scene, 0, 0, this.dpr, zoom);
          // cellContainer.width = capW;
          // cellContainer.height = capH;
          this.add(cellContainer);
        }
        // cellContainer.setSize(width, height);
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
    const categories: op_def.IMarketCategory = this.mSelectedCategories.getData("category");
    if (!categories) {
      return;
    }
    const subCategories = gameobject.getData("item");
    if (!subCategories) {
      return;
    }
    if (this.mPreSubCategoris) {
      this.mPreSubCategoris.changeNormal();
    }

    this.queryProp(categories.category.key, subCategories.key);
    gameobject.changeDown();
    this.mPreSubCategoris = gameobject;
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
