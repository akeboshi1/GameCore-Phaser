import { NineSliceButton, GameGridTable, GameScroller, TabButton, Button, BBCodeText, NineSlicePatch, ClickEvent, NinePatchTabButton } from "apowophaserui";
import { CheckboxGroup, CommonBackground, DynamicImage, DynamicImageValue, ImageValue, MoreButtonPanel, TextButton, UiManager } from "gamecoreRender";
import { DetailBubble, DetailDisplay, ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { AvatarSuitType, ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { ICountablePackageItem, IExtendCountablePackageItem } from "picaStructure";
export class PicaBagPanel extends PicaBasePanel {
  public static PICABAG_SHOW: string = "PICABAG_SHOW";
  private mCloseBtn: Button;
  private topCheckBox: CheckboxGroup;
  private mBackground: CommonBackground;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoryCon: Phaser.GameObjects.Container;
  private mDetailDisplay: DetailDisplay;
  private mIconBg: Phaser.GameObjects.Image;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: any;// op_def.IStrPair
  private mPropGrid: GameGridTable;
  private mPropGridBg: Phaser.GameObjects.Graphics;
  private mCategoryScroll: GameScroller;
  private useBtn: NineSliceButton;
  private showBtn: NineSliceButton;
  private recasteBtn: NineSliceButton;
  private topBtns: TabButton[] = [];
  private moneyCon: Phaser.GameObjects.Container;
  private moneyvalue: ImageValue;
  private diamondvalue: ImageValue;
  private moneyAddBtn: Button;
  private nameText: Phaser.GameObjects.Text;
  private starImage: Phaser.GameObjects.Image;
  private moreButton: Button;
  // private moreButtonPanel: MoreButtonPanel;

  private mDetailBubble: DetailBubble;
  private mSceneType: any;
  private mEnableEdit: boolean = false;
  private isDecorating: boolean = false;
  private categoryType: any;
  private mSelectedItemData;
  private mSelectedItem: ItemButton;
  private mAttributes: DynamicImageValue[] = [];
  private moneyData: any;
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.atlasNames = [UIAtlasName.uicommon];
    this.textures = [{ atlasName: "bag_bg", folder: "texture" }];
    this.key = ModuleName.PICABAG_NAME;
  }

  get closeBtn(): Button {
    return this.mCloseBtn;
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
    this.mDetailBubble.y = this.mCategoryCon.y - 10 * this.dpr - this.mDetailBubble.height;
    this.mCategoriesBar.y = 40 * this.dpr;
    this.mCategoriesBar.x = -width * 0.5;
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x3EE1FF);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x06B5D5);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);

    this.useBtn.x = width - this.useBtn.width / 2 - 10 * this.dpr;
    this.useBtn.y = this.mCategoryCon.y - this.useBtn.height / 2;
    this.recasteBtn.x = this.useBtn.x;
    this.recasteBtn.y = this.useBtn.y - this.recasteBtn.height - 15 * this.dpr;

    this.showBtn.x = this.useBtn.x;
    this.showBtn.y = this.useBtn.y - this.recasteBtn.height - 15 * this.dpr;

    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = (height - 296 * this.dpr - 60 * this.dpr) * 0.5 + 60 * this.dpr;
    this.mIconBg.x = this.mDetailDisplay.x;
    this.mIconBg.y = this.mDetailDisplay.y;
    this.mPropGridBg.clear();
    this.mPropGridBg.fillStyle(0x7DE5FE);
    this.mPropGridBg.fillRect(0, 0, this.mPropGrid.width, this.mPropGrid.height + 10 * this.dpr);
    this.mPropGridBg.y = height - this.mPropGrid.height - 4 * this.dpr;
    this.mPropGrid.x = width / 2 + 3 * this.dpr;
    this.mPropGrid.y = height - this.mPropGrid.height * 0.5;
    this.mPropGrid.layout();
    this.mPropGrid.resetMask();
    this.mCategoryScroll.refreshMask();
    // this.moreButtonPanel.x = width * 0.5;
    // this.moreButtonPanel.y = height * 0.5;
    this.setSize(width, height);
    this.setInteractive();
  }

  setCategories(subcategorys: any[]) {// op_def.IStrPair
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const capW = 60 * this.dpr;
    const capH = 41 * this.dpr;
    const items = [];
    (<any>this.mCategoryScroll).clearItems();
    const allCategory = { value: i18n.t("common.all"), key: "alltype" };
    subcategorys.unshift(allCategory);
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, 1, subcategorys[i].value, 0, 0);
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
    this.updateCategeoriesLoc(false);
  }

  public setProp(props: IExtendCountablePackageItem[], isupdate: boolean = false) {// op_client.ICountablePackageItem
    props = !props ? [] : props;
    let subProps = [];
    const subcategoryType = this.mSelectedCategeories.key;
    this.mSelectedItem = undefined;
    let sameid: boolean = false;
    for (const prop of props) {
      if (this.mSelectedItemData && prop.indexId === this.mSelectedItemData.indexId) {
        this.mSelectedItemData = prop;
        sameid = true;
      }
      if (subcategoryType === "alltype" || subcategoryType === prop.subcategory) {
        subProps.push(prop);
      }
    }
    if (isupdate) {
      if (!this.mSelectedItemData) isupdate = false;
      if (!sameid) isupdate = false;
    }

    const len = subProps.length;
    if (len < 18) {
      subProps = subProps.concat(new Array(18 - len));
    }
    this.mPropGrid.setItems(subProps);
    this.mPropGrid.layout();
    if (!isupdate) {
      this.mSelectedItemData = undefined;
      this.mPropGrid.setT(0);
      const cell = this.mPropGrid.getCell(0);
      if (cell.container)
        this.onSelectItemHandler(cell.container);
    }
  }

  public setMoneyData(money: number, diamond: number) {
    money = money || 0;
    diamond = diamond || 0;
    this.moneyData = { money, diamond };
    if (!this.mInitialized) return;
    if (money > 99999) {
      this.moneyvalue.setText((Math.floor(money / 1000) / 10) + "");
      this.moneyvalue.setUintText({ img: true });
    } else {
      this.moneyvalue.setText(money + "");
      this.moneyvalue.setUintTextVisible(false);
    }
    if (diamond > 99999) {
      this.diamondvalue.setText((Math.floor(diamond / 1000) / 10) + "");
      this.diamondvalue.setUintText({ img: true });
    } else {
      this.diamondvalue.setText(diamond + "");
      this.diamondvalue.setUintTextVisible(false);
    }
  }

  public setSceneData(sceneType: number, isDecorating: boolean, editor: boolean) {
    this.mSceneType = sceneType;
    this.mEnableEdit = editor;
    this.isDecorating = isDecorating;
    if (!this.mInitialized) return;
    this.createCategory(sceneType, isDecorating);
  }

  public setSelectedResource(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    }
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on(ClickEvent.Tap, this.onCloseHandler, this);
    this.useBtn.on(ClickEvent.Tap, this.onUseBtnHandler, this);
    this.recasteBtn.on(ClickEvent.Tap, this.onRecasteHandler, this);
    this.showBtn.on(ClickEvent.Tap, this.onShowHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
    this.useBtn.off(ClickEvent.Tap, this.onUseBtnHandler, this);
    this.recasteBtn.off(ClickEvent.Tap, this.onRecasteHandler, this);
    this.showBtn.off(ClickEvent.Tap, this.onShowHandler, this);
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

  queryRefreshPackage(isupdate: boolean = false) {
    this.queryPackege(isupdate);
  }

  public onSellPropsHandler(category: number, prop: any, count: number) {// op_client.CountablePackageItem
    this.mCategoryScroll.addListen();
    this.render.renderEmitter(this.key + "_sellProps", { prop, count, category });
  }
  public onSellPropsFailedHandler(prop: any) {
    this.mCategoryScroll.addListen();
  }

  public onUsePropsHandler(prop: any, count: number) {// op_client.CountablePackageItem
    this.mCategoryScroll.addListen();
    this.render.renderEmitter(this.key + "_useprops", { itemid: prop.id, count });
  }
  public onUsePropsFailedHandler(prop: any) {
    this.mCategoryScroll.addListen();
  }

  protected onShow() {
    super.onShow();
    this.render.emitter.emit(PicaBagPanel.PICABAG_SHOW);
  }

  protected onInitialized() {
    if (this.moneyData) {
      this.setMoneyData(this.moneyData.money, this.moneyData.diamond);
    }
    if (this.mSceneType !== undefined) this.createCategory(this.mSceneType, this.isDecorating);
  }

  protected init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
    this.mIconBg = this.scene.make.image({
      key: "bag_bg"
    }, false);
    this.mIconBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
    this.mCloseBtn.setPosition(21 * this.dpr, 45 * this.dpr);
    this.mCloseBtn.setInteractive(new Phaser.Geom.Rectangle(-28 * this.dpr, -20 * this.dpr, 56 * this.dpr, 40 * this.dpr), Phaser.Geom.Rectangle.Contains);
    const moneybg = new NineSlicePatch(this.scene, 0, -this.dpr, 190 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
      left: 17 * this.dpr,
      top: 0 * this.dpr,
      right: 17 * this.dpr,
      bottom: 0 * this.dpr
    });
    moneybg.x = -moneybg.width * 0.5;
    const moneyline = this.scene.make.image({ x: moneybg.x, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_division" }, false);
    this.moneyvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_silver", this.dpr, {
      color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
    });
    this.moneyvalue.setLayout(1);
    // this.moneyvalue.setUintText({ style: UIHelper.whiteStyle(this.dpr, 15) });
    this.moneyvalue.x = moneybg.x - moneybg.width * 0.5 + 22 * this.dpr;
    this.diamondvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_diamond", this.dpr, {
      color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
    });
    this.diamondvalue.setLayout(1);
    // this.diamondvalue.setUintText({ style: UIHelper.whiteStyle(this.dpr, 15) });
    this.diamondvalue.x = moneybg.x + 22 * this.dpr;
    this.moneyAddBtn = new Button(this.scene, UIAtlasName.uicommon, "home_praise_bg", "home_praise_bg");
    const moneyAddicon = this.scene.make.image({ x: 0, y: 0, key: UIAtlasName.uicommon, frame: "home_assets_add" }, false);
    this.moneyAddBtn.add(moneyAddicon);
    this.moneyAddBtn.x = -this.moneyAddBtn.width * 0.5 - 4 * this.dpr;
    this.moneyAddBtn.on(ClickEvent.Tap, this.onRechargeHandler, this);
    this.moneyCon = this.scene.make.container(undefined, false);
    this.moneyCon.setSize(moneybg.width, moneybg.height);
    this.moneyCon.add([moneybg, moneyline, this.moneyvalue, this.diamondvalue, this.moneyAddBtn]);
    this.moneyCon.x = width - 20 * this.dpr;
    this.moneyCon.y = this.mCloseBtn.y;

    const nameBg = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "avater_name_bg" });
    nameBg.x = width * 0.5;
    nameBg.y = this.mCloseBtn.y + 40 * this.dpr;
    this.nameText = this.scene.make.text({ x: nameBg.x, y: nameBg.y, text: "", style: UIHelper.whiteStyle(this.dpr, 14) }).setOrigin(0.5);
    this.nameText.setFontStyle("bold");
    this.starImage = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "bag_star_big_1" });
    this.starImage.x = nameBg.x;
    this.starImage.y = nameBg.y + nameBg.height * 0.5 + 15 * this.dpr;
    this.starImage.visible = false;
    this.moreButton = new Button(this.scene, UIAtlasName.uicommon, "online_more");
    this.moreButton.x = width - this.moreButton.width * 0.5 - 20 * this.dpr;
    this.moreButton.y = nameBg.y;
    this.moreButton.on(ClickEvent.Tap, this.onMoreHandler, this);
    this.moreButton.visible = false;
    const btnwidth = 100 * this.dpr, btnHeight = 40 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr, btnPosY = this.mCategoryCon.y - 25 * this.dpr;
    this.useBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.use"), "#996600");
    this.recasteBtn = this.createNineButton(this.useBtn.x, this.useBtn.y, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.make"), "#996600");
    this.showBtn = this.createNineButton(this.useBtn.x, this.useBtn.y - 30 * this.dpr, btnwidth, btnHeight, UIAtlasName.uicommon, "button_g", i18n.t("furni_bag.show"), "#042663");
    this.recasteBtn.visible = false;
    this.showBtn.visible = false;
    this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
    this.mDetailDisplay.setFixedScale(2 * this.dpr / this.scale);
    this.mDetailDisplay.setComplHandler(new Handler(this, () => {
      this.mDetailDisplay.visible = true;
    }));
    this.mDetailDisplay.setTexture(UIAtlasName.uicommon, "bag_nothing", 1);
    this.mDetailDisplay.setNearest();
    this.mDetailDisplay.y = this.mIconBg.y + this.mIconBg.height / 2;
    this.mDetailBubble = new DetailBubble(this.scene, UIAtlasName.uicommon, this.dpr);
    this.mDetailBubble.x = 10 * this.dpr;

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
    this.add([this.mBackground, this.mPropGridBg, this.mIconBg, this.mCloseBtn, this.moneyCon, this.mDetailDisplay, nameBg, this.nameText, this.starImage,
    this.moreButton, this.mDetailBubble, this.mCategoryCon, this.useBtn, this.recasteBtn, this.showBtn]);
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
        if (item && this.isSelectedItemData(item)) {
          cellContainer.select = true;
          this.mSelectedItem = cellContainer;
          this.mSelectedItemData = item;
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
    // this.moreButtonPanel = new MoreButtonPanel(this.scene, width, height, this.dpr);
    // this.moreButtonPanel.setHandler(new Handler(this, this.onMoreButtonHandler));
    // this.add(this.moreButtonPanel);
    // this.moreButtonPanel.hide();
    this.resize(0, 0);
    super.init();
  }

  private createCategory(sceneType: number, editor: boolean) {
    const width = this.scaleWidth;
    const topCapW = 90 * this.dpr;
    const topCapH = 35 * this.dpr;
    const topPosY = 23 * this.dpr;
    this.topCheckBox = new CheckboxGroup();
    let topCategorys = [3, 1]; // op_pkt_def.PKT_PackageType.PropPackage, op_pkt_def.PKT_PackageType.FurniturePackage, op_pkt_def.PKT_PackageType.AvatarPackage
    let topBtnTexts = [i18n.t("furni_bag.Props"), i18n.t("furni_bag.furni")];
    if (sceneType === 2) {// op_def.SceneTypeEnum.EDIT_SCENE_TYPE
      topCategorys = [5];// op_pkt_def.PKT_PackageType.PropPackage, op_pkt_def.PKT_PackageType.FurniturePackage, op_pkt_def.PKT_PackageType.AvatarPackage
      topBtnTexts = [i18n.t("furni_bag.furni")];
    }
    let topPosX = -width * 0.5 + topCapW * 0.5 + 1 * this.dpr;
    const frame = this.scene.textures.getFrame(UIAtlasName.uicommon, "bag_tab_uncheck");
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
    for (const key in topCategorys) {
      const index = Number(key);
      const category = topCategorys[index];
      const button = new NinePatchTabButton(this.scene, topCapW, topCapH, UIAtlasName.uicommon, "bag_tab_uncheck", "bag_tab_select", topBtnTexts[index], [config0]);
      button.tweenScale = 1;
      button.setTextStyle(UIHelper.whiteStyle(this.dpr, 18));
      button.setData("data", category);
      button.setSize(topCapW, topCapH);
      button.setFontStyle("bold");
      button.y = topPosY;
      button.x = topPosX;
      topPosX += topCapW + 3 * this.dpr;
      this.topBtns.push(button);
    }
    this.topCheckBox.appendItemAll(this.topBtns);
    this.topCheckBox.on("selected", this.onTopCategoryHandler, this);
    this.mCategoryCon.add(this.topBtns);
    if (editor) {
      const index = topCategorys.indexOf(1);// op_pkt_def.PKT_PackageType.EditFurniturePackage
      this.topCheckBox.selectIndex(index);
    } else {
      this.topCheckBox.selectIndex(0);
    }
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

  private setSelectedItem(data: IExtendCountablePackageItem, cell: ItemButton) {// op_client.ICountablePackageItem
    if (this.mSelectedItem) {
      this.mSelectedItem.select = false;
    }
    this.nameText.text = data.name || data.shortName;
    if (data.grade > 0) {
      this.starImage.visible = true;
      const starFrame = "bag_star_big_" + data.grade;
      this.starImage.setFrame(starFrame);
    } else this.starImage.visible = false;
    this.mSelectedItemData = data;
    this.mSelectedItem = cell;
    cell.select = true;
    this.mDetailDisplay.displayLoading("loading_ui", Url.getUIRes(this.dpr, "loading_ui/loading_ui.png"), Url.getUIRes(this.dpr, "loading_ui/loading_ui.json"));
    const content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
    content.display = this.categoryType === 1 ? data.animationDisplay : data.display;
    content.animations = <any>data.animations;
    this.setSelectedResource(content);
  }

  private isSelectedItemData(data: op_client.ICountablePackageItem) {// op_client.ICountablePackageItem
    if (!this.mSelectedItemData) return false;
    if (this.mSelectedItemData.indexId === data.indexId) return true;
    return false;
  }

  private onSelectSubCategoryHandler(gameobject: TextButton) {
    const category: any = gameobject.getData("item");// op_def.IStrPair
    if (category) {
      if (this.mPreCategoryBtn && (this.mPreCategoryBtn instanceof TextButton)) {
        this.mPreCategoryBtn.changeNormal();
      }
      if (gameobject instanceof TextButton)
        gameobject.changeDown();
      this.mSelectedCategeories = category;
      this.mPropGrid.setT(0);
      const isupdate = this.mSelectedItemData === undefined ? false : true;
      this.queryPackege(isupdate);
      this.mPreCategoryBtn = gameobject;
    }
    this.mPropGrid.setT(0);
  }

  private onCloseHandler() {
    this.render.renderEmitter(this.key + "_close");
  }

  private queryPackege(isupdate: boolean = false) {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter(this.key + "_queryPackage", { packType: this.categoryType, key: this.mSelectedCategeories.key, isupdate });
    }
  }

  private onSelectItemHandler(cell: ItemButton) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (item && this.mSelectedItemData === item || this.mSelectedItemData && !item) return;
    this.mDetailBubble.visible = true;
    let property = null;
    this.render.mainPeer.getUserData_PlayerProperty()
      .then((val) => {
        property = val;
        return this.serviceTimestamp;
      })
      .then((t) => {
        this.mDetailBubble.setProp(item, Math.floor(t / 1000), property);
        this.mDetailBubble.y = this.mCategoryCon.y - 10 * this.dpr - this.mDetailBubble.height;
        if (item)
          this.setItemAttribute(item, property);
      });
    if (item) {
      if (this.categoryType === 3) {
        if (item.subcategory !== "PKT_MARKET_TAG_20013") {
          this.useBtn.visible = false;
        } else this.useBtn.visible = true;
      } else {
        this.useBtn.visible = true;
        this.showBtn.visible = true;
      }
      this.setSelectedItem(item, cell);
    } else {
      if (this.categoryType !== 2 && this.mSelectedItemData === undefined) {// op_pkt_def.PKT_PackageType.AvatarPackage
        this.useBtn.visible = false;
        this.showBtn.visible = false;
        this.mDetailDisplay.setTexture(UIAtlasName.uicommon, "bag_nothing", 1);
        this.mDetailDisplay.setNearest();
        this.nameText.text = "";
      }
    }
  }

  private setItemAttribute(item: ICountablePackageItem, property: any) {
    for (const img of this.mAttributes) {
      img.visible = false;
    }
    if (!item.affectValues) return;
    const length = item.affectValues.length >= 6 ? 6 : item.affectValues.length;
    for (let i = 0; i < length; i++) {
      const affect = item.affectValues[i];
      let img: DynamicImageValue;
      if (i < this.mAttributes.length) {
        img = this.mAttributes[i];
        img.visible = true;
      } else {
        const bg = new NineSlicePatch(this.scene, 0, 0, 56 * this.dpr, 22 * this.dpr, UIAtlasName.uicommon, "bag_attribute_bg", {
          left: 12 * this.dpr, right: 12 * this.dpr, top: 0, bottom: 0
        });
        img = new DynamicImageValue(this.scene, 56 * this.dpr, 22 * this.dpr, UIAtlasName.uicommon, "", this.dpr);
        img.setOffset(-3 * this.dpr, 0);
        img.addAt(bg, 0);
        img.setLayout(2);
        this.add(img);
        this.mAttributes.push(img);
      }
      if (property.propertiesMap) {
        const proper = property.propertiesMap.get(affect.key);
        if (proper) {
          const value = affect.value > 0 ? "+" + affect.value : affect.value + "";

          if (proper.display) {
            img.load(Url.getOsdRes(proper.display.texturePath));
            img.setText(value);
            img.setOffset(-3 * this.dpr, 0);
          } else {
            // const temptext = `${proper.name}:${value}`;
            img.setText(value);
            img.setOffset(-10 * this.dpr, 0);
          }
        } else img.visible = false;
      } else img.visible = false;
    }
    this.setLayoutAttribute();
  }

  private setLayoutAttribute() {
    const arr = [];
    this.mAttributes.forEach((value) => {
      if (value.visible) arr.push(value);
    });
    if (arr.length === 0) return;
    const cellWidth = 56 * this.dpr;
    const cellHeight = 21 * this.dpr;
    const space = 23 * this.dpr;
    const posx = this.scaleWidth * 0.5;
    let posy = this.nameText.y + 30 * this.dpr;
    const length = arr.length > 3 ? 3 : arr.length;
    const allLen = cellWidth * length + space * (length - 1);
    let offsetx = posx - allLen * 0.5;
    let index: number = 0;
    for (const item of arr) {
      item.x = offsetx + cellWidth * 0.5;
      item.y = posy;
      offsetx += (cellWidth + space);
      index++;
      if (index === 3) {
        offsetx = posx - allLen * 0.5;
        posy += 13 * this.dpr + cellHeight;
      }
    }
    arr.length = 0;
  }

  private onAddFurniToSceneHandler() {
    if (!this.mSelectedItemData) {
      return;
    }
    if (this.mSceneType === op_def.SceneTypeEnum.EDIT_SCENE_TYPE || this.mEnableEdit)
      this.render.renderEmitter(this.key + "_addFurniToScene", this.mSelectedItemData.id);
    else {
      const data = {
        text: [{ text: i18n.t("furni_bag.placetips"), node: undefined }]
      };
      this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
      this.mCategoryScroll.addListen();
    }
  }

  private onTopCategoryHandler(item: NinePatchTabButton) {
    const categoryType = item.getData("data");
    this.clearCategoryData();
    this.recasteBtn.visible = false;
    this.showBtn.visible = false;
    if (categoryType) {
      this.onSelectedCategory(categoryType);
      if (categoryType === 1 || categoryType === 5) {// op_pkt_def.PKT_PackageType.FurniturePackage || op_pkt_def.PKT_PackageType.EditFurniturePackage
        this.useBtn.setText(i18n.t("furni_bag.add"));
        if (categoryType === 1) {
          this.moreButton.visible = true;
          this.showBtn.visible = true;
        }
      } else {
        this.useBtn.setText(i18n.t("common.use"));
        this.moreButton.visible = false;
      }
    }
  }

  private clearCategoryData() {
    this.mSelectedItemData = undefined;
  }
  private onSelectedCategory(categoryType: number) {
    this.categoryType = categoryType;
    this.render.renderEmitter(this.key + "_getCategories", categoryType);
  }
  private getPropResource(data: IExtendCountablePackageItem) {
    const resource: any = {};
    if (data.suitType) {
      resource.avatar = AvatarSuitType.createAvatarBySn(data.suitType, data.sn, data.slot, data.tag, data.version);
    } else {
      resource.display = data.display;
    }
    resource.suit = [{ suit_type: data.suitType, sn: data.sn, tag: data.tag, version: data.version }];
    resource.animations = data.animations;
    return resource;
  }

  private onMoreButtonHandler(tag: string) {
    if (tag === "place") {
      this.onAddFurniToSceneHandler();
    } else if (tag === "sell") {
      this.onSellBtnHandler();
    }
  }
  private onSellBtnHandler() {
    this.mCategoryScroll.removeListen();
    if (this.mSelectedItemData) {
      const data = this.mSelectedItemData;
      if (!data.recyclable) return;
      const title = i18n.t("common.sold");
      const resource = this.getPropResource(data);// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
      if (data.avatar) {
        resource.avatar = data.avatar;
      } else {
        resource.display = data.display;
      }
      resource.animations = data.animations;
      const resultHandler = {
        key: this.key,
        confirmFunc: "onSellPropsHandler",
        cancelFunc: "onSellPropsFailedHandler",
        confirmAddData: this.categoryType
      };

      this.showPropFun({ resultHandler, data, title, resource });
    }
  }

  private onUseBtnHandler() {
    this.mCategoryScroll.removeListen();
    if (this.mSelectedItemData) {
      if (this.categoryType === 1 || this.categoryType === 5) {
        this.onAddFurniToSceneHandler();
      } else {
        const data = this.mSelectedItemData;
        const title = i18n.t("common.use");
        const resource = this.getPropResource(data);
        const resultHandler = {
          key: this.key,
          confirmFunc: "onUsePropsHandler",
          cancelFunc: "onUsePropsFailedHandler"
        };
        this.showPropFun({ resultHandler, data, price: false, title, resource });
      }
    }

  }
  private onRechargeHandler() {
  }
  private onRecasteHandler() {
    if (this.mSelectedItemData.rarity === 5) {
      const noticedata = {
        text: [{ text: i18n.t("recaste.raritytips"), node: undefined }]
      };
      this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, noticedata);
      return;
    }
    const data = this.mSelectedItemData;
    this.render.mainPeer.showMediator(ModuleName.PICAMANUFACTURE_NAME, true, data);
  }
  private onMoreHandler() {
    if (!this.mSelectedItemData) return;
    this.recasteBtn.visible = false;
    this.moreButton.visible = false;
  }
  private updateCategeoriesLoc(inputBoo: boolean) {
    const list = this.mCategoryScroll.getItemList();
    const h = 41 * this.dpr;
    let preBtn: Phaser.GameObjects.Container = null;
    const offset = 30 * this.dpr;
    const w = this.mScene.cameras.main.width;
    let tmpW: number = offset;
    for (let i = 0; i < list.length; i++) {
      const item: Phaser.GameObjects.Container = <Phaser.GameObjects.Container>list[i];
      if (i > 0) {
        preBtn = <Phaser.GameObjects.Container>list[i - 1];
        item.x = preBtn.x + preBtn.width; // - item.width * item.originX;
      } else {
        item.x = tmpW;
      }
      tmpW += item.width;
    }

    this.mCategoryScroll.setAlign();

  }

  private showPropFun(config: any) {// PicPropFunConfig
    this.render.mainPeer.showMediator(ModuleName.PICAPROPFUN_NAME, true, config);
  }

  private onShowHandler() {
    this.render.renderEmitter(this.key + "_showElement", this.mSelectedItemData.id);
  }

  private get serviceTimestamp(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.render.mainPeer.requestCurTime().then((t) => {
        resolve(t);
      });
    });
  }
}
