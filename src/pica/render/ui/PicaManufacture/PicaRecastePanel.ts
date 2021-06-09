import { NineSliceButton, GameGridTable, GameScroller, Button, NineSlicePatch, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, Render, TextButton, UiManager } from "gamecoreRender";
import { CommonBackground, DetailBubble, DetailDisplay, ImageValue, ItemButton, PicaItemTipsPanel, UITools } from "picaRender";
import { UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def, op_pkt_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { ICountablePackageItem, IFurnitureGrade } from "picaStructure";
export class PicaRecastePanel extends Phaser.GameObjects.Container {
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
  private displayPanel: RecasteDisplayPanel;
  private starCount: number;
  private categoryType: any;
  private mSelectedItemData: op_client.ICountablePackageItem;
  private mSelectedItem: ItemButton;
  private mRecasteItemData: op_client.ICountablePackageItem;
  private labelTipTex: Phaser.GameObjects.Text;
  private dpr: number;
  private zoom: number;
  private recastData: any;
  private key: string;
  private isBag: boolean = true;

  private recastBtn: NineSliceButton;
  private reselectBtn: NineSliceButton;
  private needStar: ImageValue;
  private costStar: number;
  private gradeStars: any;
  constructor(scene: Phaser.Scene, protected render: Render, width: number, height: number, dpr: number, zoom: number) {
    super(scene);
    this.setSize(width, height);
    this.dpr = dpr;
    this.zoom = zoom;
    this.key = ModuleName.PICAMANUFACTURE_NAME;
    this.init();
  }

  resize(w: number, h: number) {
    const width = w;
    const height = h;
    this.setSize(w, h);
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
    this.labelTipTex.visible = false;
    this.displayPanel.x = width * 0.5;
    this.displayPanel.y = topHeight * 0.5 + 17 * this.dpr;
    this.mPropGridBg.clear();
    this.mPropGridBg.fillStyle(0x7DE5FE);
    this.mPropGridBg.fillRect(0, 0, this.mPropGrid.width, this.mPropGrid.height + 10 * this.dpr);
    this.mPropGridBg.y = height - this.mPropGrid.height - 6 * this.dpr;
    this.mPropGrid.x = width / 2 + 3 * this.dpr;
    this.mPropGrid.y = height - this.mPropGrid.height * 0.5;
    this.mPropGrid.layout();
    this.mPropGrid.resetMask();
    this.mCategoryScroll.refreshMask();

    this.recastBtn.x = this.confirmBtn.x;
    this.recastBtn.y = this.confirmBtn.y;
    this.reselectBtn.x = this.confirmBtn.x - this.confirmBtn.width - 5 * this.dpr;
    this.reselectBtn.y = this.confirmBtn.y;
    this.needStar.x = this.confirmBtn.x - 5 * this.dpr;
    this.needStar.y = this.confirmBtn.y - this.confirmBtn.height * 0.5 - this.needStar.height * 0.5 - 10 * this.dpr;
    this.setSize(width, height);
    this.setInteractive();
  }
  setRecasteResult(data: op_client.CountablePackageItem) {
    if (data) {
      this.mRecasteItemData.count--;
      const grade = this.getSpendGrade(this.mRecasteItemData.grade);
      this.costStar = grade.forgeCost;
      this.displayPanel.setRecasteItemData(this.mRecasteItemData);
      this.queryRecasteList();
      this.queryPackege();
    }
  }
  setCategories(subcategorys: any[]) {// op_def.IStrPair
    if (!subcategorys) return;
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const capW = 60 * this.dpr;
    const capH = 41 * this.dpr;
    const items = [];
    (<any>this.mCategoryScroll).clearItems();
    const allName = this.isBag ? i18n.t("common.bag") : i18n.t("common.recast");
    const allCategory = { value: allName, key: "alltype" };
    subcategorys.unshift(allCategory);
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, 1, subcategorys[i].value, 0, 0);
      item.setData("item", subcategorys[i]);
      item.setSize(capW, capH);
      this.mCategoryScroll.addItem(item);
      items[i] = item;
      item.setFontSize(18 * this.dpr);
      item.setFontStyle("bold");
      const lineImg = this.scene.make.image({ key: UIAtlasName.recast, frame: "Recast_nav_Select" });
      lineImg.y = 21 * this.dpr;
      item.add(lineImg);
      lineImg.visible = false;
      lineImg.displayHeight = 4 * this.dpr;
      item.setData("lineImg", lineImg);
    }
    this.mCategoryScroll.Sort();
    this.mCategoryScroll.refreshMask();
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
  }

  public setProp(props: any[]) {// op_client.ICountablePackageItem
    props = !props ? [] : props;
    const len = props.length;
    if (len < 18) {
      props = props.concat(new Array(18 - len));
    }
    this.mPropGrid.setItems(props);
  }

  public setStarData(value: number, gradeDatas: any) {
    this.starCount = value;
    this.gradeStars = gradeDatas;
  }

  public setRecasteItemData(data: op_client.ICountablePackageItem, blueprint: boolean) {
    if (data && typeof data === "object") {
      this.mRecasteItemData = data;
      const grade = this.getSpendGrade(data.grade);
      this.displayPanel.setRecasteItemData(data);
      this.costStar = grade.forgeCost;
      if (blueprint) this.onDisplayPanelHandler("blueprint", true);
    } else {
      this.onDisplayPanelHandler("itembutton");
      this.displayPanel.setRecasteItemData(undefined);
    }
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
  protected init() {
    const width = this.width;
    const height = this.height;
    this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
    this.mTopBg = this.scene.make.image({
      key: "Recast_bg_texture"
    }, false);
    this.displayPanel = new RecasteDisplayPanel(this.scene, width, 248 * this.dpr, this.key, this.render, this.dpr, this.scale);
    this.displayPanel.setHandler(new Handler(this, this.onDisplayPanelHandler));
    this.mTopBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mCategoryCon.add(this.mCategoriesBar);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

    const btnwidth = 100 * this.dpr, btnHeight = 40 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr, btnPosY = this.mCategoryCon.y - 25 * this.dpr;
    this.confirmBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("business_street.select"), "#996600");
    this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnHandler, this);
    this.labelTipTex = this.scene.make.text({ text: i18n.t("recaste.tip"), style: UIHelper.colorStyle("#FAF916", this.dpr * 14) }).setOrigin(0, 0.5);
    this.mCategoryScroll = new GameScroller(this.scene, {
      x: 0,
      y: 60 * this.dpr,
      width,
      height: 44 * this.dpr,
      zoom: this.zoom,
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
    this.add([this.mBackground, this.mPropGridBg, this.mTopBg, this.displayPanel, this.mCategoryCon, this.confirmBtn, this.labelTipTex]);
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

    this.recastBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.recast"), "#996600");
    this.recastBtn.on(ClickEvent.Tap, this.onRecastBtnHandler, this);
    this.recastBtn.setVisible(false);

    this.reselectBtn = this.createNineButton(this.confirmBtn.x - btnwidth - 10 * this.dpr, this.confirmBtn.y, btnwidth, btnHeight, UIAtlasName.uicommon, "red_btn", i18n.t("common.reselect"), "#ffffff");
    this.reselectBtn.on(ClickEvent.Tap, this.onReselectBtnHandler, this);
    this.reselectBtn.setVisible(false);

    this.needStar = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasName.recast, "Recast_pica star_small", this.dpr, UIHelper.colorNumberStyle("#ffffff", 20 * this.dpr));
    this.needStar.x = this.confirmBtn.x;
    this.needStar.y = this.confirmBtn.y - this.confirmBtn.height * 0.5 - this.needStar.height * 0.5 - 10 * this.dpr;
    this.add([this.recastBtn, this.reselectBtn, this.needStar]);

    this.resize(0, 0);
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
      this.mPreCategoryBtn = gameobject;
      const selectlin: any = gameobject.getData("lineImg");
      selectlin.visible = true;
      selectlin.setFrame(this.isBag ? "Recast_nav_Select" : "Recast_nav_Select_1");
      if (this.isBag) {
        this.queryPackege();
      } else {
        this.queryRecasteList();
      }
    }
    this.mPropGrid.setT(0);
  }
  private queryPackege() {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter(this.key + "_queryPackage", this.mSelectedCategeories.key);
    }
  }
  private onSelectItemHandler(cell: ItemButton) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (item && this.mSelectedItemData === item || !item) return;
    this.mSelectedItemData = item;
    if (this.isBag) {
      const grade = this.getSpendGrade(item.grade);
      this.displayPanel.setRecasteItemData(item);
      this.costStar = grade.forgeCost;
      this.mRecasteItemData = item;
      this.needStar.setText(this.costStar + "");
      this.mSelectedItemData = undefined;// 当选择要重筑的东西时，重铸的目标清空，否则提示语句有bug
    } else this.displayPanel.setRecasteTargetData(item);
    if (this.mSelectedItem) this.mSelectedItem.select = false;
    cell.select = true;
    this.mSelectedItem = cell;
  }
  private getSpendGrade(grade): IFurnitureGrade {
    return this.gradeStars[grade];
  }
  private clearRecastData() {
    this.mRecasteItemData = undefined;
    this.mSelectedItemData = undefined;
    this.mSelectedItem = undefined;
  }
  private onConfirmBtnHandler() {
    let notice;
    if (!this.mRecasteItemData) {
      notice = i18n.t("recaste.tip");
    } else if (this.mRecasteItemData.count === 0) {
      notice = i18n.t("recaste.counttips");
      this.displayPanel.setRecasteItemData(undefined);
    } else {
      this.reselectBtn.setVisible(true);
      this.confirmBtn.setVisible(false);
      this.recastBtn.setVisible(true);
      this.onDisplayPanelHandler("blueprint", true);
    }

    if (notice) {
      const data = {
        text: [{ text: notice, node: undefined }]
      };
      this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
      return;
    }

  }
  private onRecastBtnHandler() { // 开始重铸
    let notice;
    if (this.mSelectedItemData !== undefined) {
      if (this.starCount < this.costStar) {
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
    this.displayPanel.playAnimation2();
    // this.needStar.setText("0");
    this.reselectBtn.setVisible(false);
    this.confirmBtn.setVisible(true);
    this.recastBtn.setVisible(false);
    // this.onDisplayPanelHandler("itembutton");
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3EE1FF);
    this.mCategoriesBar.fillRect(0, 0, this.width, 40 * this.dpr);
    this.mPropGridBg.clear();
    this.mPropGridBg.fillStyle(0x7DE5FE);
    this.mPropGridBg.fillRect(0, 0, this.width, this.mPropGrid.height + 10 * this.dpr);
    this.isBag = true;
    this.render.renderEmitter(this.key + "_queryRecastCategories");
    return;
  }
  private onReselectBtnHandler() {

    this.displayPanel.clearDisplay();
    this.clearRecastData();
    this.needStar.setText("0");
    this.reselectBtn.setVisible(false);
    this.confirmBtn.setVisible(true);
    this.recastBtn.setVisible(false);
    // 停止动效
    this.displayPanel.stopAllAnimation();
    // 下页面变化
    this.onDisplayPanelHandler("itembutton");
    return;
  }

  private onDisplayPanelHandler(tag: string, data?: any) {
    if (tag === "itembutton") {
      this.mCategoriesBar.clear();
      this.mCategoriesBar.fillStyle(0x3EE1FF);
      this.mCategoriesBar.fillRect(0, 0, this.width, 40 * this.dpr);
      this.mPropGridBg.clear();
      this.mPropGridBg.fillStyle(0x7DE5FE);
      this.mPropGridBg.fillRect(0, 0, this.width, this.mPropGrid.height + 10 * this.dpr);
      this.isBag = true;
      this.clearRecastData();
    } else if (tag === "blueprint") {
      if (!data) {
        const notice = i18n.t("recaste.selecttips");
        const tempdata = {
          text: [{ text: notice, node: undefined }]
        };
        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, tempdata);
        return;
      }
      this.mCategoriesBar.clear();
      this.mCategoriesBar.fillStyle(0xC6BDF6);
      this.mCategoriesBar.fillRect(0, 0, this.width, 40 * this.dpr);
      this.mPropGridBg.clear();
      this.mPropGridBg.fillStyle(0xC6BDF6);
      this.mPropGridBg.fillRect(0, 0, this.width, this.mPropGrid.height + 10 * this.dpr);
      this.isBag = false;
      UIHelper.playtPosXTween(this.scene, this.mCategoryCon, this.width * 1.5, this.width * 0.5, 500, "liner");
      UIHelper.playtPosXTween(this.scene, this.mPropGridBg, this.width, this.width * 0, 500, "liner");
      UIHelper.playtPosXTween(this.scene, this.mPropGrid, this.width * 1.5, this.width * 0.5, 500, "liner");
      this.displayPanel.playAnimation1();
    }
    this.render.renderEmitter(this.key + "_queryRecastCategories");
  }
}

class RecasteDisplayPanel extends Phaser.GameObjects.Container {
  private dpr: number;
  private zoom: number;
  private render: Render;
  private recasteItem: ItemButton;
  private recasteTarget: ItemButton;
  private send: Handler;

  private key: string;
  private bgring1: Phaser.GameObjects.Image;
  private bgring2: Phaser.GameObjects.Image;
  private bgring3: Phaser.GameObjects.Image;
  private bgring4: Phaser.GameObjects.Image;
  private bgring5: Phaser.GameObjects.Image;
  private tween1: Phaser.Tweens.Tween;
  private tween2: Phaser.Tweens.Tween;
  private tween3: Phaser.Tweens.Tween;
  private tween4: Phaser.Tweens.Tween;
  private tween5: Phaser.Tweens.Tween;
  private canPlay: boolean = false;
  private timerID: any;
  constructor(scene: Phaser.Scene, width: number, height: number, key: string, render: Render, dpr: number, zoom: number) {
    super(scene);
    this.setSize(width, height);
    this.dpr = dpr;
    this.zoom = zoom;
    this.render = render;
    this.key = key;
    this.init();
  }

  public setHandler(send: Handler) {
    this.send = send;
  }
  public setRecasteItemData(data: op_client.ICountablePackageItem) {
    if (!data) {
      this.clearDisplay();
      return;
    }
    this.recasteItem.setItemData(data, true);
  }

  public clearDisplay() {
    this.recasteItem.setAlpha(1);
    this.recasteTarget.setVisible(false);
    // this.recasteItem.setItemData(undefined);
    this.recasteTarget.setItemData(undefined);
    // this.recasteItem.setVisible(true);
    // this.recasteTarget.setVisible(false);
  }
  public setRecasteTargetData(data: ICountablePackageItem) {
    this.recasteTarget.setItemData(data, true);
    this.recasteItem.setAlpha(0);
    this.recasteTarget.setVisible(true);
  }
  public playAnimation1() {
    this.playAnimation();
    this.playTween1();
  }
  public playAnimation2() {
    this.playAnimation();
    this.playTween2();

  }

  public stopAllAnimation() {
    this.stopAnimation();
    this.stopTweens();
  }
  update() {
    if (this.canPlay) {
      this.bgring1.rotation += 0.08;// 0.0833333
      this.bgring2.rotation -= 0.05;// 0.055555
      this.bgring3.rotation -= 0.08;// 0.0833333
    }
  }
  protected init() {
    this.recasteItem = new ItemButton(this.scene, UIAtlasName.recast, "", this.dpr, this.zoom, true);
    this.recasteItem.setShowTips(false);
    this.recasteItem.x = 0;
    this.recasteItem.y = 0;
    this.recasteItem.BGVisible = false;
    this.recasteItem.onlyIcon();
    this.recasteTarget = new ItemButton(this.scene, UIAtlasName.recast, "", this.dpr, this.zoom, true);
    this.recasteTarget.setShowTips(false);
    this.recasteTarget.x = 0;
    this.recasteTarget.y = 0;
    this.recasteTarget.BGVisible = false;
    this.recasteTarget.onlyIcon();

    this.add([this.recasteItem, this.recasteTarget]);
    this.clearDisplay();

    this.bgring1 = this.scene.make.image({ key: UIAtlasName.recast, frame: "recast_effect_1" });
    this.bgring2 = this.scene.make.image({ key: UIAtlasName.recast, frame: "recast_effect_2" });
    this.bgring3 = this.scene.make.image({ key: UIAtlasName.recast, frame: "recast_effect_3" });
    this.bgring4 = this.scene.make.image({ key: UIAtlasName.recast, frame: "recast_effect_4" });
    this.bgring5 = this.scene.make.image({ key: UIAtlasName.recast, frame: "recast_no_effect" });
    this.add([this.bgring1, this.bgring2, this.bgring3, this.bgring4, this.bgring5]);

    this.tween1 = this.scene.tweens.add({
      targets: this.bgring4,
      rotation: 1.13,
      ease: "Linear",
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    this.tween1.stop();
    this.tween2 = this.scene.tweens.add({
      targets: this.bgring4,
      rotation: 6.28,
      ease: "Linear",
      duration: 1500,
      yoyo: false,
      repeat: 0,
      onComplete: () => {
        // 停止动画
        this.stopAllAnimation();
        this.render.renderEmitter(this.key + "_queryrecaste", { consumedId: this.recasteItem.itemData.id, targetId: this.recasteTarget.itemData.id });
        this.clearDisplay();
      },
    });
    this.tween2.stop();

    this.tween3 = this.scene.tweens.add({
      targets: this.recasteItem,
      y: 15,
      duration: 200,
      ease: "linear",
      yoyo: true,
      delay: 100,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.recasteTarget,
          y: 12,
          duration: 100,
          ease: "linear",
          yoyo: true,
          repeat: 2,
          delay: 0,
          repeatDelay: 200,
        });
        this.scene.tweens.add({
          targets: this.recasteTarget,
          y: -10,
          duration: 100,
          ease: "Linear",
          yoyo: true,
          repeat: 2,
          delay: 200,
          repeatDelay: 200
        });
      }
    });
    this.tween3.stop();
    this.tween4 = this.scene.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 400,
      ease: "Linear",
      yoyo: false,
      delay: 100,
      onUpdate: () => {
        this.recasteItem.setAlpha(this.tween4.getValue());// 根据动画运行时间进行
      },
    });
    this.tween4.stop();
    this.tween5 = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 400,
      ease: "Linear",
      yoyo: false,
      delay: 500,
      onUpdate: () => {
        this.recasteTarget.setAlpha(this.tween5.getValue());// 根据动画运行时间进行
      },
    });
    this.tween5.stop();
  }
  protected playAnimation() {
    this.canPlay = true;
    if (!this.timerID) {
      this.timerID = setInterval(this.update.bind(this), 20);
    }
  }

  protected stopAnimation() {
    this.canPlay = false;
    this.bgring1.rotation = 0;
    this.bgring2.rotation = 0;
    this.bgring3.rotation = 0;
    this.bgring4.rotation = 0;
    if (this.timerID) {
      this.timerID = clearInterval(this.timerID);
      this.timerID = undefined;
    }
  }
  private stopTweens() {
    this.tween1.stop();
    this.tween2.stop();
    this.tween3.stop();
    this.tween4.stop();
    this.tween5.stop();
  }
  private playTween1() {
    this.tween1.play();
    this.tween2.stop();
    this.tween3.stop();
    this.tween4.stop();
    this.tween5.stop();

  }
  private playTween2() {
    this.tween1.stop();
    this.tween2.play();
    this.tween3.play();
    this.tween4.play();
    this.tween5.play();
  }
}
