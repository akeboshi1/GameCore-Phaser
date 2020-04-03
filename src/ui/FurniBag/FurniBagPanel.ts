import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { NinePatchButton } from "../components/ninepatch.button";
import { i18n } from "../../i18n";
import { DetailDisplay } from "../Market/DetailDisplay";
import { Font } from "../../utils/font";
import { op_client, op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { TextButton } from "../Market/TextButton";
import { Url } from "../../utils/resUtil";
import GridTable from "../../../lib/rexui/lib/ui/gridtable/GridTable";
import { Logger } from "../../utils/log";
import { GameScroller } from "../../../lib/rexui/lib/ui/scroller/Scroller";
import { InputPanel } from "../components/input.panel";
import { Size } from "../../utils/size";

export class FurniBagPanel extends Panel {
  private key: string = "furni_bag";
  private seachKey: string = "key.seach";
  private mTiltle: Phaser.GameObjects.Text;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mBackground: Phaser.GameObjects.Graphics;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mShelfContainer: Phaser.GameObjects.Container;
  private mCategeoriesContainer: Phaser.GameObjects.Container;
  private mPropsContainer: Phaser.GameObjects.Container;
  private mDetailDisplay: DetailDisplay;
  private mAdd: NinePatchButton;
  private mBg: Phaser.GameObjects.Image;
  private mSeachInput: SeachInput;
  private mSelectedFurni: op_client.ICountablePackageItem;
  // private mCategoryScroll: GridTable;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: op_def.IStrMap;
  private mPropGrid: GridTable;
  private mCategoryScroll: GameScroller;

  private mDetailBubble: DetailBubble;
  private mSceneType: op_def.SceneTypeEnum;
  private mEnableEdit: boolean = false;
  private mInputBoo: boolean = false;
  constructor(scene: Phaser.Scene, world: WorldService, sceneType: op_def.SceneTypeEnum) {
    super(scene, world);
    this.mSceneType = sceneType;
    this.setTween(false);
    this.scale = 1;
  }

  resize(w: number, h: number) {
    const width = this.scene.cameras.main.width / this.scale;
    const height = this.scene.cameras.main.height / this.scale;
    super.resize(width, height);
    const zoom = this.mWorld.uiScaleNew;
    this.mBackground.clear();
    this.mBackground.fillGradientStyle(0x6f75ff, 0x6f75ff, 0x04cbff, 0x04cbff);
    this.mBackground.fillRect(0, 0, width * zoom, height * zoom);

    this.mShelfContainer.setSize(width, 277 * this.dpr * zoom);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr * zoom - this.mDetailBubble.height;
    // this.mCategoriesBar.y = this.mShelfContainer.y;

    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0x33ccff);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr * zoom);
    this.mCategoriesBar.fillStyle(0x00cccc);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr * zoom, width, 3 * this.dpr * zoom);
    this.mCategeoriesContainer.setSize(width, 43 * this.dpr * zoom);
    this.mSeachInput.y = this.mCategoriesBar.y + 20 * this.dpr * zoom;

    this.mPropsContainer.y = 7 * this.dpr * zoom + this.mCategeoriesContainer.height;

    this.mBg.x = width / 2;
    this.mBg.y = this.mBg.displayHeight / 2 + 48 * this.dpr * zoom;

    this.mTiltle.x = width / 2;

    this.mAdd.x = width - this.mAdd.width / 2 - 20 * this.dpr;
    this.mAdd.y = this.mShelfContainer.y - this.mAdd.height / 2 - 9 * this.dpr * zoom;

    this.mDetailDisplay.x = width / 2;
    this.mDetailDisplay.y = this.mBg.y;

    this.setSize(width, height);
  }

  setCategories(subcategorys: op_def.IStrMap[]) {
    subcategorys.unshift({ key: this.seachKey, value: "搜索" });
    this.mPreCategoryBtn = null;
    this.mSelectedCategeories = null;
    const zoom = this.mWorld.uiScaleNew;
    const capW = 56 * this.dpr * zoom;
    const capH = 41 * this.dpr * zoom;
    const items = [];
    this.mCategoryScroll.clearInteractiveObject();
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new TextButton(this.scene, this.dpr, zoom, subcategorys[i].value, i * capW, 0);
      item.y = capH - item.text.height >> 1;
      item.setData("item", subcategorys[i]);
      this.mCategeoriesContainer.add(item);
      item.setSize(capW, capH);
      this.mCategoryScroll.setInteractiveObject(item);
      items[i] = item;
    }
    if (items.length > 1) this.onSelectSubCategoryHandler(items[1]);
    // this.mCategoryScroll.setInteractiveObject(items);
    // this.mCategoryScroll = new GridTable(this.scene, {
    //   x: this.width / 2,
    //   y: this.mShelfContainer.y + (41 * this.dpr * zoom + capH) / 2,
    //   // y: 0,
    //   table: {
    //     width: this.width - 18 * this.dpr * zoom,
    //     height: capH,
    //     cellWidth: capW,
    //     cellHeight: capH,
    //     reuseCellContainer: true
    //   },
    //   scrollMode: 1,
    //   createCellContainerCallback: (cell, cellContainer) => {
    //     const  scene = cell.scene,
    //           item = cell.item;
    //     if (cellContainer === null) {
    //       cellContainer = new TextButton(scene, this.dpr, zoom);
    //       this.mCategeoriesContainer.add(cellContainer);
    //     }
    //     cellContainer.setText(item.value);
    //     cellContainer.setSize(capW, capH);
    //     cellContainer.setData({ item });
    //     if (!this.mPreCategoryBtn && item.key !== this.seachKey) {
    //       this.onSelectSubCategoryHandler(cellContainer);
    //     }
    //     return cellContainer;
    //   },
    //   items: subcategorys
    // })
    // .layout();
    // this.mCategoryScroll.on("cell.1tap", (cell, index) => {
    //   this.onSelectSubCategoryHandler(cell);
    // });

    this.mSeachInput.x = capW + this.mSeachInput.width / 2;
    this.mPropGrid.y = this.mShelfContainer.y + 43 * this.dpr * zoom + 120 * this.dpr * zoom;
    this.mPropGrid.layout();
    // this.add(this.mCategoryScroll.childrenMap.child);
  }

  public setProp(props: op_client.ICountablePackageItem[]) {
    this.mSelectedFurni = null;
    if (!props) {
      return;
    }
    const len = props.length;
    if (len < 24) {
      props = props.concat(new Array(24 - len));
    }

    this.mPropGrid.setItems(props);

    this.setSelectedItem(props[0]);
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

  destroy() {
    if (this.mCategoryScroll) {
      this.mCategoryScroll.destroy();
    }
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    super.destroy();
  }

  protected preload() {
    this.addAtlas(this.key, "furni_bag/furni_bag.png", "furni_bag/furni_bag.json");
    super.preload();
  }

  protected init() {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    this.mBackground = this.scene.make.graphics(undefined, false);
    const zoom = this.mWorld.uiScaleNew;

    this.mBg = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }, false).setScale(zoom);

    this.mShelfContainer = this.scene.make.container(undefined, false);
    this.mShelfContainer.setSize(width, 277 * this.dpr * zoom);
    this.mShelfContainer.y = height - this.mShelfContainer.height;
    this.mPropsContainer = this.scene.make.container(undefined, false);
    this.mCategeoriesContainer = this.scene.make.container(undefined, false);
    this.mCategeoriesContainer.y = this.mShelfContainer.y;

    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height), Phaser.Geom.Rectangle.Contains);

    this.mCloseBtn = this.scene.make.image({
      key: this.key,
      frame: "back_arrow.png",
      x: 21 * this.dpr,
      y: 30 * this.dpr
    }).setScale(zoom).setInteractive();

    this.mTiltle = this.scene.make.text({
      text: i18n.t("furni_bag.furni"),
      y: 30 * this.dpr * zoom,
      style: {
        fontSize: 36 * this.dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }).setOrigin(0.5);

    const frame = this.scene.textures.getFrame(this.key, "yellow_btn_normal");
    this.mAdd = new NinePatchButton(this.scene, 0, 0, 80 * this.dpr * zoom, 40 * this.dpr * zoom, this.key, "yellow_btn", i18n.t("furni_bag.add"), {
      left: 14 * this.dpr,
      top: 14 * this.dpr,
      right: frame.width - 2 - 14 * this.dpr,
      bottom: frame.height - 2 - 14 * this.dpr
    });
    this.mAdd.setTextStyle({
      color: "#976400",
      fontSize: 16 * this.dpr * zoom,
      fontFamily: Font.DEFULT_FONT
    });
    this.mAdd.setFontStyle("bold");
    // this.mAdd.on("pointerup", this.onBuyHandler, this);

    this.mDetailDisplay = new DetailDisplay(this.scene);
    this.mDetailDisplay.setTexture(this.key, "ghost.png");
    this.mDetailDisplay.setNearest();
    this.mDetailDisplay.y = this.mBg.y + this.mBg.height / 2;

    this.mDetailBubble = new DetailBubble(this.scene, this.key, this.dpr, zoom);
    this.mDetailBubble.x = 10 * this.dpr;
    this.mDetailDisplay.scale = this.mWorld.scaleRatio * zoom;

    this.mSeachInput = new SeachInput(this.scene, this.mWorld, this.key, this.dpr);
    // this.mSeachInput.x = this.mSeachInput.width / 2 + 6 * this.dpr;

    this.add([this.mBackground, this.mBg, this.mTiltle, this.mCloseBtn, this.mDetailDisplay, this.mDetailBubble, this.mShelfContainer, this.mCategeoriesContainer]);
    this.mShelfContainer.add([this.mCategoriesBar, this.mPropsContainer]);
    // this.mCategeoriesContainer.add([this.mCategoriesBar]);
    if (this.mWorld && this.mWorld.roomManager && this.mWorld.roomManager.currentRoom) {
      this.mEnableEdit = this.mWorld.roomManager.currentRoom.enableEdit;
    }
    if (this.mSceneType === op_def.SceneTypeEnum.EDIT_SCENE_TYPE || this.mEnableEdit) {
      this.add(this.mAdd);
    }

    const inputWid: number = this.mInputBoo ? 260 * this.dpr * zoom : 0;
    const w = this.scene.cameras.main.width + 45 * this.dpr * zoom + inputWid;
    this.mCategoryScroll = new GameScroller(this.scene, this.mCategeoriesContainer, {
      x: 0,
      y: this.mCategeoriesContainer.y,
      width: w,
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

    const propFrame = this.scene.textures.getFrame(this.key, "prop_bg.png");
    const capW = (propFrame.width + 10 * this.dpr) * zoom;
    const capH = (propFrame.height + 10 * this.dpr) * zoom;
    this.mPropGrid = new GridTable(this.scene, {
      x: w / 2,
      y: 1050 + (41 * this.dpr * zoom) / 2,
      table: {
        width: w - 20 * this.dpr * zoom,
        height: 224 * this.dpr * zoom,
        columns: 4,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
      },
      scrollMode: 1,
      clamplChildOY: true,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new Item(scene, 0, 0, this.key, this.dpr, zoom);
          // cellContainer.width = capW;
          // cellContainer.height = capH;
          this.add(cellContainer);
        }
        // cellContainer.setSize(width, height);
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        // if (!this.mPreCategoryBtn) {
        //   this.onSelectSubCategoryHandler(cellContainer);
        // }
        return cellContainer;
      },
    });
    this.mPropGrid.on("cell.1tap", (cell) => {
      const item = cell.getData("item");
      if (item) {
        this.onSelectItemHandler(item);
      }
    });
    // this.add(this.mPropGrid);
    this.add(this.mPropGrid.childrenMap.child);
    super.init();

    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mSeachInput.on("seach", this.onSeachHandler, this);
    this.mAdd.on("pointerup", this.onAddFurniToSceneHandler, this);
    this.emit("getCategories");

    this.resize(0, 0);
  }

  private refreshPos(value: number) {
    if (!this.scene) {
      return;
    }
    const zoom: number = this.mWorld.uiScaleNew;
    const inputWid: number = this.mInputBoo ? 260 * this.dpr * zoom : 0;
    const w = this.scene.cameras.main.width + 45 * this.dpr * zoom + inputWid;
    this.mCategeoriesContainer.x = value - w / 2;
  }

  private setSelectedItem(prop: op_client.ICountablePackageItem) {
    if (!prop) {
      return;
    }
    this.mSelectedFurni = prop;
    this.emit("queryPropResource", prop);
    this.mDetailBubble.setProp(prop);
    this.mDetailBubble.y = this.mShelfContainer.y - 10 * this.dpr - this.mDetailBubble.height;
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
    if (!(gameobject instanceof TextButton)) {
      return;
    }
    const category: op_def.IStrMap = gameobject.getData("item");
    if (category) {
      if (this.mPreCategoryBtn) {
        this.mPreCategoryBtn.changeNormal();
      }
      gameobject.changeDown();
      let key = category.key;
      if (key === this.seachKey) {
        // gameobject.setSize(100 * this.dpr * this.mWorld.uiScaleNew, gameobject.height);
        this.showSeach(gameobject);
      } else {
        if (this.mPreCategoryBtn) {
          const preBtn = this.mPreCategoryBtn.getData("item");
          key = preBtn.key;
          if (key === this.seachKey) {
            this.closeSeach(gameobject);
          }
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

  private onSelectItemHandler(prop: op_client.ICountablePackageItem) {
    this.setSelectedItem(prop);
  }

  private onSeachHandler(val: string) {
    if (this.mSelectedCategeories && val.length > 0) {
      this.emit("seachPackage", val, this.mSelectedCategeories.key);
    }
  }

  private onAddFurniToSceneHandler() {
    if (!this.mSelectedFurni) {
      return;
    }
    this.emit("addFurniToScene", this.mSelectedFurni.id);
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
    // cellTable.setCellWidth(0, 56 * this.dpr * this.mWorld.uiScaleNew);
    // cellTable.updateTable(true);
    this.mCategeoriesContainer.remove(this.mSeachInput);
    this.mCategoryScroll.removeInteractiveObject(this.mSeachInput.seachBtn);
    this.mCategoryScroll.removeInteractiveObject(this.mSeachInput.label);
    this.updateCategeoriesLoc(false);
  }

  private updateCategeoriesLoc(inputBoo: boolean) {
    const list = this.mCategeoriesContainer.list;
    const zoom = this.mWorld.uiScaleNew;
    const w = this.scene.cameras.main.width + 45 * this.dpr * zoom;
    const h = 41 * this.dpr * zoom;
    let preBtn: Phaser.GameObjects.Container = null;
    for (let i = 0; i < list.length; i++) {
      const item: Phaser.GameObjects.Container = <Phaser.GameObjects.Container>list[i];
      if (i > 0) {
        preBtn = <Phaser.GameObjects.Container>list[i - 1];
        item.x = preBtn.x + preBtn.width; // - item.width * item.originX;
      } else {
        item.x = 0;
      }
    }
    const inputWid: number = inputBoo ? 200 * this.dpr * zoom : 0;
    const updateWid: number = w + inputWid;
    this.mCategoryScroll.setSize(updateWid, h, -w / 2 - inputWid, w / 2);
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
  constructor(scene: Phaser.Scene, world: WorldService, key: string, dpr: number) {
    super(scene);
    this.mWorldService = world;

    const bg = scene.make.image({
      key,
      frame: "seach_bg.png"
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
      width: bg.displayWidth,
      height: bg.displayHeight,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr
      }
    }, false).setData("type", "label").setOrigin(0, 0.5);

    this.mSeachBtn = scene.make.image({
      key,
      frame: "seach_normal.png"
    }, false).setData("type", "seachBtn");
    this.mSeachBtn.x = bg.displayWidth - this.mSeachBtn.width / 2 - 4 * dpr,
      this.add([bg, this.mLabelInput, this.mSeachBtn]);
    this.setSize(bg.displayWidth + 20 * dpr, bg.displayHeight);

    // this.mSeachBtn.on("pointerup", this.onSeachHandler, this);
  }

  // private onSeachHandler() {
  //   if (!this.mLabelInput.text) {
  //     return;
  //   }
  //   this.emit("seach", this.mLabelInput.text);
  // }

  public showInputPanel() {
    if (this.mInputText) {
      return;
    }
    this.mInputText = new InputPanel(this.scene, this.mWorldService, this.mLabelInput.text);
    this.mInputText.once("close", this.sendChat, this);
  }

  private sendChat(val: string) {
    this.mLabelInput.setText(val);
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
  private mDesText: Phaser.GameObjects.Text;
  private mSource: Phaser.GameObjects.Text;
  private dpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.dpr = dpr;
    this.mDetailBubble = this.scene.make.graphics(undefined, false);
    const bubbleW = 110 * dpr * zoom;
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

    this.mDesText = this.scene.make.text({
      x: 8 * dpr,
      y: 56 * dpr,
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

    this.mSource = this.scene.make.text({
      x: 8 * dpr,
      y: 38 * dpr,
      text: "可通过商城购物获得",
      style: {
        fontSize: 10 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT,
      }
    }, false);
    this.add([this.mDetailBubble, this.mNickName, this.mDesText, this.mSource]);
    this.setSize(bubbleW, bubbleH);
  }

  setProp(prop: op_client.ICountablePackageItem): this {
    this.mNickName.setText(prop.shortName || prop.name);
    this.mDesText.setText(prop.des);
    if (prop.source) {
      this.mSource.setText(`来源： ${prop.source}`);
    } else {
      this.mSource.setText("");
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
  private mCounter: Phaser.GameObjects.Text;
  private mPropImage: DynamicImage;
  private mProp: op_client.ICountablePackageItem;
  constructor(scene: Phaser.Scene, x: number, y: number, key: string, dpr: number, zoom: number = 1) {
    super(scene, x, y);

    const background = scene.make.image({
      key,
      frame: "prop_bg.png"
    }, false).setOrigin(0).setScale(zoom);

    this.mPropImage = new DynamicImage(this.scene, 0, 0);
    this.mPropImage.scale = dpr * zoom;

    this.mCounter = scene.make.text({
      x: background.width - 4 * dpr,
      y: background.height - 4 * dpr,
      style: {
        fontSize: 12 * dpr * zoom,
        fontFamily: Font.DEFULT_FONT
      }
    }, false).setOrigin(1);
    this.add([background]);

    this.setSize(background.displayWidth, background.displayHeight);
    // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, background.displayWidth, background.displayHeight), Phaser.Geom.Rectangle.Contains);
    // this.on("pointerup", this.onSelectedHandler, this);
  }

  setProp(prop: op_client.ICountablePackageItem) {
    this.mProp = prop;
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
    }
  }

  private onPropLoadCompleteHandler() {
    if (this.mPropImage && this.mPropImage.texture) {
      const texture = this.mPropImage.texture;
      // this.mPropImage.setPosition((this.mPropImage.displayWidth) / 2, (this.mPropImage.displayHeight) / 2);
      this.mPropImage.x = this.width / 2;
      this.mPropImage.y = this.height / 2;
      if (texture) {
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

  private onSelectedHandler() {
    this.emit("select", this.mProp);
  }
}