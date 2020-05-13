import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
import { DetailDisplay } from "../Market/DetailDisplay";
import { Font } from "../../utils/font";
import { op_client, op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { TextButton } from "../Market/TextButton";
import { Url } from "../../utils/resUtil";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import { InputPanel } from "../components/input.panel";
import { CheckboxGroup } from "../components/checkbox.group";
import { NinePatch } from "../components/nine.patch";
import { Handler } from "../../Handler/Handler";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { TabButton } from "../../../lib/rexui/lib/ui/tab/TabButton";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";

export class FurniBagPanel extends BasePanel {
  private key: string = "furni_bag";
  private commonkey = "common_key";
  private seachKey: string = "key.seach";
  private mCloseBtn: Phaser.GameObjects.Image;
  private topCheckBox: CheckboxGroup;
  private mBackground: Phaser.GameObjects.Graphics;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mCategeoriesContainer: Phaser.GameObjects.Container;
  // private mPropsContainer: Phaser.GameObjects.Container;
  private mDetailDisplay: DetailDisplay;
  private mAdd: NinePatchButton;
  private mBg: Phaser.GameObjects.Image;
  private mSeachInput: SeachInput;
  private mSelectedItemData: op_client.ICountablePackageItem;
  private mSelectItem: Item;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: op_def.IStrPair;
  private mPropGrid: GameGridTable;
  private mCategoryScroll: GameScroller;
  private sellBtn: NinePatchButton;
  private useBtn: NinePatchButton;
  private topBtns: TabButton[] = [];

  private mDetailBubble: DetailBubble;
  private itemPopPanel: ItemsPopPanel;
  private mSceneType: op_def.SceneTypeEnum;
  private mEnableEdit: boolean = false;
  private mInputBoo: boolean = false;
  private categoryType: op_def.EditModePackageCategory;
  private scrollItemWidth: number = 0;
  constructor(scene: Phaser.Scene, world: WorldService, sceneType: op_def.SceneTypeEnum) {
    super(scene, world);
    this.mSceneType = sceneType;
    this.scale = 1;
    this.setInteractive();
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width / this.scale;
    const height = this.scene.cameras.main.height / this.scale;
    super.resize(width, height);
    const zoom = this.mWorld.uiScale;
    this.mBackground.clear();
    this.mBackground.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackground.fillRect(0, 0, width * zoom, height * zoom);
    this.mShelfContainer.setSize(width, 295 * this.dpr * zoom);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr * zoom - this.mDetailBubble.height;

    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x33ccff);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr * zoom);
    this.mCategoriesBar.fillStyle(0x00cccc);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr * zoom, width, 3 * this.dpr * zoom);
    this.mCategeoriesContainer.setSize(width, 43 * this.dpr * zoom);
    this.mCategeoriesContainer.y = this.mShelfContainer.y;
    this.mSeachInput.y = this.mCategoriesBar.y + 20 * this.dpr * zoom;

    // this.mPropsContainer.y = 7 * this.dpr * zoom + this.mCategeoriesContainer.height;

    this.mBg.x = width / 2;
    this.mBg.y = this.mBg.height / 2 + 10 * this.dpr * zoom;

    //  this.mTiltle.x = width / 2;
    // this.mCategoryScroll.resize(width, 41 * this.dpr * zoom);
    this.mAdd.x = width - this.mAdd.width / 2 - 10 * this.dpr;
    this.mAdd.y = this.mShelfContainer.y - this.mAdd.height / 2 - 9 * this.dpr * zoom;

    this.useBtn.x = this.mAdd.x;
    this.useBtn.y = this.mAdd.y;

    this.sellBtn.x = this.mAdd.x - this.sellBtn.width - 10 * this.dpr;
    this.sellBtn.y = this.mAdd.y;

    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = this.mBg.y;
    this.mPropGrid.refreshPos(this.mShelfContainer.width / 2, this.mShelfContainer.y + 170 * this.dpr * zoom, 8 * this.dpr * zoom, 3 * this.dpr * zoom);
    // this.mPropGrid.y = this.mShelfContainer.y + 43 * this.dpr * zoom + 120 * this.dpr * zoom;
    this.setSize(width, height);
  }

  setCategories(subcategorys: op_def.IStrPair[]) {
    // subcategorys.unshift({ key: this.seachKey, value: "搜索" });
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const zoom = this.mWorld.uiScale;
    const capW = 56 * this.dpr * zoom;
    const capH = 41 * this.dpr * zoom;
    this.scrollItemWidth = capW;
    const items = [];
    this.mCategoryScroll.clearInteractiveObject();
    if (this.mSeachInput.parentContainer)
      this.closeSeach(null);
    for (const item of this.mCategeoriesContainer.list) {
      item.destroy();
    }
    this.mCategeoriesContainer.list.length = 0;
    const seachBtn = new Button(this.scene, this.key, "seach_normal", "seach_down");
    seachBtn.setData("item", { key: this.seachKey, value: "搜索" });
    seachBtn.y = capH - 20 * this.dpr * zoom;
    this.mCategeoriesContainer.add(seachBtn);
    this.mCategoryScroll.setInteractiveObject(seachBtn);
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, zoom, subcategorys[i].value, i * capW + 10 * this.dpr * zoom, 0);
      item.y = capH - item.text.height >> 1;
      item.setData("item", subcategorys[i]);
      this.mCategeoriesContainer.add(item);
      item.setSize(capW, capH);
      this.mCategoryScroll.setInteractiveObject(item);

      items[i] = item;
      item.setFontSize(17 * this.dpr * zoom);
      item.setFontStyle("bold");
    }
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
    this.mSeachInput.x = capW + this.mSeachInput.width / 2;
    this.mPropGrid.refreshPos(this.mShelfContainer.width / 2, this.mShelfContainer.y + 170 * this.dpr * zoom, 8 * this.dpr * zoom, 10 * this.dpr * zoom);
    this.updateCategeoriesLoc(false);
  }

  public setProp(props: op_client.ICountablePackageItem[]) {
    this.mSelectItem = null;
    if (!props) {
      return;
    }
    const len = props.length;
    if (len < 24) {
      props = props.concat(new Array(24 - len));
    }

    this.mPropGrid.setItems(props);
    let isNull = false;
    if (this.mSelectItem) {
      this.onSelectItemHandler(this.mSelectItem);
      if (!this.mSelectedItemData) {
        isNull = true;
      }
    } else {
      isNull = true;
    }
    if (isNull) {
      this.sellBtn.enable = false;
      this.useBtn.enable = false;
      this.mAdd.enable = false;
    }
  }

  public setSelectedResource(content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MARKET_QUERY_PACKAGE_ITEM_RESOURCE) {
    if (content.display) {
      this.mDetailDisplay.loadDisplay(content);
    } else if (content.avatar) {
      this.mDetailDisplay.loadAvatar(content);
    } else {
      // this.mDetailDisplay.loadUrl(this.mSelectedProp.icon);
    }
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachInput.on("seach", this.onSeachHandler, this);
    this.mAdd.on("pointerup", this.onAddFurniToSceneHandler, this);
    this.sellBtn.on("pointerup", this.onSellBtnHandler, this);
    this.useBtn.on("pointerup", this.onUseBtnHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mSeachInput.off("seach", this.onSeachHandler, this);
    this.mAdd.off("pointerup", this.onAddFurniToSceneHandler, this);
    this.sellBtn.off("pointerup", this.onSellBtnHandler, this);
    this.useBtn.off("pointerup", this.onUseBtnHandler, this);
  }

  destroy() {
    if (this.mCategoryScroll) {
      this.mCategoryScroll.destroy();
    }
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    if (this.itemPopPanel) {
      this.itemPopPanel.off("itempopclose", () => {
        this.mCategoryScroll.addListen();
      });
      this.itemPopPanel.destroy();
    }
    super.destroy();
  }

  protected preload() {
    this.addAtlas(this.key, "furni_bag/furni_bag.png", "furni_bag/furni_bag.json");
    this.addAtlas(this.commonkey, "common/ui_base.png", "common/ui_base.json");
    super.preload();
  }

  protected init() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.mBackground = this.scene.make.graphics(undefined, false);
    const zoom = this.mWorld.uiScale;

    this.mBg = this.scene.make.image({
      key: this.key,
      frame: "bg"
    }, false).setScale(zoom);

    this.mShelfContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.setSize(width, 295 * this.dpr * zoom);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    // this.mPropsContainer = this.scene.make.container(undefined, false);
    this.mCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mCategeoriesContainer.x = this.mShelfContainer.x;
    this.mCategeoriesContainer.y = this.mShelfContainer.y;

    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow",
      x: 21 * this.dpr,
      y: 30 * this.dpr
    }).setScale(zoom).setInteractive();
    const btnwidth = 90 * this.dpr * zoom;
    const btnHeight = 40 * this.dpr * zoom;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr;
    const btnPosY = this.mShelfContainer.y - 25 * this.dpr * zoom;
    this.mAdd = new NinePatchButton(this.scene, btnPosX + 100 * this.dpr * zoom, btnPosY, btnwidth, btnHeight, this.commonkey, "yellow_btn", i18n.t("furni_bag.add"), {
      left: 12 * this.dpr * zoom,
      top: 12 * this.dpr * zoom,
      right: 12 * this.dpr * zoom,
      bottom: 12 * this.dpr * zoom
    });
    this.mAdd.setTextStyle({
      color: "#996600",
      fontSize: 16 * this.dpr * zoom,
      fontFamily: Font.DEFULT_FONT
    });
    this.mAdd.setFontStyle("bold");

    this.sellBtn = new NinePatchButton(this.scene, btnPosX, btnPosY, btnwidth, btnHeight, this.commonkey, "red_btn", i18n.t("furni_bag.sold"), {
      left: 12 * this.dpr * zoom,
      top: 12 * this.dpr * zoom,
      right: 12 * this.dpr * zoom,
      bottom: 12 * this.dpr * zoom
    });
    this.sellBtn.setTextStyle({
      color: "#FFFFFF",
      fontSize: 16 * this.dpr * zoom,
      fontFamily: Font.DEFULT_FONT
    });
    this.sellBtn.setFontStyle("bold");

    this.useBtn = new NinePatchButton(this.scene, btnPosX + 100 * this.dpr * zoom, btnPosY, btnwidth, btnHeight, this.commonkey, "yellow_btn", i18n.t("furni_bag.use"), {
      left: 12 * this.dpr * zoom,
      top: 12 * this.dpr * zoom,
      right: 12 * this.dpr * zoom,
      bottom: 12 * this.dpr * zoom
    });
    this.useBtn.setTextStyle({
      color: "#996600",
      fontSize: 16 * this.dpr * zoom,
      fontFamily: Font.DEFULT_FONT
    });
    this.useBtn.setFontStyle("bold");

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.setTexture(this.key, "ghost");
    this.mDetailDisplay.setNearest();
    this.mDetailDisplay.y = this.mBg.y + this.mBg.height / 2;

    this.mDetailBubble = new DetailBubble(this.scene, this.key, this.dpr, zoom);
    this.mDetailBubble.x = 10 * this.dpr;
    this.mDetailDisplay.scale = this.mWorld.scaleRatio * zoom;

    this.mSeachInput = new SeachInput(this.scene, this.mWorld, this.key, this.dpr);
    // this.mSeachInput.x = this.mSeachInput.width / 2 + 6 * this.dpr;

    this.add([this.mBackground, this.mBg, this.mCloseBtn, this.mDetailDisplay, this.mDetailBubble, this.mShelfContainer, this.mCategeoriesContainer]);
    this.add([this.sellBtn, this.useBtn, this.mAdd]);
    this.mShelfContainer.add(this.mCategoriesBar);
    // this.mCategeoriesContainer.add([this.mCategoriesBar]);
    if (this.mWorld && this.mWorld.roomManager && this.mWorld.roomManager.currentRoom) {
      this.mEnableEdit = this.mWorld.roomManager.currentRoom.enableEdit;
    }
    // if (this.mSceneType === op_def.SceneTypeEnum.EDIT_SCENE_TYPE || this.mEnableEdit) {
    //   this.add(this.mAdd);
    // }
    const topCapW = 67 * this.dpr * zoom;
    const topCapH = 30 * this.dpr * zoom;
    const topPosY = 30 * this.dpr * zoom;
    const topStyle = {
      fontFamily: Font.DEFULT_FONT,
      fontSize: 20 * this.dpr * zoom,
      color: "#FFFFFF"
    };
    this.topCheckBox = new CheckboxGroup();
    const topCategorys = [op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_ITEM, op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE, op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_AVATAR];
    const topBtnTexts = [i18n.t("furni_bag.Props"), i18n.t("furni_bag.furni"), i18n.t("furni_bag.decorate")];
    if (!this.mEnableEdit) {
      // const index = topCategorys.indexOf(op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE);
      // topCategorys.splice(index, 1);
      // topBtnTexts.splice(index, 1);
    }
    const topPosX = width * 0.5 - topCapW * 0.5 * (topCategorys.length - 1);
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
    if (this.mEnableEdit) {
      const index = topCategorys.indexOf(op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE);
      this.topCheckBox.selectIndex(index);
    } else {
      this.topCheckBox.selectIndex(0);
    }

    const inputWid: number = this.mInputBoo ? 260 * this.dpr * zoom : 0;
    let w = this.scene.cameras.main.width + 80 * this.dpr * zoom + inputWid;
    this.mCategoryScroll = new GameScroller(this.scene, this.mCategeoriesContainer, {
      x: this.mCategeoriesContainer.x,
      y: this.mCategeoriesContainer.y,
      clickX: w / 2 - 30 * this.dpr * zoom,
      clickY: this.mCategeoriesContainer.y + 41 * this.dpr * zoom / 2,
      width: this.mWorld.getSize().width,
      height: 41 * this.dpr * zoom,
      value: w / 2,
      orientation: 1,
      bounds: [
        -w / 2,
        w / 2
      ],
      valuechangeCallback: (newValue) => {
        this.refreshPos(newValue);
      },
      cellupCallBack: (gameobject) => {
        this.onSelectSubCategoryHandler(gameobject);
      }
    });

    const propFrame = this.scene.textures.getFrame(this.key, "prop_bg");
    const capW = (propFrame.width + 10 * this.dpr) * zoom;
    const capH = (propFrame.height + 10 * this.dpr) * zoom;
    w = this.scene.cameras.main.width + 35 * this.dpr * zoom + inputWid;
    const tableConfig: GridTableConfig = {
      x: 0,
      y: 0,
      table: {
        width: this.scene.cameras.main.width - 16 * this.dpr * zoom,
        height: 250 * this.dpr * zoom,
        columns: 4,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
      },
      scrollMode: 1,
      clamplChildOY: false,
      background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new Item(scene, 0, 0, this.key, this.dpr, zoom);
          this.add(cellContainer);
        }
        // cellContainer.setSize(width, height);
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        if (this.mSelectItem === null) this.mSelectItem = cellContainer;
        if (item && (this.mSelectedItemData === undefined || this.mSelectedItemData.id === item.id)) {
          this.onSelectItemHandler(cellContainer);
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
    // this.add(this.mPropGrid);
    this.add(this.mPropGrid.table);
    this.resize(0, 0);
    super.init();
  }

  private refreshPos(value: number) {
    if (!this.scene) {
      return;
    }
    const zoom: number = this.mWorld.uiScale;
    const inputWid: number = this.mInputBoo ? 260 * this.dpr * zoom : 0;
    const w = this.scene.cameras.main.width + 45 * this.dpr * zoom + inputWid;
    this.mCategeoriesContainer.x = value - w / 2;
  }

  private setSelectedItem(prop: op_client.ICountablePackageItem) {
    if (!prop) {
      return;
    }
    this.mSelectedItemData = prop;
    const url = Url.getOsdRes(prop.display.texturePath);
    this.mDetailDisplay.loadUrl(url);
    this.emit("queryPropResource", prop);
    this.mDetailBubble.setProp(prop);
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
    this.sellBtn.enable = prop.recyclable;
    this.useBtn.enable = prop.executable;
    this.mAdd.enable = (this.mSceneType === op_def.SceneTypeEnum.EDIT_SCENE_TYPE || this.mEnableEdit);
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
    // if (!(gameobject instanceof TextButton)) {
    //   return;
    // }
    const category: op_def.IStrPair = gameobject.getData("item");
    if (category) {
      if (this.mPreCategoryBtn && (this.mPreCategoryBtn instanceof TextButton)) {
        this.mPreCategoryBtn.changeNormal();
      }
      if (gameobject instanceof TextButton)
        gameobject.changeDown();
      let key = category.key;
      if (key === this.seachKey) {
        // gameobject.setSize(100 * this.dpr * this.mWorld.uiScale, gameobject.height);
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
        this.emit("queryPackage", category.key);
      }
      this.mPreCategoryBtn = gameobject;
    }
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onSelectItemHandler(cell: Item) {
    const item: op_client.ICountablePackageItem = cell.getData("item");
    if (item) {
      if (this.mSelectItem) this.mSelectItem.isSelect = false;
      this.mSelectItem = cell;
      this.mSelectItem.isSelect = true;
      this.setSelectedItem(item);
    }
  }

  private onSeachHandler(val: string) {
    if (this.mSelectedCategeories && val.length > 0) {
      this.emit("seachPackage", val, this.mSelectedCategeories.key);
    }
  }

  private onAddFurniToSceneHandler() {
    if (!this.mSelectedItemData) {
      return;
    }
    this.emit("addFurniToScene", this.mSelectedItemData.id);
  }

  private onTopCategoryHandler(item: Button) {
    const categoryType = item.getData("data");
    if (categoryType) {
      this.onSelectedCategory(categoryType);
      if (categoryType === op_def.EditModePackageCategory.EDIT_MODE_PACKAGE_CATEGORY_FURNITURE) {
        this.sellBtn.visible = true;
        this.useBtn.visible = false;
        this.mAdd.visible = true;
      } else {
        this.sellBtn.visible = true;
        this.useBtn.visible = true;
        this.mAdd.visible = false;
      }
    }
    this.layoutTopBtn(item);
  }

  private layoutTopBtn(button: Button) {
    const width = this.scene.cameras.main.width;
    const zoom = this.mWorld.uiScale;
    let allRadiu = 0;
    for (const btn of this.topBtns) {
      allRadiu += btn.width;
    }
    allRadiu /= 2;
    let offsetX: number = width * 0.5 - allRadiu;

    for (const btn of this.topBtns) {
      let posY = 0;
      if (btn !== button) {
        btn.setTextStyle({
          fontFamily: Font.DEFULT_FONT,
          fontSize: 12 * this.dpr * zoom,
          color: "#2B4BB5"
        });
        posY = btn.height * 0.5;
      } else {
        btn.setTextStyle({
          fontFamily: Font.DEFULT_FONT,
          fontSize: 16 * this.dpr * zoom,
          color: "#8B5603"
        });
        posY = btn.height * 0.5 + 2 * this.dpr * zoom;
      }
      const radiu = btn.width * 0.5;
      btn.x = offsetX + radiu;
      btn.y = posY;
      offsetX += radiu * 2 + 12 * this.dpr * zoom;
    }
  }

  private onSelectedCategory(categoryType: number) {
    this.categoryType = categoryType;
    this.emit("getCategories", categoryType);
  }

  private onSellBtnHandler() {
    this.popItemsPopPanle();
    if (this.mSelectedItemData)
      this.itemPopPanel.setProp(this.mSelectedItemData, 0, this.categoryType, new Handler(this, this.onSellPropsHandler));
  }

  private onUseBtnHandler() {
    this.popItemsPopPanle();
    if (this.mSelectedItemData)
      this.itemPopPanel.setProp(this.mSelectedItemData, 1, this.categoryType, new Handler(this, this.onUsePropsHandler));
  }

  private onSellPropsHandler(prop: op_client.CountablePackageItem, count: number, category: number) {

    this.emit("sellProps", prop, count, category);
  }

  private onUsePropsHandler(prop: op_client.CountablePackageItem, count: number, category: number) {

  }

  private popItemsPopPanle() {
    const zoom = this.mWorld.uiScale;
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    if (!this.itemPopPanel) {
      this.itemPopPanel = new ItemsPopPanel(this.scene, width * 0.5, height * 0.5, this.key, this.commonkey, this.dpr, zoom);
    }
    this.itemPopPanel.once("itempopclose", () => {
      this.mCategoryScroll.addListen();
    });
    this.mCategoryScroll.removeListen();
    this.add(this.itemPopPanel);
  }

  private showSeach(parent: TextButton) {
    // const cellTable = this.mCategoryScroll.childrenMap.child;
    // cellTable.setCellWidth(0, this.mSeachInput.x + this.mSeachInput.width / 2);
    // cellTable.updateTable(true);
    this.mCategeoriesContainer.addAt(this.mSeachInput, 1);
    this.mCategoryScroll.setInteractiveObject(this.mSeachInput.seachBtn);
    this.mCategoryScroll.setInteractiveObject(this.mSeachInput.label);
    this.updateCategeoriesLoc(true);
  }

  private closeSeach(parent: TextButton) {
    // const cellTable = this.mCategoryScroll.childrenMap.child;
    // cellTable.setCellWidth(0, 56 * this.dpr * this.mWorld.uiScale);
    // cellTable.updateTable(true);
    if (this.mSeachInput.parentContainer) {
      this.mSeachInput.parentContainer.remove(this.mSeachInput);
    }
    this.mCategoryScroll.removeInteractiveObject(this.mSeachInput.seachBtn);
    this.mCategoryScroll.removeInteractiveObject(this.mSeachInput.label);
    this.updateCategeoriesLoc(false);
  }

  private updateCategeoriesLoc(inputBoo: boolean) {
    const list = this.mCategeoriesContainer.list;
    const zoom = this.mWorld.uiScale;
    const h = 41 * this.dpr * zoom;
    let preBtn: Phaser.GameObjects.Container = null;
    const offset = 10 * this.dpr * zoom;
    const w = this.mWorld.getSize().width;
    let tmpW: number = offset;
    for (let i = 0; i < list.length; i++) {
      const item: Phaser.GameObjects.Container = <Phaser.GameObjects.Container>list[i];
      if (i > 0) {
        preBtn = <Phaser.GameObjects.Container>list[i - 1];
        item.x = preBtn.x + preBtn.width; // - item.width * item.originX;
      } else {
        item.x = tmpW;
      }
      tmpW += this.scrollItemWidth;
    }
    const inputWid: number = inputBoo ? 30 * this.dpr * zoom : 0;
    let pad0: number = 0;
    let pad1: number = 1;
    if (tmpW > w) {
      tmpW = tmpW;
      pad0 = 75 * this.dpr * zoom + inputWid;
      pad1 = -180 * this.dpr * zoom - inputWid;
    } else {
      tmpW = w;
      pad0 = 410 * this.dpr * zoom + inputWid;
      pad1 = 30 * this.dpr * zoom - inputWid;
    }
    const updateWid: number = tmpW;
    this.mCategoryScroll.resize(tmpW, h, -updateWid / 2 + pad0, updateWid / 2 + pad1);
    // this.mCategoryScroll.resize(updateWid, h);
  }

  get enableEdit() {
    return this.mEnableEdit;
  }
}

class SeachInput extends Phaser.GameObjects.Container {
  private mSeachBtn: Phaser.GameObjects.Image;
  private mLabelInput: Phaser.GameObjects.Text;
  private mInputText: InputPanel;
  private mWorldService: WorldService;
  private bg: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, world: WorldService, key: string, dpr: number) {
    super(scene);
    this.mWorldService = world;

    this.bg = scene.make.image({
      key,
      frame: "seach_bg"
    }, false).setOrigin(0, 0.5);

    // this.mLabelInput = new LabelInput(this.scene, {
    //   x: -10 * dpr,
    //   y: 0,
    //   width: 160,
    //   height: 60,
    //   fontSize: 14 * dpr + "px",
    //   color: "#666666",
    // });
    this.mLabelInput = this.scene.make.text({
      x: 10 * dpr,
      width: this.bg.width,
      height: this.bg.height,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr,
        wordWrap: { width: 200, useAdvancedWrap: true },
      }
    }, false).setData("type", "label").setOrigin(0, 0.5);
    this.mLabelInput.setSize(this.bg.width, this.bg.height);
    this.mLabelInput.setInteractive();
    this.mSeachBtn = scene.make.image({
      key,
      frame: "seach_normal"
    }, false).setData("type", "seachBtn");
    this.mSeachBtn.x = this.bg.width - this.mSeachBtn.width / 2 - 4 * dpr,
      this.add([this.bg, this.mLabelInput, this.mSeachBtn]);
    this.setSize(this.bg.width + 20 * dpr, this.bg.height);
  }

  public showInputPanel() {
    if (this.mInputText) {
      return;
    }
    this.mInputText = new InputPanel(this.scene, this.mWorldService, this.mLabelInput.text);
    this.mInputText.once("close", this.sendChat, this);
  }

  private sendChat(val: string) {
    this.mInputText.destroy();
    this.mInputText = null;
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
    return this.mLabelInput.text;
  }
}

class DetailBubble extends Phaser.GameObjects.Container {
  private mDetailBubble: Phaser.GameObjects.Graphics;
  private mNickName: Phaser.GameObjects.Text;
  private mPriceText: Phaser.GameObjects.Text;
  private mDesText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private dpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.dpr = dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    const bubbleW = 100 * dpr * zoom;
    const bubbleH = 96 * dpr * zoom;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, bubbleW, bubbleH);

    this.mNickName = this.scene.make.text({
      x: 7 * this.dpr,
      y: 9 * this.dpr,
      text: "背包里空空如也",
      style: {
        fontSize: 12 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        color: "#FFFF00",
        align: "center"
      }
    });

    this.mPriceText = this.scene.make.text({
      x: 7 * this.dpr,
      y: 28 * this.dpr,
      text: "不可交易",
      style: {
        fontSize: 10 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        color: "#DC143C",
        align: "center"
      }
    });
    this.mSource = this.scene.make.text({
      x: 8 * dpr,
      y: 47 * dpr,
      text: "可通过商城购物获得",
      style: {
        fontSize: 10 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);

    this.mDesText = this.scene.make.text({
      x: 8 * dpr,
      y: 66 * dpr,
      style: {
        color: "#32347b",
        fontSize: 10 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
        wordWrap: {
          width: 90 * dpr,
          useAdvancedWrap: true
        }
      }
    }, false);

    this.add([this.mDetailBubble, this.mNickName, this.mDesText, this.mSource, this.mPriceText]);
    this.setSize(bubbleW, bubbleH);
  }

  setProp(prop: op_client.ICountablePackageItem): this {
    this.mNickName.setText(prop.shortName || prop.name);
    let posY = 9 * this.dpr;
    const offsetY = 21 * this.dpr;
    // this.mDesText.setText(prop.des);
    if (prop.sellingPrice) {
      posY += offsetY;
      this.mPriceText.y = posY;
      this.mPriceText.setText(`可售卖：${prop.sellingPrice.price}`);
    } else {
      posY += offsetY;
      this.mPriceText.y = posY;
      this.mPriceText.setText(`不可交易`);
    }
    if (prop.source) {
      this.mSource.setText(`来源： ${prop.source}`);
      posY += offsetY;
      this.mSource.y = posY;
    } else {
      this.mSource.setText("");
    }
    if (prop.des) {
      posY += offsetY;
      this.mDesText.setText(prop.des);
      this.mDesText.y = posY;
    } else {
      this.mDesText.setText("");
    }
    this.resize();
    return this;
  }

  private resize(w?: number, h?: number) {
    if (w === undefined) w = this.width;
    const bubbleH = this.mDesText.height + 60 * this.dpr;
    if (w === this.width && bubbleH === this.height) {
      return;
    }
    this.mDetailBubble.clear();
    this.mDetailBubble.fillStyle(0xFFFFFF, 0.1);
    this.mDetailBubble.fillRoundedRect(0, 0, w, bubbleH);

    this.setSize(w, bubbleH);
    // this.mDetailBubbleContainer.y = this.height - this.y - this.mDetailBubbleContainer.height - 6 * this.dpr;
  }
}

class Item extends Phaser.GameObjects.Container {
  private mProp: op_client.ICountablePackageItem;
  private mCounter: Phaser.GameObjects.Text;
  private mPropImage: DynamicImage;
  private selectbg: Phaser.GameObjects.Image;
  private dpr: number;
  private zoom: number;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
    super(scene, x, y);
    this.dpr = dpr;
    this.zoom = zoom;
    const background = scene.make.image({
      key,
      frame: "grid_bg"
    }, false).setOrigin(0).setScale(zoom);

    this.selectbg = scene.make.image({
      key,
      frame: "grid_choose"
    }, false).setOrigin(0).setScale(zoom).setPosition(-2 * dpr * zoom, -2 * dpr * zoom);

    this.mPropImage = new DynamicImage(this.scene, 0, 0);
    this.mPropImage.scale = dpr * zoom;

    this.mCounter = scene.make.text({
      x: background.width - 4 * dpr,
      y: background.height + 2 * dpr,
      style: {
        fontSize: 12 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(1);
    this.add([background, this.selectbg]);
    this.isSelect = false;
    this.setSize(background.width, background.height);
    // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, background.width, background.height), Phaser.Geom.Rectangle.Contains);
    // this.on("pointerup", this.onSelectedHandler, this);
  }

  setProp(prop: op_client.ICountablePackageItem) {
    this.mProp = prop;
    this.isSelect = false;
    if (!prop) {
      // this.mPropImage.setFrame("");
      this.mCounter.setText("");
      this.remove(this.mPropImage);
      return;
    }
    this.mPropImage.load(Url.getOsdRes(prop.display.texturePath), this, this.onPropLoadCompleteHandler);
    this.add(this.mPropImage);
    if (prop.count > 1) {
      this.mCounter.setText(prop.count.toString());
      this.add(this.mCounter);
    } else {
      if (this.mCounter.parentContainer)
        this.remove(this.mCounter);
    }
  }

  private onPropLoadCompleteHandler() {
    if (this.mPropImage && this.mPropImage.texture) {
      const texture = this.mPropImage.texture;
      // this.mPropImage.setPosition((this.mPropImage.width) / 2, (this.mPropImage.height) / 2);
      this.mPropImage.x = this.width + 3 * this.dpr * this.zoom >> 1;
      this.mPropImage.y = this.height + 3 * this.dpr * this.zoom >> 1;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

  public set isSelect(value) {
    this.selectbg.visible = value;
  }

  private onSelectedHandler() {
    this.emit("select", this.mProp);
  }
}

class ItemsPopPanel extends Phaser.GameObjects.Container {
  public itemCount: number = 1;
  private itemName: Phaser.GameObjects.Text;
  private titleName: Phaser.GameObjects.Text;
  private icon: DynamicImage;
  private pricText: Phaser.GameObjects.Text;
  private priceBg: Phaser.GameObjects.Image;
  private itemCountText: Phaser.GameObjects.Text;
  private itemData: op_client.ICountablePackageItem;
  private popState: number = 0;  // 0 卖出 1 使用
  private blackBg: Phaser.GameObjects.Graphics;
  private handler: Handler;
  private category: number;

  constructor(scene: Phaser.Scene, x: number, y: number, key: string, commonKey: string, dpr: number, zoom: number = 1) {
    super(scene, x, y);
    const bg = new NinePatch(this.scene, 0, 0, 286 * dpr * zoom, 331 * dpr * zoom, commonKey, "bg", {
      top: 40,
      bottom: 40
    });
    this.blackBg = this.scene.make.graphics(undefined, false);
    this.blackBg.clear();
    this.blackBg.fillStyle(0, 0.5);
    const w = this.scene.cameras.main.width / this.scale;
    const h = this.scene.cameras.main.height / this.scale;
    this.blackBg.fillRect(-w / 2, -h / 2, w, h);
    bg.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    const posY = -bg.height * 0.5 + 3 * dpr * zoom;
    const titlebg = this.scene.make.image({ x: 0, y: posY, key, frame: "title" });
    this.titleName = scene.make.text({
      x: 0,
      y: posY + 3 * dpr * zoom,
      text: "售出",
      style: {
        color: "#905B06",
        fontSize: 15 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5);
    this.titleName.setFontStyle("bold");
    this.itemName = scene.make.text({
      x: 0,
      y: posY + 40 * dpr * zoom,
      style: {
        color: "#000000",
        fontSize: 15 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5);
    const iconOffset: number = -56 * dpr * zoom;
    const iconBg = this.scene.make.image({ x: 0, y: iconOffset, key, frame: "sell_bg" });
    this.icon = new DynamicImage(this.scene, 0, iconOffset);
    this.icon.scale = dpr * zoom;
    const priceOffset: number = 10 * dpr * zoom;
    this.priceBg = this.scene.make.image({ x: 0, y: priceOffset, key: commonKey, frame: "price_bg" });
    this.pricText = scene.make.text({
      x: 0,
      y: priceOffset,
      style: {
        color: "#FFFFFF",
        fontSize: 15 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5);
    // this.pricText.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.priceBg.width, this.priceBg.height),Phaser.Geom.Rectangle.Contains);
    const countOffsetY = 50 * dpr * zoom;
    const countOffsetX = -58 * dpr * zoom;
    const countBg = this.scene.make.image({ x: 0, y: countOffsetY, key: commonKey, frame: "input_bg" });
    this.itemCountText = scene.make.text({
      x: 0,
      y: countOffsetY,
      style: {
        color: "#0771AC",
        fontSize: 15 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(0.5);
    const minusBtn = new Button(this.scene, commonKey, "reduce", "reduce");
    const addBtn = new Button(this.scene, commonKey, "increase", "increase");
    minusBtn.x = countOffsetX; minusBtn.y = countOffsetY;
    addBtn.x = -countOffsetX; addBtn.y = countOffsetY;

    const bottomOffsetY = bg.height * 0.5 - 50 * dpr * zoom;
    const bottomOffsetX = -66 * dpr * zoom;
    const cancelBtn = new NinePatchButton(this.scene, bottomOffsetX, bottomOffsetY, 112 * dpr * zoom, 40 * dpr * zoom, commonKey, "red_btn", i18n.t("common.cancel"), {
      left: 12 * dpr * zoom,
      top: 12 * dpr * zoom,
      right: 12 * dpr * zoom,
      bottom: 12 * dpr * zoom
    });
    const confirmBtn = new NinePatchButton(this.scene, -bottomOffsetX, bottomOffsetY, 112 * dpr * zoom, 40 * dpr * zoom, commonKey, "yellow_btn", i18n.t("common.confirm"), {
      left: 12 * dpr * zoom,
      top: 12 * dpr * zoom,
      right: 12 * dpr * zoom,
      bottom: 12 * dpr * zoom
    });
    cancelBtn.setTextStyle({
      color: "#FFFFFF",
      fontSize: 16 * dpr * zoom,
      fontFamily: Font.DEFULT_FONT
    });
    confirmBtn.setTextStyle({
      color: "#976400",
      fontSize: 16 * dpr * zoom,
      fontFamily: Font.DEFULT_FONT
    });
    this.add([this.blackBg, bg, titlebg, this.titleName, this.itemName, iconBg, this.icon, this.priceBg, this.pricText, countBg, this.itemCountText, minusBtn, addBtn, cancelBtn, confirmBtn]);
    minusBtn.on("Tap", this.onMinusBtnHandler, this);
    addBtn.on("Tap", this.onAddBtnHandler, this);
    cancelBtn.on("click", this.onCancelBtnHandler, this);
    confirmBtn.on("click", this.onConfirmBtnHandler, this);
  }

  public setProp(prop: op_client.ICountablePackageItem, stated: number, category: number, handler: Handler) {
    this.itemData = prop;
    this.itemCount = 1;
    this.icon.load(Url.getOsdRes(prop.display.texturePath), this, this.onPropLoadCompleteHandler);
    this.itemName.text = prop.name || prop.shortName;
    this.pricText.text = prop.sellingPrice.price * this.itemCount + "  银币";
    this.itemCountText.text = this.itemCount + "";
    this.popState = stated;
    if (stated === 0) {
      this.titleName.text = i18n.t("furni_bag.sold");
      this.pricText.visible = true;
      this.priceBg.visible = true;
    } else {
      this.titleName.text = i18n.t("furni_bag.use");
      this.pricText.visible = false;
      this.priceBg.visible = false;
    }
    this.handler = handler;
    this.category = category;
  }

  private onMinusBtnHandler() {
    if (this.itemCount === 1) return;
    this.itemCount--;
    this.updateData();
  }

  private onAddBtnHandler() {
    if (this.itemCount === this.itemData.count) return;
    this.itemCount++;
    this.updateData();
  }

  private updateData() {
    this.itemCountText.text = this.itemCount + "";
    this.pricText.text = this.itemData.sellingPrice.price * this.itemCount + "  银币";
  }

  private onCancelBtnHandler() {
    this.emit("itempopclose");
    if (this.parentContainer) this.parentContainer.remove(this);
  }

  private onConfirmBtnHandler() {
    this.emit("itempopclose");
    if (this.parentContainer) this.parentContainer.remove(this);
    if (this.handler) this.handler.runWith([this.itemData, this.itemCount, this.category]);
  }
  private onPropLoadCompleteHandler() {
    if (this.icon && this.icon.texture) {
      const texture = this.icon.texture;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

}
