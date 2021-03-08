import { NineSliceButton, GameGridTable, GameScroller, Button, NineSlicePatch, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, CommonBackground, ImageValue, Render, TextButton, UiManager } from "gamecoreRender";
import { DetailDisplay, ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
export class PicaRecastePanel extends PicaBasePanel {
  private mCloseBtn: ButtonEventDispatcher;
  private mBackground: CommonBackground;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoryCon: Phaser.GameObjects.Container;
  private mTopBg: Phaser.GameObjects.Image;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: any;// op_def.IStrPair
  private mPropGrid: GameGridTable;
  private mPropGridBg: Phaser.GameObjects.Graphics;
  private mCategoryScroll: GameScroller;
  private confirmBtn: NineSliceButton;
  private starCountCon: Phaser.GameObjects.Container;
  private starvalue: ImageValue;
  private displayPanel: RecasteDisplayPanel;
  private starCount: number;
  private categoryType: any;
  private mSelectedItemData: op_client.ICountablePackageItem;
  private mSelectedItem: ItemButton;
  private mRecasteItemData: op_client.ICountablePackageItem;
  private labelTipTex: Phaser.GameObjects.Text;
  private tempData: any = {};
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.atlasNames = [UIAtlasName.uicommon];
    this.textures = [{ atlasName: "Recast_aims_icon_bg", folder: "texture" }, { atlasName: "Recast_bg_texture", folder: "texture" }];
    this.key = ModuleName.PICARECASTE_NAME;
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    super.resize(width, height);
    this.mBackground.x = width * 0.5;
    this.mBackground.y = height * 0.5;
    this.mTopBg.x = width * 0.5;
    this.mTopBg.y = this.mTopBg.height * 0.5;
    const categoryConHeight = 79 * this.dpr;
    const topHeight = height - this.mPropGrid.height - categoryConHeight * 0.5 - 47 * this.dpr;
    this.mCategoryCon.setSize(width, 79 * this.dpr);
    this.mCategoryCon.y = topHeight;
    this.mCategoryCon.x = width * 0.5;
    this.mCategoriesBar.y = 40 * this.dpr;
    this.mCategoriesBar.x = -width * 0.5;
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3EE1FF);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.confirmBtn.x = width - this.confirmBtn.width / 2 - 10 * this.dpr;
    this.confirmBtn.y = this.mCategoryCon.y - this.confirmBtn.height / 2 + 25 * this.dpr;
    this.labelTipTex.x = 15 * this.dpr;
    this.labelTipTex.y = this.confirmBtn.y;
    this.displayPanel.x = width * 0.5;
    this.displayPanel.y = topHeight * 0.5 + 17 * this.dpr;
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
  setRecasteResult(data: op_client.CountablePackageItem) {
    if (data) {
      this.mRecasteItemData.count--;
      this.displayPanel.setRecasteItemData(this.mRecasteItemData);
    }
  }
  setCategories(subcategorys: any[]) {// op_def.IStrPair
    this.tempData.subcategory = subcategorys;
    if (!this.mInitialized || !subcategorys) return;
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const capW = 60 * this.dpr;
    const capH = 41 * this.dpr;
    const items = [];
    (<any>this.mCategoryScroll).clearItems();
    const allCategory = { value: i18n.t("common.all"), key: "alltype" };
    subcategorys.unshift(allCategory);
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.render, this.dpr, 1, subcategorys[i].value, 0, 0);
      item.setData("item", subcategorys[i]);
      item.setSize(capW, capH);
      this.mCategoryScroll.addItem(item);
      items[i] = item;
      item.setFontSize(18 * this.dpr);
      item.setFontStyle("bold");
      const lineImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Recast_nav_Select" });
      lineImg.y = 21 * this.dpr;
      item.add(lineImg);
      lineImg.visible = false;
      item.setData("lineImg", lineImg);
    }
    this.mCategoryScroll.Sort();
    this.mCategoryScroll.refreshMask();
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
  }

  onShow() {
    this.setStarData(this.starCount);
    this.setRecasteItemData(this.mShowData);
    this.setCategories(this.tempData.subcategory);
  }
  public setProp(props: any[]) {// op_client.ICountablePackageItem
    props = !props ? [] : props;
    const len = props.length;
    if (len < 18) {
      props = props.concat(new Array(18 - len));
    }
    this.mPropGrid.setItems(props);
  }

  public setStarData(value: number) {
    this.starCount = value;
    if (!this.mInitialized) return;
    this.starvalue.setText(value + "");
  }

  public setRecasteItemData(data: op_client.ICountablePackageItem) {
    this.mRecasteItemData = data;
    this.displayPanel.setRecasteItemData(data);
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
    this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
    this.confirmBtn.off(ClickEvent.Tap, this.onConfirmBtnHandler, this);
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
  queryRecasteList() {
    if (this.mSelectedCategeories) {
      const subCate = this.mSelectedCategeories;
      this.render.renderEmitter(this.key + "_queryrecastelist", { type: subCate.key, star: this.mRecasteItemData.grade });
    }
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
    this.mTopBg = this.scene.make.image({
      key: "Recast_bg_texture"
    }, false);
    this.displayPanel = new RecasteDisplayPanel(this.scene, width, 248 * this.dpr, this.render, this.dpr, this.scale);
    this.mTopBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    // const navbgline = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Recast_nav_line" });
    // navbgline.y = 20 * this.dpr;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mCategoryCon.add(this.mCategoriesBar);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = new ButtonEventDispatcher(this.scene, 0, 0);
    this.mCloseBtn.setSize(100 * this.dpr, 40 * this.dpr);
    this.mCloseBtn.enable = true;
    this.mCloseBtn.x = this.mCloseBtn.width * 0.5 + 10 * this.dpr;
    this.mCloseBtn.y = 45 * this.dpr;
    const closeimg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "back_arrow" });
    closeimg.x = -this.mCloseBtn.width * 0.5 + closeimg.width * 0.5 + 10 * this.dpr;
    const titleTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr, 18) }).setOrigin(0, 0.5);
    titleTex.setFontStyle("bold");
    titleTex.text = i18n.t("furni_bag.recaste");
    titleTex.x = closeimg.x + closeimg.width * 0.5 + 10 * this.dpr;
    this.mCloseBtn.add([closeimg, titleTex]);

    const starbg = new NineSlicePatch(this.scene, 0, -this.dpr, 80 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
      left: 17 * this.dpr,
      top: 0 * this.dpr,
      right: 17 * this.dpr,
      bottom: 0 * this.dpr
    });
    starbg.x = -starbg.width * 0.5;
    this.starvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "Recast_pica star_big", this.dpr, {
      color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
    });
    this.starvalue.setLayout(1);
    this.starvalue.x = starbg.x - starbg.width * 0.5 + 22 * this.dpr;
    this.starCountCon = this.scene.make.container(undefined, false);
    this.starCountCon.setSize(starbg.width, starbg.height);
    this.starCountCon.add([starbg, this.starvalue]);
    this.starCountCon.x = width - 20 * this.dpr;
    this.starCountCon.y = this.mCloseBtn.y;

    const btnwidth = 100 * this.dpr, btnHeight = 40 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr, btnPosY = this.mCategoryCon.y - 25 * this.dpr;
    this.confirmBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.confirm"), "#996600");
    this.labelTipTex = this.scene.make.text({ text: i18n.t("recaste.tip"), style: UIHelper.colorStyle("#FAF916", this.dpr * 14) }).setOrigin(0, 0.5);
    this.mCategoryScroll = new GameScroller(this.scene, {
      x: 0,
      y: 60 * this.dpr,
      width,
      height: 44 * this.dpr,
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
    this.mCategoryCon.add(this.mCategoryScroll);
    this.add([this.mBackground, this.mPropGridBg, this.mTopBg, this.displayPanel, this.mCloseBtn, this.starCountCon, this.mCategoryCon, this.confirmBtn, this.labelTipTex]);
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
        if (this.mSelectedItemData && item && this.mSelectedItemData.id === item.id) {
          cellContainer.isSelect = true;
          this.mSelectedItem = cellContainer;
        }
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
      if (this.mPreCategoryBtn) {
        this.mPreCategoryBtn.changeNormal();
        const preline: any = this.mPreCategoryBtn.getData("lineImg");
        preline.visible = false;
      }
      gameobject.changeDown();
      this.mSelectedCategeories = category;
      this.mPropGrid.setT(0);
      this.queryRecasteList();
      this.mPreCategoryBtn = gameobject;
      const selectlin: any = gameobject.getData("lineImg");
      selectlin.visible = true;
    }
    this.mPropGrid.setT(0);
  }

  private onCloseHandler() {
    this.render.renderEmitter(this.key + "_close");
  }

  private onSelectItemHandler(cell: ItemButton) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (item && this.mSelectedItemData === item || !item) return;
    this.mSelectedItemData = item;
    this.displayPanel.setRecasteTargetData(item);
    if (this.mSelectedItem) this.mSelectedItem.select = false;
    cell.select = true;
    this.mSelectedItem = cell;
  }

  private onConfirmBtnHandler() {
    let notice;
    if (this.mSelectedItemData) {
      if (this.starCount < this.mSelectedItemData.grade) {
        notice = i18n.t("furnicompose.starpicatips");
      } else if (this.mRecasteItemData.count === 0) {
        notice = i18n.t("recaste.counttips");
      } else if (this.mRecasteItemData.id === this.mSelectedItemData.id) {
        notice = i18n.t("recaste.sametips");
      }
    } else {
      notice = i18n.t("recaste.selecttips");
    }
    if (notice) {
      const data = {
        text: [{ text: notice, node: undefined }]
      };
      this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
      return;
    }
    this.render.renderEmitter(this.key + "_queryrecaste", { consumedId: this.mRecasteItemData.id, targetId: this.mSelectedItemData.id });
  }
}

class RecasteDisplayPanel extends Phaser.GameObjects.Container {
  private dpr: number;
  private zoom: number;
  private render: Render;
  private recasteItem: ItemButton;
  private recasteTarget: DetailDisplay;
  private starvalue: ImageValue;
  private nameTex: Phaser.GameObjects.Text;
  private starLevelImg: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, width: number, height: number, render: Render, dpr: number, zoom: number) {
    super(scene);
    this.setSize(width, height);
    this.dpr = dpr;
    this.zoom = zoom;
    this.render = render;
    this.init();
  }

  public setRecasteItemData(data: op_client.ICountablePackageItem) {
    this.recasteItem.setItemData(data, true);
    this.starvalue.setText(data.grade + "");
  }

  public setRecasteTargetData(data: op_client.ICountablePackageItem) {
    this.recasteTarget.displayLoading("loading_ui", Url.getUIRes(this.dpr, "loading_ui"), Url.getUIRes(this.dpr, "loading_ui"), this.dpr / this.zoom);
    const content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
    content.display = data.animationDisplay;
    content.animations = data.animations;
    this.recasteTarget.loadDisplay(content);
    this.starLevelImg.setFrame("Recast_star_big_" + data.grade);
    this.nameTex.text = data.name || data.shortName;
    this.starLevelImg.visible = true;
  }

  protected init() {
    const rightbg = this.scene.make.image({ key: "Recast_aims_icon_bg" });
    rightbg.x = this.width * 0.5 - rightbg.width * 0.5 - 15 * this.dpr;

    this.recasteItem = new ItemButton(this.scene, UIAtlasName.uicommon, "Recast_default_icon_bg", this.dpr, this.zoom, false);
    this.recasteItem.x = -this.width * 0.5 + this.recasteItem.width * 0.5 + 20 * this.dpr;
    this.recasteItem.y = 0;
    const arrowbg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Recast_arrow" });
    arrowbg.x = this.recasteItem.x + this.recasteItem.width * 0.5 + arrowbg.width * 0.5 + 6 * this.dpr;
    arrowbg.y = this.recasteItem.y;
    this.starvalue = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasName.uicommon, "Recast_pica star_small", this.dpr, UIHelper.colorNumberStyle("#ffffff", 20 * this.dpr));
    this.starvalue.x = arrowbg.x - 11 * this.dpr;
    this.starvalue.y = arrowbg.y - 10 * this.dpr;
    this.nameTex = this.scene.make.text({ text: "", style: UIHelper.colorStyle("#FFFF00", 14 * this.dpr) }).setOrigin(0, 0.5);
    this.nameTex.setFontStyle("bold");
    this.nameTex.x = rightbg.x - rightbg.width * 0.5;
    this.nameTex.y = rightbg.y - rightbg.height * 0.5 - 18 * this.dpr;
    this.starLevelImg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "Recast_star_big_1" }).setOrigin(1, 0.5);
    this.starLevelImg.x = rightbg.x + rightbg.width * 0.5 - this.starLevelImg.width * 0.5 - 12 * this.dpr;
    this.starLevelImg.y = rightbg.y - rightbg.height * 0.5 + this.starLevelImg.height * 0.5 + 8 * this.dpr;
    this.starLevelImg.visible = false;
    this.recasteTarget = new DetailDisplay(this.scene, this.render);
    this.recasteTarget.setFixedScale(2 * this.dpr / this.zoom);
    this.recasteTarget.setComplHandler(new Handler(this, () => {
      this.recasteTarget.visible = true;
    }));
    this.recasteTarget.setTexture(UIAtlasName.uicommon, "bag_nothing", 1);
    this.recasteTarget.setNearest();
    this.recasteTarget.x = rightbg.x;
    this.recasteTarget.y = rightbg.y;
    this.add([rightbg, this.recasteItem, this.recasteTarget, arrowbg, this.starvalue, this.nameTex, this.starLevelImg]);
  }

}
