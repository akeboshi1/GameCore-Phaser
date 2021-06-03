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
  private mDetailBubble: DetailBubble;
  private dpr: number;
  private zoom: number;
  private recastData: any;
  private key: string;
  private isBag: boolean = true;
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
    this.mDetailBubble.x = this.labelTipTex.x;
    this.mDetailBubble.y = this.labelTipTex.y + 20 * this.dpr - this.mDetailBubble.height;
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
    this.displayPanel.refreshMask();
    this.setSize(width, height);
    this.setInteractive();
  }
  setRecasteResult(data: op_client.CountablePackageItem) {
    if (data) {
      this.mRecasteItemData.count--;
      const grade = this.getSpendGrade(this.mRecasteItemData.grade);
      this.displayPanel.setRecasteItemData(this.mRecasteItemData, grade);
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
      this.displayPanel.setRecasteItemData(data, grade);
      this.mDetailBubble.setProp(data, 0, undefined);
      if (blueprint) this.onDisplayPanelHandler("blueprint", true);
    } else {
      this.onDisplayPanelHandler("itembutton");
      this.displayPanel.setRecasteItemData(undefined, undefined);
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
    this.displayPanel = new RecasteDisplayPanel(this.scene, width, 248 * this.dpr, this.render, this.dpr, this.scale);
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
    this.confirmBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.confirm"), "#996600");
    this.confirmBtn.on(ClickEvent.Tap, this.onConfirmBtnHandler, this);
    this.mDetailBubble = new DetailBubble(this.scene, UIAtlasName.uicommon, this.dpr, this.zoom, 100 * this.dpr, 50 * this.dpr);
    this.mDetailBubble.x = 10 * this.dpr;
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
    this.add([this.mBackground, this.mPropGridBg, this.mTopBg, this.displayPanel, this.mCategoryCon, this.confirmBtn, this.mDetailBubble, this.labelTipTex]);
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
      this.displayPanel.setRecasteItemData(item, grade);
      this.mRecasteItemData = item;
    } else this.displayPanel.setRecasteTargetData(item);
    if (this.mSelectedItem) this.mSelectedItem.select = false;
    cell.select = true;
    this.mSelectedItem = cell;
    this.mDetailBubble.setProp(item, 0, undefined);
    this.mDetailBubble.y = this.labelTipTex.y + 20 * this.dpr - this.mDetailBubble.height;
  }
  private getSpendGrade(grade) {
    return this.gradeStars[grade];
  }
  private clearRecastData() {
    this.mDetailBubble.setProp(undefined, 0, undefined);
    this.mDetailBubble.setTipsText("");
    this.mRecasteItemData = undefined;
    this.mSelectedItemData = undefined;
    this.mSelectedItem = undefined;
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
    }
    this.render.renderEmitter(this.key + "_queryRecastCategories");
  }
}

class RecasteDisplayPanel extends Phaser.GameObjects.Container {
  private dpr: number;
  private zoom: number;
  private render: Render;
  private rightbg: Phaser.GameObjects.Image;
  private recasteItem: ItemButton;
  private recasteTarget: DetailDisplay;
  private starvalue: ImageValue;
  private nameTex: Phaser.GameObjects.Text;
  private starLevelImg: Phaser.GameObjects.Image;
  private rightButton: Button;
  private rightTips: Phaser.GameObjects.Text;
  private maskGraphic: Phaser.GameObjects.Graphics;
  private send: Handler;
  private haveRecastData: boolean = false;
  constructor(scene: Phaser.Scene, width: number, height: number, render: Render, dpr: number, zoom: number) {
    super(scene);
    this.setSize(width, height);
    this.dpr = dpr;
    this.zoom = zoom;
    this.render = render;
    this.init();
  }

  public refreshMask() {
    const wpos = this.rightbg.getWorldTransformMatrix();
    this.maskGraphic.x = wpos.tx - this.rightbg.width / this.zoom * 0.5;
    this.maskGraphic.y = wpos.ty - this.rightbg.height / this.zoom * 0.5;
  }
  public setHandler(send: Handler) {
    this.send = send;
  }
  public setRecasteItemData(data: op_client.ICountablePackageItem, spend?: IFurnitureGrade) {
    if (!data) {
      this.clearDisplay();
      return;
    }
    this.recasteItem.setItemData(data, true);
    this.starvalue.setText(spend.forgeCost + "");
    this.haveRecastData = true;
  }

  public setRecasteTargetData(data: ICountablePackageItem) {
    // this.recasteTarget.displayLoading("loading_ui", Url.getUIRes(this.dpr, "loading_ui/loading_ui.png"), Url.getUIRes(this.dpr, "loading_ui/loading_ui.json"), this.dpr / this.zoom);
    // const content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
    // content.display = data.animationDisplay;
    // content.animations = data.animations;
    // this.recasteTarget.loadDisplay(content);
    const detail = data.serializeString ? data["elepi"] : data;
    UITools.showDetailDisplay({ display: this.recasteTarget, dpr: this.dpr, data: detail, render: this.render, sn: data.sn, itemid: data.id, serialize: data.serializeString });
    this.recasteTarget.visible = true;
    this.starLevelImg.setFrame("Recast_star_big_" + data.grade);
    this.nameTex.text = data.name || data.shortName;
    this.starLevelImg.visible = true;
    this.rightTips.visible = false;
    this.rightButton.visible = false;
  }

  protected init() {
    this.rightbg = this.scene.make.image({ key: "Recast_aims_icon_bg" });
    this.rightbg.x = this.width * 0.5 - this.rightbg.width * 0.5 - 15 * this.dpr;

    this.recasteItem = new ItemButton(this.scene, UIAtlasName.recast, "Recast_default_icon_bg", this.dpr, this.zoom, true);
    this.recasteItem.on(ClickEvent.Tap, this.onItemButtonHandler, this);
    this.recasteItem.setShowTips(false);
    this.recasteItem.x = -this.width * 0.5 + this.recasteItem.width * 0.5 + 20 * this.dpr;
    this.recasteItem.y = 0;
    const arrowbg = this.scene.make.image({ key: UIAtlasName.recast, frame: "Recast_arrow" });
    arrowbg.x = this.recasteItem.x + this.recasteItem.width * 0.5 + arrowbg.width * 0.5 + 6 * this.dpr;
    arrowbg.y = this.recasteItem.y;
    this.starvalue = new ImageValue(this.scene, 60 * this.dpr, 20 * this.dpr, UIAtlasName.recast, "Recast_pica star_small", this.dpr, UIHelper.colorNumberStyle("#ffffff", 20 * this.dpr));
    this.starvalue.x = arrowbg.x - 11 * this.dpr;
    this.starvalue.y = arrowbg.y - 10 * this.dpr;
    this.nameTex = this.scene.make.text({ text: "", style: UIHelper.colorStyle("#FFFF00", 14 * this.dpr) }).setOrigin(0, 0.5);
    this.nameTex.setFontStyle("bold");
    this.nameTex.x = this.rightbg.x - this.rightbg.width * 0.5;
    this.nameTex.y = this.rightbg.y - this.rightbg.height * 0.5 - 18 * this.dpr;
    this.starLevelImg = this.scene.make.image({ key: UIAtlasName.recast, frame: "Recast_star_big_1" }).setOrigin(1, 0.5);
    this.starLevelImg.x = this.rightbg.x + this.rightbg.width * 0.5 - this.starLevelImg.width * 0.5 - 12 * this.dpr;
    this.starLevelImg.y = this.rightbg.y - this.rightbg.height * 0.5 + this.starLevelImg.height * 0.5 + 8 * this.dpr;
    this.starLevelImg.visible = false;
    this.recasteTarget = new DetailDisplay(this.scene, this.render);
    this.recasteTarget.setFixedScale(2 * this.dpr / this.zoom);
    this.recasteTarget.setComplHandler(new Handler(this, () => {
      this.recasteTarget.visible = true;
    }));
    this.maskGraphic = this.scene.make.graphics(undefined, false);
    this.maskGraphic.clear();
    this.maskGraphic.fillStyle(0x3EE1FF);
    this.maskGraphic.fillRect(0, 0, this.rightbg.width, this.rightbg.height);
    this.recasteTarget.mask = this.maskGraphic.createGeometryMask();
    this.recasteTarget.setTexture(UIAtlasName.uicommon, "bag_nothing", 1);
    this.recasteTarget.setNearest();
    this.recasteTarget.x = this.rightbg.x;
    this.recasteTarget.y = this.rightbg.y;
    this.rightButton = new Button(this.scene, UIAtlasName.recast, "Recast_add");
    this.rightButton.on(ClickEvent.Tap, this.onBlueprintHandler, this);
    this.rightButton.x = this.recasteTarget.x;
    this.rightButton.y = this.recasteTarget.y;
    this.rightTips = this.scene.make.text({ text: i18n.t("recaste.selecttips"), style: UIHelper.whiteStyle(this.dpr) }).setOrigin(0.5);
    this.rightTips.x = this.rightButton.x;
    this.rightTips.y = this.rightButton.y + this.rightButton.height * 0.5 + 20 * this.dpr;
    this.add([this.rightbg, this.recasteItem, this.recasteTarget, this.rightButton, this.rightTips, arrowbg, this.starvalue, this.nameTex, this.starLevelImg]);
    this.clearDisplay();
  }

  private onItemButtonHandler() {
    this.clearDisplay();
    if (this.send) this.send.runWith("itembutton");
  }

  private onBlueprintHandler() {
    if (this.send) this.send.runWith(["blueprint", this.haveRecastData]);
  }

  private clearDisplay() {
    this.recasteItem.setItemData(undefined);
    this.recasteItem.setIconTexture(UIAtlasName.recast, "Recast_default_icon", true);
    this.recasteTarget.visible = false;
    this.rightButton.visible = true;
    this.rightTips.visible = true;
    this.haveRecastData = false;
  }
}
