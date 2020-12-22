import { NineSliceButton, GameGridTable, GameScroller, TabButton, Button, BBCodeText, Text, NineSlicePatch, ClickEvent, NinePatchTabButton } from "apowophaserui";
import { BackgroundScaleButton, BasePanel, CheckboxGroup, CommonBackground, DynamicImage, DynamicImageValue, ImageValue, TextButton, ThreeSlicePath, UiManager } from "gamecoreRender";
import { DetailDisplay } from "picaRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { AvatarSuitType, ModuleName } from "structure";
import { Coin, Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { EvalSourceMapDevToolPlugin } from "webpack";
export class PicaBagPanel extends PicaBasePanel {
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
  private mCategoryScroll: GameScroller;
  private useBtn: NineSliceButton;
  private topBtns: TabButton[] = [];
  private moneyCon: Phaser.GameObjects.Container;
  private moneyvalue: ImageValue;
  private diamondvalue: ImageValue;
  private moneyAddBtn: Button;
  private nameText: Phaser.GameObjects.Text;
  private moreButton: Button;
  private moreButtonPanel: MoreButtonPanel;

  private mDetailBubble: DetailBubble;
  private mSceneType: any;
  private mEnableEdit: boolean = false;
  private categoryType: any;
  private mSelectedItemData;
  private mSelectedItem: Item;
  private mAttributes: DynamicImageValue[] = [];
  private sceneData: any;
  private moneyData: any;
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.atlasNames = [UIAtlasName.uicommon];
    this.key = ModuleName.PICABAG_NAME;
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    super.resize(width, height);
    this.mBackground.x = width * 0.5;
    this.mBackground.y = height * 0.5;
    this.mCategoryCon.setSize(width, 79 * this.dpr);
    this.mCategoryCon.y = height - this.mPropGrid.height - this.mCategoryCon.height * 0.5 - 50 * this.dpr;
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

    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = (height - 296 * this.dpr - 60 * this.dpr) * 0.5 + 60 * this.dpr;
    this.mIconBg.x = this.mDetailDisplay.x;
    this.mIconBg.y = this.mDetailDisplay.y;
    this.mPropGrid.x = width / 2 + 3 * this.dpr;
    this.mPropGrid.y = height - this.mPropGrid.height * 0.5 - 3 * this.dpr;
    this.mPropGrid.layout();
    this.mPropGrid.resetMask();
    this.mCategoryScroll.refreshMask();
    this.moreButtonPanel.x = width * 0.5;
    this.moreButtonPanel.y = height * 0.5;
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

  public setProp(props: any[], isupdate: boolean = false) {// op_client.ICountablePackageItem
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
    if (len < 24) {
      subProps = subProps.concat(new Array(24 - len));
    }
    this.mPropGrid.setItems(subProps);
    if (!isupdate) {
      this.mSelectedItemData = undefined;
      const cell = this.mPropGrid.getCell(0);
      this.onSelectItemHandler(cell.container);
    }
  }

  public setMoneyData(money: number, diamond: number) {
    money = money || 0;
    diamond = diamond || 0;
    this.moneyData = { money, diamond };
    if (!this.mInitialized) return;
    this.moneyvalue.setText(money + "");
    this.diamondvalue.setText(diamond + "");
  }

  public setSceneData(sceneType: number, editor: boolean) {
    this.mSceneType = sceneType;
    this.mEnableEdit = editor;
    this.sceneData = { sceneType, editor };
    if (!this.mInitialized) return;
    this.createCategory(sceneType, editor);
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
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off(ClickEvent.Tap, this.onCloseHandler, this);
    this.useBtn.off(ClickEvent.Tap, this.onUseBtnHandler, this);
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

  protected onInitialized() {
    if (this.moneyData) {
      this.moneyvalue.setText(this.moneyData.money + "");
      this.diamondvalue.setText(this.moneyData.diamond + "");
    }
    if (this.sceneData) {
      this.createCategory(this.sceneData.sceneType, this.sceneData.editor);
    }
  }

  protected init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.mBackground = new CommonBackground(this.scene, 0, 0, width, height);
    this.mIconBg = this.scene.make.image({
      key: UIAtlasName.uicommon,
      frame: "bag_bg"
    }, false);
    this.mIconBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
    this.mCloseBtn.setPosition(21 * this.dpr, 35 * this.dpr);
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
    this.moneyvalue.x = moneybg.x - moneybg.width * 0.5 + 22 * this.dpr;
    this.diamondvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_diamond", this.dpr, {
      color: "#ffffff", fontSize: 15 * this.dpr, fontFamily: Font.NUMBER
    });
    this.diamondvalue.setLayout(1);
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
    this.moreButton = new Button(this.scene, UIAtlasName.uicommon, "online_more");
    this.moreButton.x = width - this.moreButton.width * 0.5 - 20 * this.dpr;
    this.moreButton.y = nameBg.y;
    this.moreButton.on(ClickEvent.Tap, this.onMoreHandler, this);
    this.moreButton.visible = false;
    const btnwidth = 100 * this.dpr, btnHeight = 40 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr, btnPosY = this.mCategoryCon.y - 25 * this.dpr;
    this.useBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("common.use"), "#996600");
    this.mDetailDisplay = new DetailDisplay(this.scene, this.render);
    this.mDetailDisplay.setFixedScale(2 * this.dpr / this.scale);
    this.mDetailDisplay.setComplHandler(new Handler(this, () => {
      this.mDetailDisplay.visible = true;
    }));
    this.mDetailDisplay.setTexture(UIAtlasName.uicommon, "ghost");
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
      cellupCallBack: (gameobject) => {
        this.onSelectSubCategoryHandler(gameobject);
      }
    });
    this.mCategoryCon.add([this.mCategoriesBar, this.mCategoryScroll]);
    this.add([this.mBackground, this.mIconBg, this.mCloseBtn, this.moneyCon, nameBg, this.nameText,
    this.moreButton, this.mDetailDisplay, this.mDetailBubble, this.mCategoryCon, this.useBtn]);
    const propFrame = this.scene.textures.getFrame(UIAtlasName.uicommon, "grid_choose");
    const capW = (propFrame.width) + this.dpr;
    const capH = (propFrame.height) + this.dpr;
    const tableConfig = {
      x: 0,
      y: 0,
      table: {
        width,
        height: 241 * this.dpr,
        columns: 4,
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
          cellContainer = new Item(scene, 0, 0, UIAtlasName.uicommon, this.dpr, this.scale);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        if (item && this.isSelectedItemData(item)) {
          cellContainer.isSelect = true;
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
    this.moreButtonPanel = new MoreButtonPanel(this.scene, width, height, this.dpr);
    this.moreButtonPanel.setHandler(new Handler(this, this.onMoreButtonHandler));
    this.add(this.moreButtonPanel);
    this.moreButtonPanel.hide();
    this.resize(0, 0);
    super.init();
  }

  private createCategory(sceneType: number, editor: boolean) {
    const width = this.scaleWidth;
    const topCapW = 90 * this.dpr;
    const topCapH = 35 * this.dpr;
    const topPosY = 22 * this.dpr;
    this.topCheckBox = new CheckboxGroup();
    let topCategorys = [3, 1];// op_pkt_def.PKT_PackageType.PropPackage, op_pkt_def.PKT_PackageType.FurniturePackage, op_pkt_def.PKT_PackageType.AvatarPackage
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
      const index = topCategorys.indexOf(5);// op_pkt_def.PKT_PackageType.EditFurniturePackage
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

  private setSelectedItem(data: op_client.ICountablePackageItem, cell: Item) {// op_client.ICountablePackageItem
    if (this.mSelectedItem) {
      this.mSelectedItem.isSelect = false;
    }
    this.nameText.text = data.name || data.shortName;
    this.mSelectedItemData = data;
    this.mSelectedItem = cell;
    cell.isSelect = true;
    this.mDetailDisplay.displayLoading("loading_ui", Url.getUIRes(this.dpr, "loading_ui"), Url.getUIRes(this.dpr, "loading_ui"));
    const content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
    content.display = this.categoryType === 1 ? data.animationDisplay : data.display;
    content.animations = data.animations;
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

  private onSelectItemHandler(cell: Item) {
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
        if (item.subcategory !== "pkt_market_tag_20013") {
          this.useBtn.visible = false;
        } else this.useBtn.visible = true;
      } else {
        this.useBtn.visible = true;
      }
      this.setSelectedItem(item, cell);
    } else {
      if (this.categoryType !== 2 && this.mSelectedItemData === undefined) {// op_pkt_def.PKT_PackageType.AvatarPackage
        this.useBtn.visible = false;
        this.mDetailDisplay.setTexture(UIAtlasName.uicommon, "ghost");
        this.mDetailDisplay.setNearest();
        this.nameText.text = "";
      }
    }
  }

  private setItemAttribute(item: op_client.CountablePackageItem, property: any) {
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
    }
  }

  private onTopCategoryHandler(item: NinePatchTabButton) {
    const categoryType = item.getData("data");
    this.clearCategoryData();
    if (categoryType) {
      this.onSelectedCategory(categoryType);
      if (categoryType === 1 || categoryType === 5) {// op_pkt_def.PKT_PackageType.FurniturePackage || op_pkt_def.PKT_PackageType.EditFurniturePackage
        this.useBtn.setText(i18n.t("furni_bag.add"));
      } else {
        this.useBtn.setText(i18n.t("common.use"));
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
  private getPropResource(data: op_client.ICountablePackageItem) {
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
  private onMoreHandler() {
    // if (!this.mSelectedItemData) return;
    // this.moreButtonPanel.show();
    // this.moreButtonPanel.setItemData(this.mSelectedItemData, this.categoryType);
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

  private get serviceTimestamp(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.render.mainPeer.requestCurTime().then((t) => {
        resolve(t);
      });
    });
  }
}

class DetailBubble extends Phaser.GameObjects.Container {

  private dpr: number;
  private key: string;
  private timeID: any;
  private tipsbg: NineSlicePatch;
  private tipsText: BBCodeText;
  private mExpires: BBCodeText;
  // private testText: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.dpr = dpr;
    this.key = key;
    const tipsWidth = 100 * dpr;
    const tipsHeight = 96 * dpr;
    this.setSize(tipsWidth, tipsHeight);
    this.tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, this.key, "tips_bg", {
      left: 10 * this.dpr,
      top: 10 * this.dpr,
      right: 10 * this.dpr,
      bottom: 10 * this.dpr
    }, undefined, undefined, 0);
    this.tipsbg.setPosition(tipsWidth * 0.5, tipsHeight * 0.5);
    this.tipsbg.alpha = 0.6;
    this.tipsText = new BBCodeText(this.scene, 7 * dpr, -tipsHeight + 60 * this.dpr, "", {
      color: "#333333",
      fontSize: 12 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
      lineSpacing: 6 * dpr,
      padding: {
        top: 2 * dpr
      }
    }).setOrigin(0);
    this.tipsText.setWrapMode("string");
    this.mExpires = new BBCodeText(scene, 7 * dpr, 85 * dpr, "", {
      fontSize: 12 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
    }).setOrigin(0);
    this.add([this.tipsbg, this.tipsText, this.mExpires]);
    this.tipsText.addImage("iv_coin", { key: this.key, frame: "home_silver", y: -3 * this.dpr });
    this.tipsText.addImage("iv_diamond", { key: this.key, frame: "home_diamond", y: -3 * this.dpr });
  }

  setProp(prop: any, servertime: number, property: any): this {// op_client.ICountablePackageItem, PlayerProperty
    if (!prop) {
      this.tipsText.setText(i18n.t("furni_bag.empty_backpack"));
      this.mExpires.text = "";
      this.resize();
    } else {
      this.tipsText.setWrapWidth(undefined);
      const name = `[color=#32347b][b][size=${14 * this.dpr}]${prop.shortName || prop.name}[/size][/b][/color]`;
      // let price = "";
      let source = "";
      let describle = "";
      let attri = "";
      let need = "";
      let tips = name + "\n";
      let maxWidth: number = 100 * this.dpr;
      this.tipsText.text = tips;
      maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      // if (prop.recyclable) {
      //   // if (prop.sellingPrice) {
      //   //   price = `${i18n.t("furni_bag.sale_price")}: [img=${Coin.getIcon(prop.sellingPrice.coinType)}] ${prop.sellingPrice.price}`;
      //   //   tips += `[color=#ff0000][size=${12 * this.dpr}]${price}[/size][/color]`;
      //   //   this.tipsText.text = price;
      //   //   maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      //   // }
      // } else {
      //   price = i18n.t("furni_bag.not_sale");
      //   tips += `[color=#ff0000][size=${12 * this.dpr}]${price}[/size][/color]`;
      //   this.tipsText.text = price;
      //   maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      // }
      if (prop.source) {
        // source = `${i18n.t("furni_bag.source")}：${prop.source}`;
        source = `${prop.source}`;
        tips += `[color=#ffffff][size=${12 * this.dpr}]${source}[/size][/color]`;
        this.tipsText.text = source;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      if (prop.des && prop.des !== "") {
        describle = prop.des;
        tips += "\n" + describle;
        this.tipsText.text = describle;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      let isline = false;
      if (prop.affectValues) {
        const len = prop.affectValues.length;
        for (let i = 0; i < len; i++) {
          const affect = prop.affectValues[i];
          if (property.propertiesMap) {
            const proper = property.propertiesMap.get(affect.key);
            if (proper) {
              const value = affect.value > 0 ? `[color=#ffff00]+${affect.value}[/color]` : `[color=#ff0000]${affect.value}[/color]`;
              attri += `\n${proper.name}: ${value}`;
            }
          }
        }
        if (attri.length > 0) {
          if (!isline) {
            isline = true;
            tips += "\n-- -- -- -- -- -- -- --";
          }
          tips += `\n[color=#ffffff]${i18n.t("furni_bag.properties")}[/color]` + `${attri}`;
        }
      }
      if (prop.requireValues) {
        const len = prop.requireValues.length;
        for (let i = 0; i < len; i++) {
          const require = prop.requireValues[i];
          if (property.propertiesMap) {
            const proper = property.propertiesMap.get(require.key);
            if (proper) {
              const value = proper.value >= require.value ? `[color=#00ff00](${require.value})[/color]` : `[color=#ff0000](${require.value})[/color]`;
              need += `\n${proper.name}: ${value}`;
            }
          }
        }
        if (need.length > 0) {
          if (!isline) {
            isline = true;
            tips += "\n-- -- -- -- -- -- -- --";
          }
          tips += `\n${i18n.t("furni_bag.needproper")}:${need}`;
        }
      }
      this.tipsText.setWrapWidth(maxWidth);
      this.tipsText.text = tips;
      this.width = maxWidth + 14 * this.dpr;
      if (prop.expiredTime > 0) {
        if (!isline) {
          isline = true;
          tips += "\n-- -- -- -- -- -- -- --";
        }
        let interval = prop.expiredTime - servertime;
        const timeout = () => {
          (<any>this.mExpires).visible = true;
          this.mExpires.text = this.getDataFormat(interval * 1000);
          if (interval > 0) {
            this.timeID = setTimeout(() => {
              interval -= 1;
              timeout();
            }, 1000);
          } else {
            this.timeID = undefined;
          }
        };
        timeout();
      } else {
        (<any>this.mExpires).visible = false;
        if (this.timeID) clearTimeout(this.timeID);
      }
      this.resize();
    }
    return this;
  }
  private resize(w?: number, h?: number) {
    const mixheight: number = 96 * this.dpr;
    let height = this.tipsText.height;
    if ((<any>this.mExpires).visible) height += this.mExpires.height + 3 * this.dpr;
    height += 14 * this.dpr;
    height = height < mixheight ? mixheight : height;
    this.setSize(this.width, height);
    this.tipsbg.resize(this.width, this.height);
    this.tipsbg.x = this.width * 0.5;
    this.tipsbg.y = this.height * 0.5;
    this.tipsText.y = 7 * this.dpr;
    this.mExpires.y = this.tipsText.y + this.tipsText.height + 3 * this.dpr;

  }

  private getDataFormat(time: number) {
    const day = Math.floor(time / 86400000);
    const hour = Math.floor(time / 3600000) % 24;
    const minute = Math.floor(time / 60000) % 60;
    const second = Math.floor(time / 1000) % 60;
    let text = i18n.t("furni_bag.timelimit") + ":  ";
    if (day > 0) {
      const temptime = `${day}-${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    } else if (hour > 0 || minute > 0 || second > 0) {
      const temptime = `${this.stringFormat(hour)}:${this.stringFormat(minute)}:${this.stringFormat(second)}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    } else {
      const temptime = `${i18n.t("furni_bag.expires")}`;
      text += `[color=#FF0000]${temptime}[/color]`;
    }
    // else if (minute > 0) {
    //   const temptime = `${this.stringFormat(minute)}:${this.stringFormat(second)}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // } else if (second > 0) {
    //   const temptime = `${this.stringFormat(second)}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // }
    //  else {
    //   const temptime = `${i18n.t("furni_bag.expires")}`;
    //   text += `[color=#FF0000]${temptime}[/color]`;
    // }
    return text;
  }
  private stringFormat(num: number) {
    let str = num + "";
    if (str.length <= 1) {
      str = "0" + str;
    }
    return str;
  }
}

class Item extends Phaser.GameObjects.Container {
  public propData: any;// op_client.ICountablePackageItem
  private mCounter: Phaser.GameObjects.Text;
  private mPropImage: DynamicImage;
  private selectbg: Phaser.GameObjects.Image;
  private selectIcon: Phaser.GameObjects.Image;
  private timeIcon: Phaser.GameObjects.Image;
  private dpr: number;
  private zoom: number;
  private key: string;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
    super(scene, x, y);
    this.dpr = dpr;
    this.zoom = zoom;
    this.key = key;
    const background = scene.make.image({
      key,
      frame: "grid_bg"
    }, false);
    background.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.selectbg = scene.make.image({
      key,
      frame: "grid_choose"
    }, false);
    this.selectbg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.setSize(background.displayWidth, background.displayHeight);
    this.selectIcon = scene.make.image({
      key,
      frame: "selected"
    }, false).setOrigin(1).setPosition(this.width * 0.5, this.height * 0.5);
    this.selectIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mPropImage = new DynamicImage(this.scene, 0, 0);
    this.mPropImage.scale = dpr / this.zoom;
    this.timeIcon = scene.make.image({ key, frame: "time" });
    this.timeIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.timeIcon.setPosition(-this.width * 0.5 + this.timeIcon.width * 0.5, -this.height * 0.5 + this.timeIcon.height * 0.5);
    this.mCounter = scene.make.text({
      x: this.width * 0.5 - 2 * dpr,
      y: this.height * 0.5,
      style: {
        fontSize: 12 * dpr,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(1);
    this.add([background, this.selectbg, this.selectIcon, this.mPropImage, this.timeIcon, this.mCounter]);
    this.isSelect = false;
    this.isEquip = false;
  }

  setProp(prop: any) {// op_client.ICountablePackageItem
    this.propData = prop;
    this.isSelect = false;
    this.isEquip = false;
    this.mPropImage.visible = false;
    if (!prop) {
      // this.mPropImage.setFrame("");
      this.mCounter.visible = false;
      this.timeIcon.visible = false;
      return;
    }
    if (!prop.tag || JSON.parse(prop.tag).type !== "remove") {
      this.mPropImage.scale = this.dpr / this.zoom;
      this.mPropImage.load(Url.getOsdRes(prop.display.texturePath), this, this.onPropLoadCompleteHandler);
    } else {
      this.mPropImage.setTexture(UIAtlasName.uicommon, "backpack_close");
      this.mPropImage.scale = 1;
      this.mPropImage.visible = true;
    }
    this.timeIcon.visible = prop.expiredTime > 0;
    if (prop.count > 1) {
      this.mCounter.visible = true;
      this.mCounter.setText(prop.count.toString());
    } else {
      this.mCounter.visible = false;
    }
    if (prop.rightSubscript === 1) {// op_pkt_def.PKT_Subscript.PKT_SUBSCRIPT_CHECKMARK
      this.isEquip = true;
    } else this.isEquip = false;
  }

  private onPropLoadCompleteHandler() {
    if (this.mPropImage && this.mPropImage.texture) {
      const texture = this.mPropImage.texture;
      this.mPropImage.visible = true;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

  public set isSelect(value) {
    this.selectbg.visible = value;
  }

  public set isEquip(value) {
    this.selectIcon.visible = value;
  }
}

class MoreButtonPanel extends Phaser.GameObjects.Container {
  private blackGraphic: Phaser.GameObjects.Graphics;
  private topbg: ThreeSlicePath;
  private place: BackgroundScaleButton;
  private sell: BackgroundScaleButton;
  private dpr: number;
  private send: Handler;
  private itemdata: op_client.CountablePackageItem;
  constructor(scene: Phaser.Scene, width: number, height: number, dpr) {
    super(scene);
    this.dpr = dpr;
    this.setSize(width, height);
    this.init();
  }

  public setItemData(data: op_client.CountablePackageItem, category: number) {
    this.itemdata = data;
    this.setLayoutType(category);
  }
  /**
   *
   * @param type 1 || 5 - 家具 3 - 道具
   */
  public setLayoutType(type: number) {
    this.place.visible = false;
    this.sell.visible = false;
    this.removeListen();
    if (type === 1 || type === 5) {
      this.place.visible = true;
      this.place.y = this.height * 0.5 - this.place.height * 0.5;
      this.topbg.y = this.place.y - this.place.height * 0.5 - this.topbg.height * 0.5;
      this.place.on(ClickEvent.Tap, this.onPlaceHandler, this);
    } else if (type === 3) {
      this.sell.visible = true;
      this.sell.y = this.height * 0.5 - this.sell.height * 0.5;
      this.topbg.y = this.sell.y - this.sell.height * 0.5 - this.topbg.height * 0.5;
      this.sell.on(ClickEvent.Tap, this.onSellHandler, this);
    }
    this.on("pointerdown", this.hide, this);
  }

  public setHandler(send: Handler) {
    this.send = send;
  }

  public show() {
    this.addListen();
    this.visible = true;
  }

  public hide() {
    this.removeListen();
    this.visible = false;
  }

  protected addListen() {
    // this.place.on(ClickEvent.Tap, this.onPlaceHandler, this);
    // this.sell.on(ClickEvent.Tap, this.onSellHandler, this);
    // this.on("pointerdown", this.hide, this);
  }

  protected removeListen() {
    this.place.off(ClickEvent.Tap, this.onPlaceHandler, this);
    this.sell.off(ClickEvent.Tap, this.onSellHandler, this);
    this.off("pointerdown", this.hide, this);
  }
  protected init() {
    this.blackGraphic = this.scene.make.graphics(undefined, false);
    this.blackGraphic.clear();
    this.blackGraphic.fillStyle(0x000000, 0.66);
    this.blackGraphic.fillRect(0, 0, this.width, this.height);
    this.blackGraphic.x = -this.width * 0.5;
    this.blackGraphic.y = -this.height * 0.5;
    this.topbg = new ThreeSlicePath(this.scene, 0, 0, 327 * this.dpr, 10 * this.dpr, UIAtlasName.uicommon, ["bag_more_left", "bag_more_middle", "bag_more_right"]);
    this.place = new BackgroundScaleButton(this.scene, 327 * this.dpr, 53 * this.dpr, UIAtlasName.uicommon, "bag_more_uncheck", "bag_more_select", i18n.t("furni_bag.add"), this.dpr, 1, false);
    this.place.setTextStyle(UIHelper.blackStyle(this.dpr, 20));
    this.sell = new BackgroundScaleButton(this.scene, 327 * this.dpr, 53 * this.dpr, UIAtlasName.uicommon, "bag_more_uncheck", "bag_more_select", i18n.t("common.sold"), this.dpr, 1, false);
    this.sell.setTextStyle(UIHelper.blackStyle(this.dpr, 20));
    this.add([this.blackGraphic, this.topbg, this.place, this.sell]);
    this.setInteractive();
  }

  private onPlaceHandler() {
    if (this.send) this.send.runWith(["place", this.itemdata]);
    this.hide();
  }

  private onSellHandler() {
    if (this.send) this.send.runWith(["sell", this.itemdata]);
    this.hide();
  }

}
