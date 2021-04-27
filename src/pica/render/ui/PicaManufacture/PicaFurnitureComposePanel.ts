import { NineSliceButton, GameGridTable, GameScroller, BBCodeText, ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher, DynamicImage, Render, TextButton } from "gamecoreRender";
import { ItemButton } from "../../ui";
import { UIAtlasName } from "../../../res";
import { ModuleName } from "structure";
import { Font, Handler, i18n, UIHelper, Url } from "utils";
import { op_client } from "pixelpai_proto";
import { ICountablePackageItem } from "../../../structure";
import { CommonBackground } from "../../ui";
export class PicaFurnitureComposePanel extends Phaser.GameObjects.Container {
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

  private furiAnimation: FuriComposeAnimation;
  private starCount: number;
  private mSelectedItemData: op_client.CountablePackageItem[] = [];
  private subCategoryType: number = 1;
  private dpr: number;
  private zoom: number;
  private key: string;
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
    this.mBackground.x = width * 0.5;
    this.mBackground.y = height * 0.5;
    this.topBackground.x = width * 0.5;
    this.topBackground.y = this.topBackground.height * 0.5;
    const categoryConHeight = 79 * this.dpr;
    const topHeight = height - this.mPropGrid.height - categoryConHeight * 0.5 - 47 * this.dpr;
    this.furiAnimation.x = width * 0.5;
    this.furiAnimation.y = topHeight * 0.5 + 7 * this.dpr;
    this.mCategoryCon.setSize(width, 79 * this.dpr);
    this.mCategoryCon.y = topHeight;
    this.mCategoryCon.x = width * 0.5;
    this.mCategoriesBar.y = 40 * this.dpr;
    this.mCategoriesBar.x = -width * 0.5;
    this.mCategoriesBar.clear();
    this.mCategoriesBar.fillStyle(0xA56BFE);
    this.mCategoriesBar.fillRect(0, 0, width, 40 * this.dpr);
    this.mCategoriesBar.fillStyle(0x824CD4);
    this.mCategoriesBar.fillRect(0, 40 * this.dpr, width, 3 * this.dpr);
    this.composeBtn.x = width - this.composeBtn.width / 2 - 20 * this.dpr;
    this.composeBtn.y = this.mCategoryCon.y - this.composeBtn.height / 2 + 35 * this.dpr;

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
      item.setChangeColor("#FFE63C");
      items[i] = item;
      item.setFontSize(16 * this.dpr);
      item.setFontStyle("bold");
    }
    this.mCategoryScroll.setAlign(1);
    this.mCategoryScroll.Sort();
    this.mCategoryScroll.refreshMask();
    if (items.length > 1) this.onSelectSubCategoryHandler(items[0]);
  }

  public setGridProp(props: any[]) {// op_client.ICountablePackageItem
    this.setProps(props);
    this.mPropGrid.setT(0);
    this.updateSelectItemDatas(props);
  }

  public updateGridProp(props: any[]) {
    this.setProps(props);
    this.updateSelectItemDatas(props);
  }

  public setProps(props: any[]) {
    props = !props ? [] : props;
    const len = props.length;
    if (len < 24) {
      props = props.concat(new Array(24 - len));
    }
    this.mPropGrid.setItems(props);
  }

  public setStarData(value: number) {
    this.starCount = value;
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

  protected init() {
    const width = this.width;
    const height = this.height;
    this.mBackground = new CommonBackground(this.scene, 0, 0, width, height, UIAtlasName.effectcommon, "synthetic_bg", 0xc97af3);
    this.topBackground = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_bg_stripe" });
    this.mCategoryCon = this.scene.make.container(undefined, false);
    this.mCategoryCon.setSize(width, 295 * this.dpr);
    this.mCategoryCon.y = height - this.mCategoryCon.height;
    this.mCategoriesBar = this.scene.make.graphics(undefined, false);
    this.mBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
    this.furiAnimation = new FuriComposeAnimation(this.scene, this.dpr, this.scale);
    this.furiAnimation.setHandler(new Handler(this, this.onFuriComposeAnimationHandler));

    const btnwidth = 100 * this.dpr, btnHeight = 40 * this.dpr;
    const btnPosX = width - btnwidth / 2 - 20 * this.dpr, btnPosY = this.mCategoryCon.y - 25 * this.dpr;
    this.composeBtn = this.createNineButton(btnPosX + 100 * this.dpr, btnPosY, btnwidth, btnHeight, UIAtlasName.uicommon, "yellow_btn", i18n.t("compose.title"), "#996600");
    this.composeBtn.on(ClickEvent.Tap, this.onComposeBtnHandler, this);
    this.mCategoryScroll = new GameScroller(this.scene, {
      x: 0,
      y: 60 * this.dpr,
      width,
      height: 41 * this.dpr,
      zoom: this.zoom,
      orientation: 1,
      dpr: this.dpr,
      space: 28 * this.dpr,
      selfevent: true,
      cellupCallBack: (gameobject) => {
        this.onSelectSubCategoryHandler(gameobject);
      }
    });
    this.mPropGridBg = this.scene.make.graphics(undefined, false);
    this.mCategoryCon.add([this.mCategoriesBar, this.mCategoryScroll]);
    this.add([this.mBackground, this.topBackground, this.mPropGridBg, this.furiAnimation, this.mCategoryCon, this.composeBtn]);

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
        cellContainer.setItemData(item, true);
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
    this.resize(this.width, this.height);
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
    this.furiAnimation.clearItemDatas(true);
    this.furiAnimation.setStarType(this.subCategoryType);
  }

  private queryPackege(update) {
    if (this.mSelectedCategeories) {
      this.render.renderEmitter(this.key + "_queryfuripackage", { type: this.subCategoryType, update });
    }
  }

  private onSelectItemHandler(cell: ItemButton) {
    const item: any = cell.getData("item");// op_client.ICountablePackageItem
    if (!item) return;
    this.checkSelectItemDatas(item, true);
  }

  private onComposeBtnHandler() {
    if (this.mSelectedItemData && this.mSelectedItemData.length === 5) {
      if (this.starCount < this.subCategoryType) {
        const data = {
          text: [{ text: i18n.t("furnicompose.starpicatips"), node: undefined }]
        };
        this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
        return;
      }

      const ids = [];
      for (const data of this.mSelectedItemData) {
        ids.push(data.id);
      }
      this.render.renderEmitter(this.key + "_queryfuricompose", ids);
      this.furiAnimation.playComposeAnimation();
      this.mSelectedItemData.length = 0;
    } else {
      const data = {
        text: [{ text: i18n.t("furnicompose.selecttips"), node: undefined }]
      };
      this.render.mainPeer.showMediator(ModuleName.PICANOTICE_NAME, true, data);
    }
  }

  private checkSelectItemDatas(data: op_client.CountablePackageItem, add: boolean) {
    if (add && this.mSelectedItemData.length === 5) return;
    let havedCount = 0;
    let indexed = -1;
    for (let i = 0; i < this.mSelectedItemData.length; i++) {
      const item = this.mSelectedItemData[i];
      if (item.indexId === data.indexId) {
        havedCount++;
        indexed = i;
      }
    }
    if (add) {
      // if (havedCount < data.count) {
      if (data.count > 0) {
        this.mSelectedItemData.push(data);
        this.furiAnimation.setItemData(data, this.subCategoryType);
        data.count--;
      }
    } else {
      if (indexed !== -1) {
        const tempdata = this.mSelectedItemData.splice(indexed, 1)[0];
        tempdata.count++;
      }

    }

    this.mPropGrid.refresh();

  }

  private onFuriComposeAnimationHandler(tag: string, data: any) {
    if (tag === "remove") {
      this.checkSelectItemDatas(data, false);
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
  private bglightstar: Phaser.GameObjects.Image;
  private bgstarLev: Phaser.GameObjects.Image;
  private spendStarTex: BBCodeText;
  private starImgList: any[] = [];
  private itemList: any[] = [];
  private indexeds: number[] = [0, 0, 0, 0, 0];
  private tweens: any[] = [];
  private canPlay: boolean = false;
  private starType: number;
  private timerID: any;
  private send: Handler;
  constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
    super(scene);
    this.dpr = dpr;
    this.zoom = zoom;
    this.init();
    this.setSize(this.bgring1.width, this.bgring1.height);
  }

  public setHandler(send: Handler) {
    this.send = send;
  }

  public setStarType(starType: number) {
    this.starType = starType;
    this.bgstarLev.setFrame("synthetic_center_star" + (starType + 1));
    this.spendStarTex.text = i18n.t("furnicompose.spendstar", { name: starType });
    this.bgstarLev.visible = true;
  }
  public setItemData(data: op_client.CountablePackageItem, starType: number) {
    this.starType = starType;
    let indexed: number = -1;
    let haveSameCount: number = 0;
    for (let i = 0; i < this.indexeds.length; i++) {
      const value = this.indexeds[i];
      if (value === 0) {
        if (indexed === -1) indexed = i;
      } else {
        const item = this.itemList[i];
        if (item.itemData.indexId === data.indexId) {
          haveSameCount++;
        }
      }
    }
    if (indexed !== -1 && data.count > 0) {
      this.indexeds[indexed] = 1;
      const item = this.itemList[indexed];
      item.setItemData(data);
      this.starImgList[indexed].visible = true;
      this.playAnimation();
      // this.spendStarTex.text = i18n.t("furnicompose.spendstar", { name: starType });
    }
    this.displayStarImg();
  }

  public removeItemData(indexed: number) {
    this.indexeds[indexed] = 0;
    const item = this.itemList[indexed];
    if (item.itemData) {
      if (this.send) this.send.runWith(["remove", item.itemData]);
      item.setItemData(undefined);
    }
    this.displayStarImg();
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

  public clearItemDatas(send: boolean) {
    for (let i = 0; i < this.indexeds.length; i++) {
      this.indexeds[i] = 0;
      const item = this.itemList[i];
      if (item.itemData) {
        if (send && this.send) this.send.runWith(["remove", item.itemData]);
        item.setItemData(undefined);
      }
    }
    this.stopTweens();
    this.displayStarImg();
    this.stopAnimation();
    this.layoutItemsPosition();
  }

  public playComposeAnimation() {
    const duration = 200;
    for (const item of this.itemList) {
      this.playMove(item, 0, 0, duration);
    }
  }

  update() {
    if (this.canPlay) {
      this.bgring1.rotation += 0.04;
      this.bgring2.rotation -= 0.015;
      this.bgring3.rotation += 0.02;
    }
  }
  destroy() {
    super.destroy();
    this.stopAnimation();
    this.stopTweens();
  }
  protected init() {
    this.bgring1 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_1" });
    this.bgring2 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_2" });
    this.bgring3 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_3" });
    this.bgring4 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_4" });
    this.bgring5 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_5" });
    this.bgring6 = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_ring_6" });
    this.bgringstar = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_star_default" });
    this.bgstarLev = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_center_star2" });
    this.bglightstar = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_star_illume_5" });
    this.bglightstar.y = 3 * this.dpr;
    this.spendStarTex = new BBCodeText(this.scene, 0, this.bgring1.height * 0.5 + 15 * this.dpr, "", UIHelper.whiteStyle(this.dpr, 11)).setOrigin(0.5);
    this.add([this.bgring1, this.bgring2, this.bgring3, this.bgring4, this.bgring5, this.bgring6, this.bgringstar, this.bgstarLev, this.bglightstar, this.spendStarTex]);
    this.createStarImg();
    this.createItem();
    this.bglightstar.visible = false;
    this.bgstarLev.visible = false;
  }

  protected createStarImg() {
    const angle = Math.PI * 2 / 5 - 0.0096;
    for (let i = 0; i < 5; i++) {
      const star = this.scene.make.image({ key: UIAtlasName.effectcommon, frame: "synthetic_star_illume_1" });
      star.rotation = - angle * i + 0.0005;
      this.starImgList.push(star);
      star.visible = false;
      star.y = 3 * this.dpr;
      star.x = -2 * this.dpr;
    }
    this.add(this.starImgList);
  }
  protected createItem() {
    for (let i = 0; i < 5; i++) {
      const item = new FuriComposeItem(this.scene, this.dpr, this.zoom);
      this.itemList.push(item);
      item.on(ClickEvent.Tap, this.onItemHandler, this);
    }
    this.add(this.itemList);
    this.layoutItemsPosition();
  }

  protected layoutItemsPosition() {
    const angle = 3 * Math.PI / 2 - (Math.PI * 2 / 5);
    const radiu = 108 * this.dpr;
    for (let i = 0; i < this.itemList.length; i++) {
      const item = this.itemList[i];
      const tempangle = angle - (Math.PI * 2 / 5) * i;
      item.y = Math.sin(tempangle) * radiu;
      item.x = Math.cos(tempangle) * radiu;
    }
  }

  protected displayStarImg() {
    let havedCount: number = 0;
    for (let i = 0; i < this.indexeds.length; i++) {
      const value = this.indexeds[i];
      this.starImgList[i].visible = value === 0 ? false : true;
      if (value === 0) {
        this.starImgList[i].visible = false;
      } else {
        this.starImgList[i].visible = true;
        havedCount++;
      }
    }
    if (havedCount === 5) {
      this.bglightstar.visible = true;
      for (const starimg of this.starImgList) {
        starimg.visible = false;
      }
    } else {
      this.bglightstar.visible = false;
    }
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
    if (this.timerID) {
      this.timerID = clearInterval(this.timerID);
      this.timerID = undefined;
    }
  }

  private onItemHandler(pointer, gameobject) {
    const indexed = this.itemList.indexOf(gameobject);
    this.removeItemData(indexed);
  }

  private playMove(tagert: any, x: number, y: number, duration) {
    if (!this.scene) return;
    const tween = this.scene.tweens.add({
      targets: tagert,
      x: { value: 0 },
      y: { value: 3 * this.dpr },
      ease: "Linear",
      duration,
      onComplete: () => {
        tween.stop();
        tween.remove();
        this.clearItemDatas(false);
      },
    });
    this.tweens.push(tween);
  }

  private stopTweens() {
    for (const tween of this.tweens) {
      tween.stop();
      tween.remove();
    }
    this.tweens.length = 0;
  }
}
class FuriComposeItem extends ButtonEventDispatcher {
  public itemData: ICountablePackageItem;
  private bg: Phaser.GameObjects.Image;
  private lightbg: Phaser.GameObjects.Image;
  private icon: DynamicImage;
  private alphaTween: Phaser.Tweens.Tween;
  constructor(scene: Phaser.Scene, dpr: number, zoom: number) {
    super(scene, 0, 0);
    this.dpr = dpr;
    this.zoom = zoom;
    this.init();
    this.setSize(this.bg.width, this.bg.height);
    this.enable = true;
  }
  public setItemData(data: ICountablePackageItem) {
    this.itemData = data;
    this.clearTween();
    this.lightbg.alpha = 0;
    this.icon.alpha = 0;
    if (!data) {
      this.icon.visible = false;
    } else {
      const url = Url.getOsdRes(data.texturePath);
      this.icon.load(url);
      this.icon.visible = true;
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
    this.clearTween();
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
    this.alphaTween = tween;
  }
  private clearTween() {
    if (this.alphaTween) {
      this.alphaTween.stop();
      this.alphaTween.remove();
      this.alphaTween = undefined;
    }
  }
}
