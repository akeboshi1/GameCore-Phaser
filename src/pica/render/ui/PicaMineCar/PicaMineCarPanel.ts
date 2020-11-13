import { GameGridTable, Button, TabButton, ClickEvent } from "apowophaserui";
import { AlertView, BasePanel, DynamicImage, UiManager } from "gamecoreRender";
import { ModuleName, RENDER_PEER } from "structure";
import { Font, i18n, Url } from "utils";
export class PicaMineCarPanel extends BasePanel {
  // private mPanel: Phaser.GameObjects.Container;
  // private mMask: Phaser.GameObjects.Graphics;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mCounter: Phaser.GameObjects.Text;
  private mPropGrid: GameGridTable;
  // private mPropContainer: Phaser.GameObjects.Container;
  // private mCategorieContainer: Phaser.GameObjects.Container;
  private mTips: Tips;
  private mDiscardBtn: DiscardButton;
  private mFilterItem: IPackageItem[] = [];
  private mLimit: number;
  private categoriesBg: Phaser.GameObjects.Image;
  private mCategoryTable: GameGridTable;
  private mPreSelectedCategorie: CategorieButton;
  private mPreSelectedCategorieData: any;// op_def.StrPair
  private mBg: Phaser.GameObjects.Image;
  private carIcon: Phaser.GameObjects.Image;
  private mBackGround: Phaser.GameObjects.Graphics;
  constructor(protected uiManager: UiManager) {
    super(uiManager.scene, uiManager.render);
    this.key = ModuleName.PICAMINECAR_NAME;
    this.disInteractive();
  }

  resize(width: number, height: number) {
    const w = this.scaleWidth;
    const h = this.scaleHeight;
    super.resize(width, height);
    this.setSize(w, h);
    this.mBackGround.clear();
    this.mBackGround.fillStyle(0x6AE2FF, 0);
    this.mBackGround.fillRect(0, 0, w, h);
    this.mBg.x = w / 2;
    this.mBg.y = this.mBg.displayHeight / 2 + 107 * this.dpr;
    this.carIcon.x = this.mBg.x / 2 - 4 * this.dpr;
    this.carIcon.y = this.mBg.y - (this.mBg.displayHeight - this.carIcon.displayHeight) / 2 + 4 * this.dpr;
    this.mCloseBtn.x = this.mBg.x + this.mBg.displayWidth / 2;
    this.mCloseBtn.y = this.mBg.y - (this.mBg.displayHeight - this.mCloseBtn.displayHeight) / 2 + 10 * this.dpr;
    this.mCounter.x = this.mBg.x / 2;
    this.mCounter.y = this.mBg.y + (this.mBg.displayHeight - this.mDiscardBtn.displayHeight) / 2 - 16 * this.dpr;
    this.mCounter.setResolution(this.dpr);
    this.mTips.x = this.mBg.x + 20 * this.dpr;
    this.mTips.y = this.mBg.y - this.mBg.displayHeight / 2 - 15 * this.dpr;
    this.mDiscardBtn.x = this.mBg.x + this.mBg.displayWidth / 2 - this.mDiscardBtn.displayWidth / 2 - 9 * this.dpr;
    this.mDiscardBtn.y = this.mBg.y + this.mBg.displayHeight / 2 - this.mDiscardBtn.displayHeight / 2 - 9 * this.dpr;
    this.categoriesBg.x = this.mBg.x;
    this.categoriesBg.y = this.mBg.y - this.mBg.displayHeight / 2 + this.categoriesBg.displayHeight / 2 + 38 * this.dpr;
    this.mPropGrid.refreshPos(this.mBg.x + 2 * this.dpr, this.mBg.y + 6 * this.dpr);
    this.mCategoryTable.refreshPos(this.mBg.x, this.mBg.y - this.mBg.displayHeight / 2 + this.categoriesBg.displayHeight / 2 + 44 * this.dpr);
    this.mPropGrid.resetMask();
    this.mCategoryTable.resetMask();
  }

  public show(param?: any) {
    super.show(param);
  }

  setCategories(subcategorys: any[]) {// op_def.IStrPair
    this.mPreSelectedCategorie = undefined;
    this.mPreSelectedCategorieData = undefined;
    this.mCategoryTable.setItems(subcategorys);
  }
  public setCategoriesData(subcategorys: any[]) {// op_def.IStrPair
    this.mDiscardBtn.changeState(DiscardEnum.Discard);
    this.setCategories(subcategorys);
  }
  addListen() {
    if (!this.mInitialized) return;
    this.removeListen();
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mDiscardBtn.on(ClickEvent.Tap, this.enterDiscardMode, this);
  }

  removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mDiscardBtn.off(ClickEvent.Tap, this.enterDiscardMode, this);
  }

  setProp(items: any[], limit: number) {// op_client.ICountablePackageItem
    const mineItem = items || [];
    this.mLimit = limit || 0;
    this.mFilterItem.length = 0;
    for (const item of mineItem) {
      this.mFilterItem.push({ item });
    }
    const len = this.mLimit - this.mFilterItem.length;
    for (let i = 0; i < len; i++) {
      this.mFilterItem.push({ item: null });
    }
    this.mPropGrid.setItems(this.mFilterItem);
    this.mCounter.setText(`${mineItem.length}/${this.mLimit}`);
  }

  destroy() {
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    if (this.mCategoryTable) {
      this.mCategoryTable.destroy();
    }
    super.destroy();
  }

  queryRefreshPackage() {
    if (this.mPreSelectedCategorieData) {
      this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querypackage", { type: 4, key: this.mPreSelectedCategorieData.key });// op_pkt_def.PKT_PackageType.MinePackage
    }
  }

  protected preload() {
    this.addAtlas(this.key, `mine_car/mine_car.png`, `mine_car/mine_car.json`);
    super.preload();
  }

  protected init() {
    const w = this.scaleWidth;
    const h = this.scaleHeight;
    this.setSize(w, h);
    this.mBackGround = this.scene.make.graphics(undefined, false);
    this.mBackGround.clear();
    this.mBackGround.fillStyle(0x6AE2FF, 0);
    this.mBackGround.fillRect(0, 0, w, h);
    this.mBackGround.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    this.mBg = this.scene.make
      .image({
        key: this.key,
        frame: "bg.png",
      });
    this.mBg.x = w / 2;
    this.mBg.y = h / 2;
    // this.mPanel.setSize(bg.displayWidth, bg.displayHeight);

    this.carIcon = this.scene.make
      .image(
        {
          key: this.key,
          frame: "car_icon.png",
        },
        false
      );
    this.carIcon.x = (-(this.mBg.width - this.carIcon.width)) / 2 + 28 * this.dpr;
    this.carIcon.y = (-(this.mBg.height - this.carIcon.height / 2)) / 2 + 10 * this.dpr;

    this.mCloseBtn = this.scene.make
      .image(
        {
          key: this.key,
          frame: "close_btn.png",
        },
        false
      );
    this.mCloseBtn.setInteractive();
    this.mCloseBtn.x = (this.mBg.width) / 2;
    this.mCloseBtn.y = (-(this.mBg.height - this.mCloseBtn.height)) / 2 + 10 * this.dpr;
    this.mCloseBtn.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mCounter = this.scene.make.text(
      {
        text: "25/50",
        style: {
          fontFamily: Font.DEFULT_FONT,
          color: "#FFFFFF",
          fontSize: 12 * this.dpr,
        },
      },
      false
    );
    this.mCounter.x = -this.displayWidth / 2 + 17 * this.dpr;
    this.mCounter.y = this.displayHeight / 2 - 18 * this.dpr - this.mCounter.height;
    this.mCounter.setFontStyle("bold");

    this.mTips = new Tips(this.scene, this.key, this.dpr);
    this.mTips.x = 40 * this.dpr;
    this.mTips.y = (-(this.mBg.height + this.mTips.height)) / 2 + 15 * this.dpr;

    this.mDiscardBtn = new DiscardButton(this.scene, this.key, "yellow_btn.png", undefined, "丢弃");
    (this.mDiscardBtn.x = ((this.mBg.width - this.mDiscardBtn.displayWidth)) / 2 - 17 * this.dpr),
      (this.mDiscardBtn.y = ((this.mBg.height - this.mDiscardBtn.displayHeight)) / 2 - 10 * this.dpr),
      this.mDiscardBtn.setTextStyle({
        color: "##996600",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 10 * this.dpr,
      });
    this.mDiscardBtn.changeState(DiscardEnum.Discard);
    this.categoriesBg = this.scene.make
      .image({
        key: this.key,
        frame: "nav_bg.png",
      });
    this.categoriesBg.y = -(this.displayHeight - this.categoriesBg.displayHeight) / 2 + 36 * this.dpr;

    const propFrame = this.scene.textures.getFrame(this.key, "item_border.png");
    const capW = propFrame.width + 4 * this.dpr;
    const capH = propFrame.height + 4 * this.dpr;
    // this.cellHeight = capH;
    const gridW = 236 * this.dpr;
    const propConfig = {
      x: -7 * this.dpr,
      y: -16 * this.dpr,
      table: {
        width: gridW,
        height: 295 * this.dpr,
        columns: 4,
        cellsCount: 25,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        cellOriginX: 0,
        cellOriginY: 0,
        zoom: this.scale
        // mask: false
      },
      scrollMode: 0,
      clamplChildOY: false,
      // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new PackageItem(scene, this.key, this.dpr);
        }
        // if (cellContainer.itemData !== item) {
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        // }
        return cellContainer;
      },
    };
    this.mPropGrid = new GameGridTable(this.scene, propConfig);
    this.mPropGrid.layout();
    this.mPropGrid.on("cellTap", (cell: PackageItem) => {
      // const item = cell.getData("item");
      // if (item) {
      this.onSelectItemHandler(cell);
      // }
    });

    const btnFrame = this.scene.textures.getFrame(this.key, "nav_btn_normal.png");
    const categoryTableConfig = {
      x: -9 * this.dpr,
      y: -155 * this.dpr,
      table: {
        width: gridW,
        height: this.categoriesBg.displayHeight,
        cellWidth: btnFrame.width + 4 * this.dpr,
        cellHeight: btnFrame.height,
        reuseCellContainer: true,
        cellOriginX: 0,
        cellOriginY: 0,
        zoom: this.scale
        // mask: false
      },
      scrollMode: 1,
      // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new CategorieButton(scene, this.key, "nav_btn_normal.png", "nav_btn_down.png", "1");
          cellContainer.setTextStyle({
            color: "#566ddb",
            fontFamily: Font.DEFULT_FONT,
            fontSize: 10 * this.dpr
          });
          cellContainer.setFontStyle("bold");
        }
        cellContainer.setText(item.value);
        cellContainer.setData("data", item);
        if (this.mPreSelectedCategorieData === item) {
          cellContainer.changeDown();
          this.mPreSelectedCategorie = cellContainer;
        } else {
          cellContainer.changeNormal();
        }

        if (!this.mPreSelectedCategorie) {
          this.onClickCategoryHandler(cellContainer);
        }
        return cellContainer;
      }
    };
    this.mCategoryTable = new GameGridTable(this.scene, categoryTableConfig);
    this.mCategoryTable.layout();
    this.mCategoryTable.on("cellTap", (cell) => {
      this.onClickCategoryHandler(cell);
    });
    // this.add(this.mPanel);
    this.add([
      this.mBackGround,
      this.mBg,
      this.carIcon,
      this.mCounter,
      this.categoriesBg,
      this.mPropGrid,
      this.mCategoryTable,
      this.mCloseBtn,
      this.mDiscardBtn,
    ]);
    this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
    super.init();
    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querycategory");
  }

  private onCloseHandler() {
    this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_close");
  }
  private onSelectItemHandler(packageItem: PackageItem) {
    if (this.mDiscardBtn && this.mDiscardBtn.buttonState !== DiscardEnum.Discard) {
      packageItem.switchSelect();
      this.checkMode();
      return;
    }
    if (packageItem && packageItem.item.item) {
      if (!this.mTips.parentContainer) {
        this.add(this.mTips);
      }
      this.mTips.setItem(packageItem.item.item);
    } else {
      this.remove(this.mTips);
    }
  }

  private onClickCategoryHandler(item: CategorieButton) {
    const data = (<any>item).getData("data");
    if (data) {
      this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_querypackage", { type: 4, key: data.key });// op_pkt_def.PKT_PackageType.MinePackage
      if (this.mPreSelectedCategorie) {
        (<any>this.mPreSelectedCategorie).changeNormal();
      }
      (<any>item).changeDown();
      this.mPreSelectedCategorie = item;
      this.mPreSelectedCategorieData = data;
    }
  }

  private checkMode() {
    if (!this.mFilterItem || this.mFilterItem.length < 1) {
      return;
    }
    for (const item of this.mFilterItem) {
      if (item.selected) {
        this.mDiscardBtn.changeState(DiscardEnum.Sutmit);
        return;
      }
    }
    this.mDiscardBtn.changeState(DiscardEnum.Cancel);
  }

  private onDiscardSelectedItem() {
    if (!this.mFilterItem || this.mFilterItem.length < 1) {
      return;
    }
    // const selected = this.mAllItem.filter((item) => item.selected);
    const selected = [];
    const label = [];
    for (const item of this.mFilterItem) {
      if (item.item && item.selected) {
        selected.push(item.item);
        label.push(`${item.item.name}*${item.item.count}`);
      }
    }

    new AlertView(this.uiManager).show({
      text: i18n.t("minecar.confirmation", { name: `${label.join("、")}` }),
      title: i18n.t("minecar.discard"),
      oy: 302 * this.dpr * this.render.uiScale,
      callback: () => {
        this.render.renderEmitter(RENDER_PEER + "_" + this.key + "_discard", selected);
      },
    });
  }

  private enterDiscardMode() {
    if (!this.mFilterItem) {
      return;
    }
    const state = this.mDiscardBtn.buttonState;
    let visible = false;
    if (state === DiscardEnum.Discard) {
      this.mDiscardBtn.changeState(DiscardEnum.Cancel);
      visible = true;
    } else {
      if (state === DiscardEnum.Sutmit) {
        this.onDiscardSelectedItem();
      }
      this.mDiscardBtn.changeState(DiscardEnum.Discard);
    }
    if (this.mFilterItem.length > 0 && this.mFilterItem[0].selectVisible !== visible) {
      this.mFilterItem.map((item) => {
        item.selectVisible = visible;
        item.selected = false;
      });
      this.mPropGrid.setItems(this.mFilterItem);
    }
  }
}

class PackageItem extends Phaser.GameObjects.Container {
  public itemData: IPackageItem;
  private mItemImage: DynamicImage;
  private mCounter: Phaser.GameObjects.Text;
  private mSelectedIcon: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene);

    const border = this.scene.make
      .image(
        {
          key,
          frame: "item_border.png",
        },
        false
      )
      .setOrigin(0);
    this.setSize(border.width, border.height);

    this.mItemImage = new DynamicImage(this.scene, 0, 0);
    this.mItemImage.setOrigin(0);
    this.mItemImage.setScale(dpr);

    this.mCounter = this.scene.make
      .text({
        x: border.displayWidth - 2 * dpr,
        y: border.displayHeight - 1 * dpr,
        style: {
          fontFamily: Font.DEFULT_FONT,
          fontSize: 9 * dpr,
          color: "#566DDB",
        },
      })
      .setOrigin(1);
    this.mCounter.setFontStyle("bold");

    this.mSelectedIcon = this.scene.make.image(
      {
        key,
        frame: "icon_normal.png",
      },
      false
    );
    this.mSelectedIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mSelectedIcon.x = border.width - 2 * dpr - (this.mSelectedIcon.width) / 2;
    this.mSelectedIcon.y = 2 * dpr + (this.mSelectedIcon.height) / 2;
    // this.mSelectedIcon.x = 0;
    // this.mSelectedIcon.y = 0;
    this.add(border);
    this.add([this.mItemImage, this.mCounter, this.mSelectedIcon]);
  }

  setProp(data: IPackageItem) {
    this.itemData = data;
    const packageItem = data.item;
    if (!data || !packageItem) {
      this.mItemImage.visible = false;
      this.mCounter.visible = false;
      this.mSelectedIcon.visible = false;
      return;
    }
    if (this.itemData) {
      this.mItemImage.load(Url.getOsdRes(packageItem.display.texturePath), this, this.onLoadCompleteHandler);
      this.mItemImage.visible = true;
      if (packageItem.count > 1) {
        this.mCounter.setText(packageItem.count.toString());
        this.mCounter.visible = true;
      } else {
        this.mCounter.visible = false;
      }
      this.mSelectedIcon.visible = (this.itemData.selectVisible ? true : false);
      this.setSelected();
    }
  }

  switchSelect() {
    if (!this.itemData.item) {
      return;
    }
    this.itemData.selected = !this.itemData.selected;
    this.setSelected();
  }

  get item(): IPackageItem {
    return this.itemData;
  }

  private onLoadCompleteHandler() {
    if (this.mItemImage) {
      this.mItemImage.x = (this.width - this.mItemImage.displayWidth) >> 1;
      this.mItemImage.y = (this.height - this.mItemImage.displayHeight) >> 1;
    }
  }

  private setSelected() {
    if (this.itemData.selected) {
      this.mSelectedIcon.setFrame("icon_selected.png");
    } else {
      this.mSelectedIcon.setFrame("icon_normal.png");
    }
  }
}

interface IPackageItem {
  item: any;// op_client.ICountablePackageItem
  selected?: boolean;
  selectVisible?: boolean;
}

class Tips extends Phaser.GameObjects.Container {
  private mName: Phaser.GameObjects.Text;
  private mDes: Phaser.GameObjects.Text;
  private mDpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene);
    this.mDpr = dpr;
    const bg = this.scene.make.image(
      {
        key,
        frame: "tips_bg.png",
      },
      false
    );
    bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mName = this.scene.make.text(
      {
        x: -bg.width / 2 + 12 * dpr,
        y: -bg.height / 2 + 5 * dpr,
        style: {
          fontFamily: Font.DEFULT_FONT,
          fontSize: 10 * dpr,
          color: "#000000",
        },
      },
      false
    );
    this.mDes = this.scene.make
      .text(
        {
          x: this.mName.x,
          style: {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 10 * dpr,
            color: "#000000",
          },
        },
        false
      )
      .setOrigin(0, 1);
    this.add([bg, this.mName, this.mDes]);
    this.setSize(bg.width, bg.height);
  }

  setItem(item: any) {// op_client.ICountablePackageItem
    if (!item) {
      return;
    }
    const tmpY = this.y;
    const tmpAlpha = this.alpha;
    this.y = tmpY + 50 * this.mDpr;
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      props: {
        alpha: tmpAlpha,
        y: tmpY,
      },
      duration: 200,
      ease: Phaser.Math.Easing.Elastic.Out,
    });
    this.mName.setText(item.shortName || item.name);
    this.mDes.setText(item.des);
  }
}

class DiscardButton extends Button {
  private mState: DiscardEnum;
  constructor(scene: Phaser.Scene, key: string, frame?: string, downFrame?: string, text?: string) {
    super(scene, key, frame, downFrame, text);
  }

  changeState(val: DiscardEnum) {
    if (this.mState === val) {
      return;
    }
    this.mState = val;
    switch (val) {
      case DiscardEnum.Cancel:
        this.setText("取消");
        this.setFrame("gray_btn.png");
        break;
      case DiscardEnum.Sutmit:
        this.setText("提交");
        this.setFrame("yellow_btn.png");
        break;
      default:
        this.setText("丢弃");
        this.setFrame("yellow_btn.png");
        break;
    }
  }

  get buttonState(): DiscardEnum {
    return this.mState;
  }
}

enum DiscardEnum {
  Discard,
  Cancel,
  Sutmit,
}

class CategorieButton extends TabButton {
  constructor(scene: Phaser.Scene, key: string, frame?: string, downFrame?: string, text?: string) {
    super(scene, key, frame, downFrame, text);
    this.disInteractive();
    this.removeListen();
    (this.mBackground as Phaser.GameObjects.Image).setOrigin(0, 0);
    if (this.mText) {
      this.mText.setPosition(this.mBackground.width / 2, this.mBackground.height / 2);
    }
  }
}
