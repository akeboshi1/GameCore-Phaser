import { NineSliceButton, GameGridTable, GameScroller, TabButton, Button, BBCodeText, Text, NineSlicePatch, ClickEvent, NinePatchTabButton } from "apowophaserui";
import { BackgroundScaleButton, ButtonEventDispatcher, CheckboxGroup, CommonBackground, DynamicImage, DynamicImageValue, ImageValue, TextButton, ThreeSlicePath, UiManager } from "gamecoreRender";
import { DetailDisplay, ItemButton } from "picaRender";
import { UIAtlasName } from "picaRes";
import { AvatarSuitType, ConnectState, ModuleName } from "structure";
import { Coin, Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client, op_def } from "pixelpai_proto";
import { PicaBasePanel } from "../pica.base.panel";
import { GameObjects } from "tooqinggamephaser";
export class PicaFurnitureComposePanel extends PicaBasePanel {
  private mCloseBtn: Button;
  private titleTex: Phaser.GameObjects.Text;
  private mBackground: CommonBackground;
  private topBackground: Phaser.GameObjects.Image;
  private mCategoriesBar: Phaser.GameObjects.Graphics;
  private mCategoryCon: Phaser.GameObjects.Container;
  private mPreCategoryBtn: TextButton;
  private mSelectedCategeories: any;// op_def.IStrPair
  private mPropGrid: GameGridTable;
  private mPropGridBg: Phaser.GameObjects.Graphics;
  private mCategoryScroll: GameScroller;
  private composeBtn: NineSliceButton;
  private starCountCon: Phaser.GameObjects.Container;
  private starvalue: ImageValue;
  private furiAnimation: FuriComposeAnimation;
  private starCount: number;
  private mSelectedItemData: op_client.CountablePackageItem[];
  private subCategoryType: number = 1;
  constructor(uiManager: UiManager) {
    super(uiManager);
    this.atlasNames = [UIAtlasName.uicommon, UIAtlasName.effectcommon];
    this.key = ModuleName.PICAFURNITURECOMPOSE_NAME;
  }

  resize(w: number, h: number) {
    const width = this.scaleWidth;
    const height = this.scaleHeight;
    super.resize(width, height);
    this.mBackground.x = width * 0.5;
    this.mBackground.y = height * 0.5;
    this.topBackground.x = width * 0.5;
    this.topBackground.y = this.topBackground.height * 0.5;
    this.furiAnimation.x = width * 0.5;
    this.furiAnimation.y = this.furiAnimation.height * 0.5 + 40 * this.dpr;
    this.mCategoryCon.setSize(width, 79 * this.dpr);
    this.mCategoryCon.y = height - this.mPropGrid.height - this.mCategoryCon.height * 0.5 - 47 * this.dpr;
    this.mCategoryCon.x = width * 0.5;
    this.mCategoriesBar.y = 40 * this.dpr;
    this.mCategoriesBar.x = -width * 0.5;
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0xA56BFE);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x824CD4);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);

    this.composeBtn.x = width - this.composeBtn.width / 2 - 10 * this.dpr;
    this.composeBtn.y = this.mCategoryCon.y - this.composeBtn.height / 2;

    this.mPropGridBg.clear();
    this.mPropGridBg.fillStyle(0xCE7AF3);
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
    const subcategorys = [{ name: i18n.t("furnicompose.onestar"), value: 1 }, { name: i18n.t("furnicompose.twostar"), value: 2 },
    { name: i18n.t("furnicompose.threestar"), value: 3 }, { name: i18n.t("furnicompose.fourstar"), value: 4 }];
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

  queryRefreshPackage(update) {
    this.queryPackege(update);
  }

  public onComposeHandler(ids: string[]) {// op_client.CountablePackageItem
    this.mCategoryScroll.addListen();
    this.render.renderEmitter(this.key + "_queryfuricompose", ids);
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
    this.topBackground = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_bg_stripe" });
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.mCloseBtn = new Button(this.scene, UIAtlasName.uicommon, "back_arrow", "back_arrow");
    this.mCloseBtn.setPosition(21 * this.dpr, 35 * this.dpr);
    this.mCloseBtn.setInteractive(new Phaser.Geom.Rectangle(-28 * this.dpr, -20 * this.dpr, 56 * this.dpr, 40 * this.dpr), Phaser.Geom.Rectangle.Contains);
    this.titleTex = this.scene.make.text({ text: "", style: UIHelper.whiteStyle(this.dpr, 18) }).setOrigin(0, 0.5);
    this.titleTex.text = i18n.t("compose.title");
    this.titleTex.x = this.mCloseBtn.x + this.mCloseBtn.width * 0.5 + 10 * this.dpr;
    this.titleTex.y = this.mCloseBtn.y;
    this.furiAnimation = new FuriComposeAnimation(this.scene, this.dpr, this.scale);
    const starbg = new NineSlicePatch(this.scene, 0, -this.dpr, 190 * this.dpr, 28 * this.dpr, UIAtlasName.uicommon, "home_assets_bg", {
      left: 17 * this.dpr,
      top: 0 * this.dpr,
      right: 17 * this.dpr,
      bottom: 0 * this.dpr
    });
    starbg.x = -starbg.width * 0.5;
    this.starvalue = new ImageValue(this.scene, 60 * this.dpr, 26 * this.dpr, UIAtlasName.uicommon, "home_silver", this.dpr, {
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
    this.add([this.mBackground, this.topBackground, this.mPropGridBg, this.mCloseBtn, this.titleTex, this.furiAnimation, this.starCountCon, this.mCategoryCon, this.composeBtn]);

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
          cellContainer = new ItemButton(scene, UIAtlasName.effectcommon, "synthetic_icon_bg", this.dpr, this.scale, false);
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
      if (this.mPreCategoryBtn) this.mPreCategoryBtn.changeNormal();
      gameobject.changeDown();
      this.mSelectedCategeories = category;
      this.subCategoryType = category.value;
      this.queryPackege(false);
      this.mPreCategoryBtn = gameobject;
    }
    this.mPropGrid.setT(0);
  }

  private onCloseHandler() {
    this.render.renderEmitter(this.key + "_close");
  }

  private queryPackege(update) {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter(this.key + "_queryfuripackage", { type: this.subCategoryType, update });
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

class FuriComposeAnimation extends Phaser.GameObjects.Container {

  private dpr: number;
  private zoom: number;
  private bgring1: Phaser.GameObjects.Image;
  private bgring2: Phaser.GameObjects.Image;
  private bgring3: Phaser.GameObjects.Image;
  private bgring4: Phaser.GameObjects.Image;
  private bgring5: Phaser.GameObjects.Image;
  private bgring6: Phaser.GameObjects.Image;
  private bgringstar: Phaser.GameObjects.Image;
  private spendStarTex: BBCodeText;
  private starList: any[] = [];
  private itemList: any[] = [];
  private indexeds: number[] = [0, 0, 0, 0, 0];
  private canPlay: boolean = false;
  private starType: number;
  constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
    super(scene);
    this.dpr = dpr;
    this.zoom = zoom;
    this.init();
    this.setSize(this.bgring1.width, this.bgring1.height);
  }

  public setItemData(data: op_client.CountablePackageItem, starType: number) {
    this.starType = starType;
    for (let i = 0; i < this.indexeds.length; i++) {
      const value = this.indexeds[i];
      if (value === 0) {
        const item = this.itemList[i];
        item.setItemData(data);
        this.starList[i] = true;
        this.playAnimation();
      }
    }
    this.spendStarTex.text = starType + "";
  }

  public removeItemData(indexed: number) {
    this.indexeds[indexed] = 0;
    this.starList[indexed] = false;
    let canPlay = false;
    for (const value of this.indexeds) {
      if (value === 1) canPlay = true;
    }
    if (canPlay) {
      this.playAnimation();
    } else {
      this.stopAnimation();
    }
  }

  update() {
    if (this.canPlay) {
      this.bgring1.rotation += 0.01;
      this.bgring2.rotation += 0.09;
      this.bgring3.rotation += 0.08;
    }
  }

  protected init() {
    this.bgring1 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_1" });
    this.bgring2 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_2" });
    this.bgring3 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_3" });
    this.bgring4 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_4" });
    this.bgring5 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_5" });
    this.bgring6 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_6" });
    this.bgringstar = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_star_illume_5" });
    this.spendStarTex = new BBCodeText(this.scene, 0, this.bgring1.height * 0.5 + 15 * this.dpr, "", UIHelper.whiteStyle(this.dpr, 11)).setOrigin(0.5);
    this.add([this.bgring1, this.bgring2, this.bgring3, this.bgring4, this.bgring5, this.bgring6, this.spendStarTex]);
    this.createStarImg();
    this.createItem();
  }

  protected createStarImg() {
    const angle = Math.PI * 2 / 5;
    for (let i = 0; i < 5; i++) {
      const star = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_star_illume_1" });
      star.rotation -= angle * i;
      this.starList.push(star);
    }
    this.add(this.starList);
  }
  protected createItem() {
    const angle = -Math.PI / 2 - (Math.PI * 2 / 5);
    const radiu = 100 * this.dpr;
    for (let i = 0; i < 5; i++) {
      const item = new FuriComposeItem(this.scene, this.dpr, this.zoom);
      const tempangle = angle + (Math.PI * 2 / 5) * i;
      item.y = Math.sin(tempangle) * radiu;
      item.x = Math.cos(tempangle) * radiu;
      this.itemList.push(item);
      item.on(ClickEvent.Tap, this.onItemHandler, this);
    }
    this.add(this.itemList);
  }

  protected playAnimation() {
    this.canPlay = true;
  }

  protected stopAnimation() {
    this.canPlay = false;
    this.bgring1.rotation = 0;
    this.bgring2.rotation = 0;
    this.bgring3.rotation = 0;
  }

  private onItemHandler(pointer, gameobject) {
    const indexed = this.itemList.indexOf(gameobject);
    this.removeItemData(indexed);
  }
}
class FuriComposeItem extends ButtonEventDispatcher {
  public itemData: op_client.CountablePackageItem;
  private bg: Phaser.GameObjects.Image;
  private lightbg: Phaser.GameObjects.Image;
  private icon: DynamicImage;
  private zoom: number;
  constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
    super(scene, 0, 0);
    this.dpr = dpr;
    this.zoom = zoom;
    this.init();
  }
  public setItemData(data: op_client.CountablePackageItem) {
    this.itemData = data;
    if (!data) {
      this.bg.setFrame("synthetic_default");
      this.icon.visible = false;
    } else {
      this.bg.setFrame("synthetic_Light");
      const url = Url.getOsdRes(data.display.texturePath);
      this.icon.load(url);
      this.icon.visible = true;
      this.lightbg.alpha = 0;
      this.icon.alpha = 0;
      this.playAlphaAni([this.icon, this.lightbg]);
    }
  }
  protected init() {
    this.bg = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_default" });
    this.lightbg = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_Light" });
    this.icon = new DynamicImage(this.scene, 0, 0);
    this.icon.scale = this.dpr / this.zoom;
    this.add([this.bg, this.lightbg, this.icon]);
    this.lightbg.alpha = 0;
    this.icon.alpha = 0;
  }

  private playAlphaAni(target) {
    if (!this.scene) return;
    const tween = this.scene.tweens.add({
      targets: target,
      alpha: {
        from: 0,
        to: 1
      },
      ease: "Linear",
      duration: 300,
      onComplete: () => {
        tween.stop();
        tween.remove();
      },
    });
  }
}
