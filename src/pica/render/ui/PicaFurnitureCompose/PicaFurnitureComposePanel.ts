import { NineSliceButton, GameGridTable, GameScroller, TabButton, Button, BBCodeText, Text, NineSlicePatch, ClickEvent, NinePatchTabButton } from "apowophaserui";
import { BackgroundScaleButton, CheckboxGroup, CommonBackground, DynamicImage, DynamicImageValue, ImageValue, TextButton, ThreeSlicePath, UiManager } from "gamecoreRender";
import { DetailDisplay, ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { AvatarSuitType, ModuleName } from "structure";
import { Coin, Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
export class PicaFurnitureComposePanel extends PicaBasePanel {
  private mCloseBtn: Button;
  private mBackground: CommonBackground;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoryCon: Phaser.GameObjects.Container;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: any;// op_def.IStrPair
  private mPropGrid: GameGridTable;
  private mPropGridBg: Phaser.GameObjects.Graphics;
  private mCategoryScroll: GameScroller;
  private composeBtn: NineSliceButton;
  private starCon: Phaser.GameObjects.Container;
  private starvalue: ImageValue;
  private starCount: number;
  private mSelectedItemData: op_client.CountablePackageItem[];
  private subCategoryType: number = 1;
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.atlasNames = [UIAtlasName.uicommon];
    this.key = ModuleName.PICAFURNITURECOMPOSE_NAME;
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    super.resize(width, height);
    this.mBackground.x = width * 0.5;
    this.mBackground.y = height * 0.5;
    this.mCategoryCon.setSize(width, 79 * this.dpr);
    this.mCategoryCon.y = height - this.mPropGrid.height - this.mCategoryCon.height * 0.5 - 47 * this.dpr;
    this.mCategoryCon.x = width * 0.5;
    this.mCategoriesBar.y = 40 * this.dpr;
    this.mCategoriesBar.x = -width * 0.5;
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3EE1FF);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x06B5D5);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);

    this.composeBtn.x = width - this.composeBtn.width / 2 - 10 * this.dpr;
    this.composeBtn.y = this.mCategoryCon.y - this.composeBtn.height / 2;

    this.mPropGridBg.clear();
    this.mPropGridBg.fillStyle(0x7DE5FE);
    this.mPropGridBg.fillRect(0, 0, this.mPropGrid.width, this.mPropGrid.height + 10 * this.dpr);
    this.mPropGridBg.y = height - this.mPropGrid.height - 4 * this.dpr;
    this.mPropGrid.x = width / 2 + 3 * this.dpr;
    this.mPropGrid.y = height - this.mPropGrid.height * 0.5;
    this.mPropGrid.layout();
    this.mPropGrid.resetMask();
    this.mCategoryScroll.refreshMask();
    this.setSize(width, height);
    this.setInteractive();
  }

  setCategories() {
    const subcategorys = [{ name: i18n.t("onestar"), value: 1 }, { name: i18n.t("twostar"), value: 2 }, { name: i18n.t("threestar"), value: 3 }, { name: i18n.t("fourstar"), value: 4 }];
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const capW = 60 * this.dpr;
    const capH = 41 * this.dpr;
    const items = [];
    (<any>this.mCategoryScroll).clearItems();
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, 1, subcategorys[i].name, 0, 0);
      item.setData("item", subcategorys[i]);
      item.setSize(capW, capH);
      this.mCategoryScroll.addItem(item);
      items[i] = item;
      item.setFontSize(18 * this.dpr);
      item.setFontStyle("bold");
    }
    this.mCategoryScroll.Sort();
    this.mCategoryScroll.refreshMask();
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
  }

  public setGridProp(props: any[]) {// op_client.ICountablePackageItem
    props = !props ? [] : props;
    this.mPropGrid.setItems(props);
    this.mPropGrid.setT(0);
    this.updateSelectItemDatas(props);
  }

  public updateGridProp(props: any[]) {
    props = !props ? [] : props;
    this.mPropGrid.setItems(props);
    this.updateSelectItemDatas(props);
  }

  public setStarData(value: number) {
    this.starCount = value;
    if (!this.mInitialized) return;
    this.starvalue.setText(value + "");
  }

  public updateSelectItemDatas(props: any[]) {
    const tempArr = [];
    for (const item of this.mSelectedItemData) {
      for (const prop of props) {
        if (item && prop.indexId === item.indexId) {
          tempArr.push(prop);
        }
      }
    }
    this.mSelectedItemData.length = 0;
    this.mSelectedItemData = tempArr;
  }

  public setComposeResult(reward: op_client.ICountablePackageItem) {

  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
    this.composeBtn.on(ClickEvent.Tap, this.onComposeBtnHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
    this.composeBtn.off(ClickEvent.Tap, this.onComposeBtnHandler, this);
  }

  destroy() {
    if (this.mCategoryScroll) {
      this.mCategoryScroll.destroy();
    }
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    super.destroy();
  }

  queryRefreshPackage() {
    this.queryPackege();
  }

  public onComposeHandler(ids: string[]) {// op_client.CountablePackageItem
    this.mCategoryScroll.addListen();
    this.render.renderEmitter(this.key + "_quercompose", ids);
  }
  public onComposeFailedHandler(prop: any) {
    this.mCategoryScroll.addListen();
  }

  protected onInitialized() {
    if (this.starCount) {
      this.starvalue.setText(this.starCount + "");
    }
  }

  protected init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
    this.mCloseBtn.setPosition(21 * this.dpr, 35 * this.dpr);
    this.mCloseBtn.setInteractive(new Phaser.Geom.Rectangle(-28 * this.dpr, -20 * this.dpr, 56 * this.dpr, 40 * this.dpr), Phaser.Geom.Rectangle.Contains);
    const starbg = new NineSlicePatch(this.scene, 0, -this.dpr, 190 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
      left: 17 * this.dpr,
      top: 0 * this.dpr,
      right: 17 * this.dpr,
      bottom: 0 * this.dpr
    });
    starbg.x = -starbg.width * 0.5;
    const moneyline = this.scene.make.image({ x: starbg.x, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_division" }, false);
    this.starvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_silver", this.dpr, {
      color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
    });
    this.starvalue.setLayout(1);
    this.starvalue.x = starbg.x - starbg.width * 0.5 + 22 * this.dpr;
    this.starCon = this.scene.make.container(undefined, false);
    this.starCon.setSize(starbg.width, starbg.height);
    this.starCon.add([starbg, moneyline, this.starvalue]);
    this.starCon.x = width - 20 * this.dpr;
    this.starCon.y = this.mCloseBtn.y;

    const btnwidth = 100 * this.dpr, btnHeight = 40 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr, btnPosY = this.mCategoryCon.y - 25 * this.dpr;
    this.composeBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.use"), "#996600");

    this.mCategoryScroll = new GameScroller(this.scene, {
      x: 0,
      y: 60 * this.dpr,
      width,
      height: 41 * this.dpr,
      zoom: this.scale,
      orientation: 1,
      dpr: this.dpr,
      space: 10 * this.dpr,
      selfevent: true,
      cellupCallBack: (gameobject) => {
        this.onSelectSubCategoryHandler(gameobject);
      }
    });
    this.mPropGridBg = this.scene.make.graphics(undefined, false);
    this.mCategoryCon.add([this.mCategoriesBar, this.mCategoryScroll]);
    this.add([this.mBackground, this.mPropGridBg, this.mCloseBtn, this.starCon, this.mCategoryCon, this.composeBtn]);

    const propFrame = this.scene.textures.getFrame(UIAtlasName.uicommon, "bag_icon_common_bg");
    const capW = (propFrame.width) + 9 * this.dpr;
    const capH = (propFrame.height) + 9 * this.dpr;
    const tableConfig = {
      x: 0,
      y: 0,
      table: {
        width,
        height: 231 * this.dpr,
        columns: 3,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        zoom: this.scale,
        mask: false
      },
      scrollMode: 1,
      clamplChildOY: false,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new ItemButton(scene, UIAtlasName.uicommon, "bag_icon_common_bg", this.dpr, this.scale, false);
        }
        cellContainer.setData({ item });
        cellContainer.setItemData(item);
        return cellContainer;
      },
    };
    this.mPropGrid = new GameGridTable(this.scene, tableConfig);
    this.mPropGrid.layout();
    this.mPropGrid.on("cellTap", (cell) => {
      if (cell) {
        this.onSelectItemHandler(cell);
      }
    });
    this.add(this.mPropGrid);
    this.resize(0, 0);
    super.init();
  }

  private createNineButton(x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, color?: string) {
    const btn = new NineSliceButton(this.scene, x, y, width, height, key, frame, text, this.dpr, 1, {
      left: 14 * this.dpr,
      top: 14 * this.dpr,
      right: 15 * this.dpr,
      bottom: 14 * this.dpr
    });
    if (text) {
      btn.setTextStyle({
        color,
        fontSize: 16 * this.dpr,
        fontFamily: Font.DEFULT_FONT
      });
      btn.setFontStyle("bold");
    }

    return btn;
  }

  private onSelectSubCategoryHandler(gameobject: TextButton) {
    const category: any = gameobject.getData("item");// op_def.IStrPair
    if (category) {
      this.mPreCategoryBtn.changeNormal();
      gameobject.changeDown();
      this.mSelectedCategeories = category;
      this.queryPackege();
      this.mPreCategoryBtn = gameobject;
    }
    this.mPropGrid.setT(0);
  }

  private onCloseHandler() {
    this.render.renderEmitter(this.key + "_close");
  }

  private queryPackege() {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter(this.key + "_queryPackage", this.subCategoryType);
    }
  }

  private onSelectItemHandler(cell: ItemButton) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (item && this.mSelectedItemData === item || this.mSelectedItemData && !item) return;

  }

  private onComposeBtnHandler() {
    this.mCategoryScroll.removeListen();
    if (this.mSelectedItemData && this.mSelectedItemData.length === 5) {

    }
  }
}
