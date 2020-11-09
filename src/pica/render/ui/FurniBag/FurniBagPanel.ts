import { NineSliceButton, GameGridTable, GameScroller, TabButton, Button, BBCodeText, Text, NineSlicePatch } from "apowophaserui";
import { BasePanel, CheckboxGroup, DynamicImage, InputPanel, Render, TextButton, UiManager } from "gamecoreRender";
import { DetailDisplay } from "picaRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { Coin, Font, Handler, i18n, Logger, Url } from "utils";

export class FurniBagPanel extends BasePanel {
  private commonkey = "common_key";
  private seachKey: string = "key.seach";
  private mCloseBtn: Phaser.GameObjects.Image;
  private topCheckBox: CheckboxGroup;
  private mBackground: Phaser.GameObjects.Graphics;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mDetailDisplay: DetailDisplay;
  private mAdd: NineSliceButton;
  private mBg: Phaser.GameObjects.Image;
  private mSeachInput: SeachInput;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: any;// op_def.IStrPair
  private mPropGrid: GameGridTable;
  private mCategoryScroll: GameScroller;
  private sellBtn: NineSliceButton;
  private useBtn: NineSliceButton;
  private saveBtn: NineSliceButton;
  private resetBtn: NineSliceButton;
  private topBtns: TabButton[] = [];

  private mDetailBubble: DetailBubble;
  private mSceneType: any;// op_def.SceneTypeEnum
  private mEnableEdit: boolean = false;
  private mInputBoo: boolean = false;
  private categoryType: any;// op_pkt_def.PKT_PackageType
  private mSelectedItemData: any[] = [];// op_client.ICountablePackageItem
  private mSelectedItems: Item[] = [];
  private dressAvatarIDS: string[];
  constructor(uiManager: UiManager, sceneType: any) {// sceneType: op_def.SceneTypeEnum
    super(uiManager.scene, uiManager.render);
    this.key = ModuleName.FURNIBAG_NAME;
    this.mSceneType = sceneType;
    this.setInteractive();
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    super.resize(width, height);
    this.mBackground.clear();
    this.mBackground.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackground.fillRect(0, 0, width, height);
    this.mShelfContainer.setSize(width, 295 * this.dpr);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x33ccff);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x00cccc);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);

    this.mBg.x = width / 2;
    this.mBg.y = this.mBg.height / 2 + 10 * this.dpr;

    this.mAdd.x = width - this.mAdd.width / 2 - 10 * this.dpr;
    this.mAdd.y = this.mShelfContainer.y - this.mAdd.height / 2 - 9 * this.dpr;

    this.useBtn.x = this.mAdd.x;
    this.useBtn.y = this.mAdd.y;

    this.sellBtn.x = Math.floor(this.mAdd.x - this.sellBtn.width - 10 * this.dpr);
    this.sellBtn.y = this.mAdd.y;

    this.resetBtn.x = this.mAdd.x + 25 * this.dpr;
    this.resetBtn.y = this.mAdd.y;

    this.saveBtn.x = this.resetBtn.x - (this.saveBtn.width + this.resetBtn.width) / 2 - 10 * this.dpr;
    this.saveBtn.y = this.resetBtn.y;

    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = this.mBg.y;
    this.mPropGrid.x = width / 2;
    this.mPropGrid.y = this.mShelfContainer.y + this.mPropGrid.height * 0.5 + 50 * this.dpr;
    this.mPropGrid.layout();
    this.mPropGrid.resetMask();
    this.mCategoryScroll.refreshMask();
    this.setSize(width, height);
  }

  setCategories(subcategorys: any[]) {// op_def.IStrPair
    // subcategorys.unshift({ key: this.seachKey, value: "搜索" });
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const capW = 60 * this.dpr;
    const capH = 41 * this.dpr;
    const items = [];
    if (this.mSeachInput.parentContainer)
      this.closeSeach(null);
    (<any>this.mCategoryScroll).clearItems();
    const seachBtn = new Button(this.scene, this.key, "seach_normal", "seach_down");
    seachBtn.setData("item", { key: this.seachKey, value: i18n.t("common.search") });
    seachBtn.y = capH - 40 * this.dpr;
    this.mCategoryScroll.addItem(seachBtn);
    const allCategory = { value: "", key: "" };// op_def.StrPair
    allCategory.value = i18n.t("common.all");
    allCategory.key = "alltype";
    subcategorys.unshift(allCategory);
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, 1, subcategorys[i].value, 0, 0);
      item.x = i * capW;
      item.y = capH - item.text.height - 20 * this.dpr;
      item.setData("item", subcategorys[i]);
      item.setSize(capW, capH);
      this.mCategoryScroll.addItem(item);

      items[i] = item;
      item.setFontSize(17 * this.dpr);
      item.setFontStyle("bold");
    }
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
    this.updateCategeoriesLoc(false);
  }

  public setProp(props: any[], isupdate: boolean = false) {// op_client.ICountablePackageItem
    props = !props ? [] : props;
    this.mSelectedItems.length = 0;
    if (!isupdate) this.mSelectedItemData.length = 0;
    const len = props.length;
    if (len < 24) {
      props = props.concat(new Array(24 - len));
    }
    if (!isupdate) this.mPropGrid.setT(0);
    this.mPropGrid.setItems(props);
    if (this.categoryType !== 2) {// op_pkt_def.PKT_PackageType.AvatarPackage
      if (this.mSelectedItems.length === 0) {
        this.mPropGrid.setT(0);
        this.mSelectedItemData.length = 0;
        const cell = this.mPropGrid.getCell(0);
        this.onSelectItemHandler(cell.container);
      }
    } else {
      this.mSelectedItemData.length = 0;
      for (const prop of props) {
        if (prop && prop.rightSubscript === 1) {// op_pkt_def.PKT_Subscript.PKT_SUBSCRIPT_CHECKMARK
          this.mSelectedItemData.push(prop);
        }
      }
      if (this.mSelectedItemData.length === 0) {
        this.displayAvatar();
      } else {
        this.updateAvatarItems();
      }
    }
  }

  public setDressAvatarIds(ids: string[]) {
    this.dressAvatarIDS = ids;
    this.updateAvatarItems();
  }

  public displayAvatar(content?: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    if (!content) {
      // content = new op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE();
      // content.avatar = new op_gameconfig.Avatar();
      content = { avatar: {} };
    }
    this.render.mainPeer.getPlayerAvatar()
      .then((avatar) => {
        for (const key in avatar) {
          if (avatar.hasOwnProperty(key)) {
            const element = avatar[key];
            if (element) content.avatar[key] = element;
          }
        }
        for (const item of this.mSelectedItemData) {
          const dataAvatar = item.avatar;
          for (const key in dataAvatar) {
            if (dataAvatar.hasOwnProperty(key)) {
              const element = dataAvatar[key];
              if (element) content.avatar[key] = element;
            }
          }
        }
        const offset = new Phaser.Geom.Point(0, 50 * this.dpr);
        this.mDetailDisplay.loadAvatar(content, 2 * this.dpr, offset);
      });
  }
  public setSelectedResource(content: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.displayAvatar();
    }
  }

  public resetAvatar(avatar: any) {// op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_PKT_RESET_AVATAR
    const content = { avatar: null };// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_COMMODITY_RESOURCE
    content.avatar = avatar.avatar;
    const offset = new Phaser.Geom.Point(0, 50 * this.dpr);
    this.mDetailDisplay.loadAvatar(content, 2 * this.dpr, offset);
    this.mSelectedItemData.length = 0;
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachInput.on("seach", this.onSeachHandler, this);
    this.mAdd.on("pointerup", this.onAddFurniToSceneHandler, this);
    this.sellBtn.on("pointerup", this.onSellBtnHandler, this);
    this.useBtn.on("pointerup", this.onUseBtnHandler, this);
    this.saveBtn.on("pointerup", this.onSaveBtnHandler, this);
    this.resetBtn.on("pointerup", this.onResetBtnHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mSeachInput.off("seach", this.onSeachHandler, this);
    this.mAdd.off("pointerup", this.onAddFurniToSceneHandler, this);
    this.sellBtn.off("pointerup", this.onSellBtnHandler, this);
    this.useBtn.off("pointerup", this.onUseBtnHandler, this);
    this.saveBtn.on("pointerup", this.onSaveBtnHandler, this);
    this.resetBtn.on("pointerup", this.onResetBtnHandler, this);
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

  protected preload() {
    this.addAtlas(this.key, "furni_bag/furni_bag.png", "furni_bag/furni_bag.json");
    this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
    this.commonkey = UIAtlasKey.commonKey;
    super.preload();
  }

  protected init() {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    this.mBackground = this.scene.make.graphics(undefined, false);
    this.mBg = this.scene.make.image({
      key: this.key,
      frame: "bg"
    }, false);
    this.mBg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mShelfContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.setSize(width, 295 * this.dpr);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow",
      x: 21 * this.dpr,
      y: 30 * this.dpr
    });
    this.mCloseBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mCloseBtn.setInteractive(new Phaser.Geom.Rectangle(-28 * this.dpr, -20 * this.dpr, 56 * this.dpr, 40 * this.dpr), Phaser.Geom.Rectangle.Contains);
    const btnwidth = 90 * this.dpr;
    const btnHeight = 38 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr;
    const btnPosY = this.mShelfContainer.y - 25 * this.dpr;

    this.mAdd = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, this.commonkey, "yellow_btn", i18n.t("furni_bag.add"), "#996600");
    this.sellBtn = this.createNineButton(btnPosX, btnPosY, btnwidth, btnHeight, this.commonkey, "red_btn", i18n.t("common.sold"), "#FFFFFF");
    this.useBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, this.commonkey, "yellow_btn", i18n.t("common.use"), "#996600");
    this.saveBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, this.commonkey, "yellow_btn", i18n.t("common.save"), "#996600");
    this.resetBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY - btnHeight - 5 * this.dpr, 38 * this.dpr, 38 * this.dpr, this.commonkey, "red_btn");
    const reseticon = this.scene.make.image({ key: this.key, frame: "restore" });
    reseticon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.resetBtn.add(reseticon);
    this.mDetailDisplay = new DetailDisplay(this.scene, this.render, true);
    this.mDetailDisplay.setSize(110 * this.dpr, 110 * this.dpr);
    this.mDetailDisplay.setComplHandler(new Handler(this, () => {
      this.mDetailDisplay.visible = true;
    }));
    this.mDetailDisplay.setTexture(this.key, "ghost");
    this.mDetailDisplay.setNearest();
    //  this.mDetailDisplay.loadSprite("loading_ui", Url.getUIRes(this.dpr, "loading_ui"), Url.getUIRes(this.dpr, "loading_ui"));
    this.mDetailDisplay.y = this.mBg.y + this.mBg.height / 2;
    this.mDetailBubble = new DetailBubble(this.scene, this.key, this.dpr);
    this.mDetailBubble.x = 10 * this.dpr;

    this.mSeachInput = new SeachInput(this.scene, this.render, this.key, this.dpr);
    // this.mSeachInput.x = this.mSeachInput.width / 2 + 6 * this.dpr;
    const inputWid: number = this.mInputBoo ? 260 * this.dpr : 0;
    this.mCategoryScroll = new GameScroller(this.scene, {
      x: width * 0.5,
      y: this.mShelfContainer.y + 20 * this.dpr,
      width,
      height: 41 * this.dpr,
      zoom: this.scale,
      orientation: 1,
      dpr: this.dpr,
      // valuechangeCallback: (newValue) => {
      //   this.refreshPos(newValue);
      // },
      cellupCallBack: (gameobject) => {
        this.onSelectSubCategoryHandler(gameobject);
      }
    });
    this.add([this.mBackground, this.mBg, this.mCloseBtn, this.mDetailDisplay, this.mDetailBubble, this.mShelfContainer, this.mCategoryScroll]);
    this.add([this.sellBtn, this.useBtn, this.mAdd, this.saveBtn, this.resetBtn]);
    this.mShelfContainer.add(this.mCategoriesBar);

    const topCapW = 67 * this.dpr;
    const topCapH = 30 * this.dpr;
    const topPosY = 30 * this.dpr;
    const topStyle = {
      fontFamily: Font.DEFULT_FONT,
      fontSize: 20 * this.dpr,
      color: "#FFFFFF"
    };
    this.topCheckBox = new CheckboxGroup();
    let topCategorys = [3, 1, 2];// op_pkt_def.PKT_PackageType.PropPackage, op_pkt_def.PKT_PackageType.FurniturePackage, op_pkt_def.PKT_PackageType.AvatarPackage
    let topBtnTexts = [i18n.t("furni_bag.Props"), i18n.t("furni_bag.furni"), i18n.t("furni_bag.decorate")];
    if (this.mSceneType === 2) {// op_def.SceneTypeEnum.EDIT_SCENE_TYPE
      topCategorys = [5];// op_pkt_def.PKT_PackageType.PropPackage, op_pkt_def.PKT_PackageType.FurniturePackage, op_pkt_def.PKT_PackageType.AvatarPackage
      topBtnTexts = [i18n.t("furni_bag.furni")];
    }
    const topPosX = width * 0.5 - topCapW * 0.5 * (topCategorys.length - 1) - 20 * this.dpr;
    for (const key in topCategorys) {
      const index = Number(key);
      const category = topCategorys[index];
      const button = new TabButton(this.scene, this.key, "tab_normal", "tab_down", topBtnTexts[index]);
      button.setTextStyle(topStyle);
      button.setData("data", category);
      button.setSize(topCapW, topCapH);
      button.setFontStyle("bold");
      button.y = topPosY;
      button.x = topPosX + topCapW * index;
      this.topBtns.push(button);
    }
    this.topCheckBox.appendItemAll(this.topBtns);
    this.topCheckBox.on("selected", this.onTopCategoryHandler, this);
    this.topBtns.forEach((btn) => {
      this.add(btn);
    });
    this.render.mainPeer.isCurrentRoomEditEnable()
      .then((val) => {
        this.mEnableEdit = val;
        if (this.mEnableEdit) {
          const index = topCategorys.indexOf(5);// op_pkt_def.PKT_PackageType.EditFurniturePackage
          this.topCheckBox.selectIndex(index);
        } else {
          this.topCheckBox.selectIndex(0);
        }
      });
    const propFrame = this.scene.textures.getFrame(this.key, "grid_choose");
    const capW = (propFrame.width);
    const capH = (propFrame.height);
    const tableConfig = {
      x: 0,
      y: 0,
      table: {
        width,
        height: 260 * this.dpr,
        columns: 4,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        zoom: this.scale,
        mask: false
      },
      scrollMode: 1,
      clamplChildOY: false,
      // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new Item(scene, 0, 0, this.key, this.dpr);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        if (item && this.isSelectedItemData(item)) {
          cellContainer.isSelect = true;
          this.mSelectedItems.push(cellContainer);
        } else {
          const index = this.mSelectedItems.indexOf(cellContainer);
          if (index !== -1) this.mSelectedItems.splice(index, 1);
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

  private updateAvatarItems() {
    if (this.dressAvatarIDS && this.mSelectedItemData.length > 0) {
      const arr = [];
      for (const id of this.dressAvatarIDS) {
        for (const avatar of this.mSelectedItemData) {
          if (avatar.id === id) {
            arr.push(avatar);
          }
        }
      }
      this.mSelectedItemData.length = 0;
      this.mSelectedItemData = arr;
      this.displayAvatar();
    } else {
      let property = null;
      this.render.mainPeer.getUserData_PlayerProperty()
        .then((val) => {
          property = val;
          return this.serviceTimestamp;
        })
        .then((t) => {
          this.mDetailBubble.setProp(null, Math.floor(t / 1000), property);
          this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
        });
    }
  }
  private replaceSelectItem(data: any, cell: Item) {// op_client.ICountablePackageItem
    if (this.categoryType !== 2) {// op_pkt_def.PKT_PackageType.AvatarPackage
      if (this.mSelectedItems.length > 0) {
        this.mSelectedItems[0].isSelect = false;
      }
      this.mSelectedItemData.length = 0;
      this.mSelectedItems.length = 0;
      this.mSelectedItemData.push(data);
      this.mSelectedItems.push(cell);
      cell.isSelect = true;
    } else {
      const dataAvatar = data.avatar;
      if (!dataAvatar) {
        Logger.getInstance().error("CountablePackageItem avatar does not exist", data);
        return;
      }
      const removeArr = [];
      for (const item of this.mSelectedItemData) {
        const avatar = item.avatar;
        if (this.isContainProperty(avatar, dataAvatar)) {
          removeArr.push(item);
        }
      }
      for (const item of removeArr) {
        const index = this.mSelectedItemData.indexOf(item);
        this.mSelectedItemData.splice(index, 1);
        for (let i = 0; i < this.mSelectedItems.length; i++) {
          const cell1 = this.mSelectedItems[i];
          if (cell1.propData === item) {
            cell1.isSelect = false;
            this.mSelectedItems.splice(i, 1);
            break;
          }
        }
      }

      this.mSelectedItemData.push(data);
      this.mSelectedItems.push(cell);
      cell.isSelect = true;
    }
  }

  private isContainProperty(obj: any, obj1: any) {
    let canreplace = true;
    for (const key in obj) {
      if (key !== "headBackId" && key !== "bodyDresId" && obj.hasOwnProperty(key)) {
        if (!obj1.hasOwnProperty(key)) {
          canreplace = false;
          break;
        }
      }
    }
    return canreplace;
  }

  private isSelectedItemData(data: any) {// op_client.ICountablePackageItem
    if (this.mSelectedItemData.length > 0) {
      for (const temp of this.mSelectedItemData) {
        if (temp.indexId === data.indexId) {
          return true;
        }
      }
    } else {
      if (data.rightSubscript === 1) return true;// op_pkt_def.PKT_Subscript.PKT_SUBSCRIPT_CHECKMARK
    }

    return false;
  }
  private setSelectedItem(prop: any) {// op_client.ICountablePackageItem
    this.sellBtn.enable = prop.recyclable;
    this.useBtn.enable = prop.executable;
    this.mAdd.enable = (this.mSceneType === 2 || this.mEnableEdit);// op_def.SceneTypeEnum.EDIT_SCENE_TYPE
    if (this.categoryType === 2) {// op_pkt_def.PKT_PackageType.AvatarPackage
      this.saveBtn.enable = true;
      this.resetBtn.enable = true;
    }

    this.mDetailDisplay.loadSprite("loading_ui", Url.getUIRes(this.dpr, "loading_ui"), Url.getUIRes(this.dpr, "loading_ui"));
    const content = { avatar: null, display: null, animations: null };// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
    if (prop.avatar) {
      content.avatar = prop.avatar;
    } else {
      content.display = prop.display;
    }
    content.animations = prop.animations;
    this.setSelectedResource(content);
  }

  private onSelectSubCategoryHandler(gameobject: TextButton) {
    const type = gameobject.getData("type");
    if (type) {
      if (type === "seachBtn") {
        this.onSeachHandler(this.mSeachInput.seachText);
      } else if (type === "label") {
        this.mSeachInput.showInputPanel();
      }
      return;
    }

    const category: any = gameobject.getData("item");// op_def.IStrPair
    if (category) {
      if (this.mPreCategoryBtn && (this.mPreCategoryBtn instanceof TextButton)) {
        this.mPreCategoryBtn.changeNormal();
      }
      if (gameobject instanceof TextButton)
        gameobject.changeDown();
      let key = category.key;
      if (key === this.seachKey) {
        this.showSeach(gameobject);
      } else {
        if (this.mPreCategoryBtn) {
          const preBtn = this.mPreCategoryBtn.getData("item");
          key = preBtn.key;
          if (key === this.seachKey) {
            this.closeSeach(gameobject);
          }
        } else {
          this.closeSeach(gameobject);
        }
        this.mSelectedCategeories = category;
        this.queryPackege();
      }
      this.mPreCategoryBtn = gameobject;
    }
    this.mPropGrid.setT(0);
  }

  private onCloseHandler() {
    this.render.renderEmitter("close");
  }

  private queryPackege(isupdate: boolean = false) {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter("queryPackage", { packType: this.categoryType, key: this.mSelectedCategeories.key, isupdate });
    }
  }

  private onSelectItemHandler(cell: Item) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (this.mSelectedItemData.indexOf(item) !== -1) return;

    let property = null;
    this.render.mainPeer.getUserData_PlayerProperty()
      .then((val) => {
        property = val;
        return this.serviceTimestamp;
      })
      .then((t) => {
        this.mDetailBubble.setProp(item, Math.floor(t / 1000), property);
        this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
      });
    if (item) {
      this.replaceSelectItem(item, cell);
      this.setSelectedItem(item);
    } else {
      if (this.categoryType !== 2 && this.mSelectedItemData.length === 0) {// op_pkt_def.PKT_PackageType.AvatarPackage
        this.sellBtn.enable = false;
        this.useBtn.enable = false;
        this.mAdd.enable = false;
        this.saveBtn.enable = false;
        this.resetBtn.enable = false;
        this.mDetailDisplay.setTexture(this.key, "ghost");
        this.mDetailDisplay.setNearest();
      }
    }
  }

  private onSeachHandler(val: string) {
    if (this.mSelectedCategeories && val.length > 0) {
      this.render.renderEmitter("seachPackage", { query: val, categories: this.mSelectedCategeories.key });
    }
  }

  private onAddFurniToSceneHandler() {
    if (!this.mSelectedItemData) {
      return;
    }
    this.render.renderEmitter("addFurniToScene", this.mSelectedItemData[0].id);
  }

  private onTopCategoryHandler(item: Button) {
    const categoryType = item.getData("data");
    const width = this.scaleWidth;
    this.mSelectedItemData.length = 0;
    // this.mDetailDisplay.setTexture(this.key, "ghost");
    // this.mDetailDisplay.setNearest();
    if (categoryType) {
      this.onSelectedCategory(categoryType);
      if (categoryType === 1 || categoryType === 5) {// op_pkt_def.PKT_PackageType.FurniturePackage || op_pkt_def.PKT_PackageType.EditFurniturePackage
        this.sellBtn.visible = true;
        this.mAdd.visible = true;
        this.useBtn.visible = false;
        this.saveBtn.visible = false;
        this.resetBtn.visible = false;
      } else if (categoryType === 2) {// op_pkt_def.PKT_PackageType.AvatarPackage
        this.sellBtn.visible = false;
        this.saveBtn.visible = true;
        this.resetBtn.visible = true;
        this.useBtn.visible = false;
        this.mAdd.visible = false;
      } else {
        this.sellBtn.visible = true;
        this.useBtn.visible = true;
        this.mAdd.visible = false;
        this.saveBtn.visible = false;
        this.resetBtn.visible = false;
      }
    }
    this.layoutTopBtn(item);
  }

  private layoutTopBtn(button: Button) {
    const width = this.scaleWidth;
    let allRadiu = 0;
    for (const btn of this.topBtns) {
      allRadiu += btn.width + 5 * this.dpr;
    }
    allRadiu /= 2;
    let offsetX: number = width * 0.5 - allRadiu;

    for (const btn of this.topBtns) {
      let posY = 0;
      if (btn !== button) {
        btn.setTextStyle({
          fontFamily: Font.DEFULT_FONT,
          fontSize: 12 * this.dpr,
          color: "#2B4BB5"
        });
        posY = btn.height * 0.5;
      } else {
        btn.setTextStyle({
          fontFamily: Font.DEFULT_FONT,
          fontSize: 16 * this.dpr,
          color: "#8B5603"
        });
        posY = btn.height * 0.5 + 2 * this.dpr;
      }
      const radiu = btn.width * 0.5;
      btn.x = offsetX + radiu;
      btn.y = posY;
      offsetX += radiu * 2 + 12 * this.dpr;
    }
  }

  private onSelectedCategory(categoryType: number) {
    this.categoryType = categoryType;
    if (categoryType === 2) {// op_pkt_def.PKT_PackageType.AvatarPackage
      this.render.renderEmitter("queryDressAvatarIDS");
    }
    this.render.renderEmitter("getCategories", categoryType);
  }

  private onSellBtnHandler() {
    this.mCategoryScroll.removeListen();
    if (this.mSelectedItemData.length > 0) {
      const data = this.mSelectedItemData[0];
      const title = i18n.t("common.sold");
      const resource = { avatar: null, display: null, animations: null };// op_client.OP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE
      if (data.avatar) {
        resource.avatar = data.avatar;
      } else {
        resource.display = data.display;
      }
      resource.animations = data.animations;
      const confirmHandler = new Handler(this, this.onSellPropsHandler, [this.categoryType]);
      const cancelHandler = new Handler(this, () => {
        this.mCategoryScroll.addListen();
      });
      this.showPropFun({ confirmHandler, data, cancelHandler, title, resource });
    }
  }

  private onUseBtnHandler() {
    this.mCategoryScroll.removeListen();
    if (this.mSelectedItemData.length > 0) {
      const data = this.mSelectedItemData[0];
      const title = i18n.t("common.use");
      const confirmHandler = new Handler(this, this.onUsePropsHandler);
      const cancelHandler = new Handler(this, () => {
        this.mCategoryScroll.addListen();
      });
      this.showPropFun({ confirmHandler, data, cancelHandler, price: false, title });
    }
  }
  private onSaveBtnHandler() {
    // if (this.mSelectedItemData.length > 0) {
    this.dressAvatarIDS.length = 0;
    const idsArr = [];
    for (const item of this.mSelectedItemData) {
      idsArr.push(item.id);
      this.dressAvatarIDS.push(item.id);
    }
    this.render.renderEmitter("querySaveAvatar", idsArr);
    // this.queryPackege();
    // }
  }

  private onResetBtnHandler() {
    // if (this.mSelectedItemData.length > 0)
    this.render.renderEmitter("queryResetAvatar");
  }
  private onSellPropsHandler(category: number, prop: any, count: number) {// op_client.CountablePackageItem
    this.mCategoryScroll.addListen();
    this.render.renderEmitter("sellProps", { prop, count, category });
  }

  private onUsePropsHandler(prop: any, count: number) {// op_client.CountablePackageItem
    this.mCategoryScroll.addListen();
    this.render.renderEmitter("useprops", { itemid: prop.id, count });
  }

  private showSeach(parent: TextButton) {
    this.mCategoryScroll.addItemAt(this.mSeachInput, 1);
    this.mCategoryScroll.setInteractiveObject(this.mSeachInput.seachBtn);
    this.mCategoryScroll.setInteractiveObject(this.mSeachInput.label);

    this.updateCategeoriesLoc(true);
  }

  private closeSeach(parent: TextButton) {
    if (this.mSeachInput.parentContainer) {
      this.mSeachInput.parentContainer.remove(this.mSeachInput);
    }
    this.mCategoryScroll.removeInteractiveObject(this.mSeachInput.seachBtn);
    this.mCategoryScroll.removeInteractiveObject(this.mSeachInput.label);
    this.updateCategeoriesLoc(false);
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

  get enableEdit() {
    return this.mEnableEdit;
  }

  private showPropFun(config: any) {// PicPropFunConfig
    this.render.mainPeer.showMed("PicPropFun", config);
  }

  private get serviceTimestamp(): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      this.render.mainPeer.requestCurTime().then((t) => {
        resolve(t);
      });
    });
  }
}

class SeachInput extends Phaser.GameObjects.Container {
  private mSeachBtn: Phaser.GameObjects.Image;
  private mLabelInput: Phaser.GameObjects.Text;
  private mInputText: InputPanel;
  private bg: Phaser.GameObjects.Image;
  private mText: string = "";
  private dpr: number;
  private mRender: Render;
  constructor(scene: Phaser.Scene, render: Render, key: string, dpr: number) {
    super(scene);
    this.mRender = render;
    this.dpr = dpr;
    this.bg = scene.make.image({
      key,
      frame: "seach_bg"
    }, false).setOrigin(0.5, 0.5);
    this.bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mLabelInput = this.scene.make.text({
      x: 0,
      width: this.bg.width,
      height: this.bg.height,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr,
      }
    }, false).setOrigin(0, 0.5);
    this.mLabelInput.setSize(this.bg.width, this.bg.height);
    this.mLabelInput.setInteractive();
    this.mSeachBtn = scene.make.image({
      key,
      frame: "seach_normal"
    }, false).setData("type", "seachBtn");
    this.mSeachBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mLabelInput.x = -this.bg.width / 2 + 6 * dpr * render.uiScale;
    this.mSeachBtn.x = this.bg.width / 2 - this.mSeachBtn.width,
      this.add([this.bg, this.mLabelInput, this.mSeachBtn]);
    this.disableInteractive();
    this.setSize(this.bg.width, this.bg.height);
    this.setData("type", "label");
  }

  public showInputPanel() {
    if (this.mInputText) {
      return;
    }
    this.mInputText = new InputPanel(this.scene, this.mRender, this.mText);
    this.mInputText.once("close", this.sendChat, this);
  }

  private sendChat(val: string) {
    this.mText = val;
    this.mInputText.destroy();
    this.mInputText = null;
    if (val.length > 10) {
      const maxWidth = this.bg.width - 20 * this.dpr;
      for (let i = 10; i < val.length; i++) {
        const text = val.slice(0, i);
        const width = this.mLabelInput.setText(text).width;
        if (width > maxWidth) {
          break;
        }
      }
    } else
      this.mLabelInput.setText(val);
    this.mLabelInput.setSize(this.bg.width, this.bg.height);
  }

  get seachBtn(): Phaser.GameObjects.Image {
    return this.mSeachBtn;
  }

  get label(): Phaser.GameObjects.Text {
    return this.mLabelInput;
  }

  get seachText(): string {
    return this.mText;
  }
}

class DetailBubble extends Phaser.GameObjects.Container {

  private dpr: number;
  private timeID: any;
  private tipsbg: NineSlicePatch;
  private tipsText: BBCodeText;
  private mExpires: BBCodeText;
  // private testText: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.dpr = dpr;
    const tipsWidth = 100 * dpr;
    const tipsHeight = 96 * dpr;
    this.setSize(tipsWidth, tipsHeight);
    this.tipsbg = new NineSlicePatch(this.scene, 0, 0, tipsWidth, tipsHeight, UIAtlasKey.common2Key, "tips_bg", {
      left: 10 * this.dpr,
      top: 10 * this.dpr,
      right: 10 * this.dpr,
      bottom: 10 * this.dpr
    }, undefined, undefined, 0);
    this.tipsbg.setPosition(tipsWidth * 0.5, tipsHeight * 0.5);
    this.tipsbg.alpha = 0.6;
    this.tipsText = new BBCodeText(this.scene, 7 * dpr, -tipsHeight + 60 * this.dpr, "", {
      color: "#333333",
      fontSize: 10 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
      lineSpacing: 6 * dpr,
      padding: {
        top: 2 * dpr
      }
    }).setOrigin(0);
    this.tipsText.setWrapMode("string");
    this.mExpires = new BBCodeText(scene, 7 * dpr, 85 * dpr, "", {
      fontSize: 10 * this.dpr,
      fontFamily: Font.DEFULT_FONT,
    }).setOrigin(0);
    this.add([this.tipsbg, this.tipsText, this.mExpires]);
    this.tipsText.addImage("iv_coin", { key: UIAtlasKey.commonKey, frame: "iv_coin", y: -3 * this.dpr });
    this.tipsText.addImage("iv_diamond", { key: UIAtlasKey.commonKey, frame: "iv_diamond", y: -3 * this.dpr });
  }

  setProp(prop: any, servertime: number, property: any): this {// op_client.ICountablePackageItem, PlayerProperty
    if (!prop) {
      this.tipsText.setText(i18n.t("furni_bag.empty_backpack"));
      this.mExpires.text = "";
      this.resize();
    } else {
      this.tipsText.setWrapWidth(undefined);
      const name = `[color=#32347b][b][size=${14 * this.dpr}]${prop.shortName || prop.name}[/size][/b][/color]`;
      let price = "";
      let source = "";
      let describle = "";
      let attri = "";
      let need = "";
      let tips = name + "\n";
      let maxWidth: number = 100 * this.dpr;
      this.tipsText.text = tips;
      maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      if (prop.recyclable) {
        if (prop.sellingPrice) {
          price = `${i18n.t("furni_bag.sale_price")}: [img=${Coin.getIcon(prop.sellingPrice.coinType)}] ${prop.sellingPrice.price}`;
          tips += `[color=#ff0000][size=${12 * this.dpr}]${price}[/size][/color]`;
          this.tipsText.text = price;
          maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
        }
      } else {
        price = i18n.t("furni_bag.not_sale");
        tips += `[color=#ff0000][size=${12 * this.dpr}]${price}[/size][/color]`;
        this.tipsText.text = price;
        maxWidth = maxWidth < this.tipsText.width ? this.tipsText.width : maxWidth;
      }
      if (prop.source) {
        // source = `${i18n.t("furni_bag.source")}：${prop.source}`;
        source = `${prop.source}`;
        tips += `\n[color=#ffffff][size=${12 * this.dpr}]${source}[/size][/color]`;
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
          if (property.hasProperty(affect.key)) {
            const proper = property.getProperty(affect.key);
            const value = affect.value > 0 ? `[color=#ffff00]+${affect.value}[/color]` : `[color=#ff0000]${affect.value}[/color]`;
            attri += `\n${proper.name}: ${value}`;
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
          if (property.hasProperty(require.key)) {
            const proper = property.propertiesMap.get(require.key);
            const value = proper.value >= require.value ? `[color=#00ff00](${require.value})[/color]` : `[color=#ff0000](${require.value})[/color]`;
            need += `\n${proper.name}: ${value}`;
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

  private getComparTag(value: number) {
    let tag = "";
    switch (value) {
      case 1:
        tag = "=";
      case 2:
        tag = "!=";
      case 3:
        tag = "<=";
      case 4:
        tag = "<";
      case 5:
        tag = ">=";
      case 6:
        tag = ">";
      default:
        tag = "=";
    }
    return tag;
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
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
    super(scene, x, y);
    this.dpr = dpr;
    this.zoom = zoom;
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
    this.mPropImage.scale = dpr;
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
    if (!prop) {
      // this.mPropImage.setFrame("");
      this.mCounter.visible = false;
      this.mPropImage.visible = false;
      this.timeIcon.visible = false;
      return;
    }
    this.mPropImage.load(Url.getOsdRes(prop.display.texturePath), this, this.onPropLoadCompleteHandler);
    this.mPropImage.visible = true;
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
      this.mPropImage.displayHeight = 45 * this.dpr;
      this.mPropImage.scaleX = this.mPropImage.scaleY;
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
