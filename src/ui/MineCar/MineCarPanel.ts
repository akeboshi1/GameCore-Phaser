import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BasePanel } from "../components/BasePanel";
import { op_client } from "pixelpai_proto";
import { Url } from "../../utils/resUtil";
import { AlertView } from "../components/alert.view";
import { GameGridTable } from "../../../lib/rexui/lib/ui/gridtable/GameGridTable";
import { GridTableConfig } from "../../../lib/rexui/lib/ui/gridtable/GridTableConfig";
import { Button } from "../../../lib/rexui/lib/ui/button/Button";
import { TabButton } from "../../../lib/rexui/lib/ui/tab/TabButton";
export class MineCarPanel extends BasePanel {
  private readonly key = "mine_car";
  // private mPanel: Phaser.GameObjects.Container;
  // private mMask: Phaser.GameObjects.Graphics;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mCounter: Phaser.GameObjects.Text;
  private mPropGrid: GameGridTable;
  // private mPropContainer: Phaser.GameObjects.Container;
  // private mCategorieContainer: Phaser.GameObjects.Container;
  private mTips: Tips;
  private mDiscardBtn: DiscardButton;
  private mAllItem: IPackageItem[];
  private mFilterItem: IPackageItem[];
  private mLimit: number;
  private categoriesBg: Phaser.GameObjects.Image;
  private mCategoryTable: GameGridTable;
  private mPreSelectedCategorie: CategorieButton;
  private mBg: Phaser.GameObjects.Image;
  private carIcon: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.scale = 1;
    this.disInteractive();
  }

  resize(width: number, height: number) {
    const w = this.scene.cameras.main.width / this.scale;
    const h = this.scene.cameras.main.height / this.scale;
    super.resize(width, height);
    const zoom = this.mWorld.uiScaleNew;
    this.setSize(w, h);
    this.mBg.x = w / 2;
    this.mBg.y = this.mBg.displayHeight / 2 + 107 * this.dpr * zoom;
    this.carIcon.x = this.mBg.x / 2 - 4 * this.dpr * zoom;
    this.carIcon.y = this.mBg.y - (this.mBg.displayHeight - this.carIcon.displayHeight) / 2 + 4 * this.dpr * zoom;
    this.mCloseBtn.x = this.mBg.x + this.mBg.width / 2;
    this.mCloseBtn.y = this.mBg.y - (this.mBg.displayHeight - this.mCloseBtn.displayHeight) / 2 + 10 * this.dpr * zoom;
    this.mCounter.x = this.mBg.x / 2;
    this.mCounter.y = this.mBg.y + (this.mBg.displayHeight - this.mDiscardBtn.displayHeight) / 2 - 6 * this.dpr * zoom;
    this.mTips.x = this.mBg.x + 20 * this.dpr * zoom;
    this.mTips.y = this.mBg.y - this.mBg.displayHeight / 2 - 15 * this.dpr * zoom;
    this.mDiscardBtn.x = this.mBg.x + this.mBg.width / 2 - this.mDiscardBtn.width / 2;
    this.mDiscardBtn.y = this.mBg.y + this.mBg.height / 2 - this.mDiscardBtn.height / 2;
    this.categoriesBg.x = this.mBg.x;
    this.categoriesBg.y = this.mBg.y - this.mBg.height / 2 + this.categoriesBg.height + 12 * this.dpr * zoom;
    this.mPropGrid.refreshPos(this.mBg.x + 2 * this.dpr * zoom, this.mBg.y + 6 * this.dpr * zoom);
    this.mCategoryTable.refreshPos(this.mBg.x, this.mBg.y - this.mBg.height / 2 + this.categoriesBg.height + 18 * this.dpr * zoom);
  }

  public show(param?: any) {
    super.show(param);
    if (this.mInitialized && !this.mPreLoad) {
      this.refreshData();
    }
  }

  public update(param?: any) {
    super.update(param);
    if (this.mInitialized && this.mShow) {
      this.refreshData();
    }
  }

  setCategories(subcategorys: op_def.IStrPair[]) {
    this.mCategoryTable.setItems(subcategorys);
  }

  addListen() {
    if (!this.mInitialized) return;
    this.removeListen();
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mDiscardBtn.on("Tap", this.enterDiscardMode, this);
  }

  removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mDiscardBtn.off("Tap", this.enterDiscardMode, this);
  }

  setProp() { }

  destroy() {
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    // if (this.mPanel) {
    //   this.mPanel.removeAll(true);
    // }
    if (this.mCategoryTable) {
      this.mCategoryTable.destroy();
    }
    super.destroy();
  }

  protected preload() {
    this.addAtlas(this.key, `mine_car/mine_car.png`, `mine_car/mine_car.json`);
    super.preload();
  }

  protected init() {
    const w = this.scene.cameras.main.width / this.scale;
    const h = this.scene.cameras.main.height / this.scale;
    this.setSize(w, h);
    // this.mPanel = this.scene.make.container(undefined, false);
    // this.mMask = this.scene.make.graphics(undefined, false);
    const zoom = this.mWorld.uiScaleNew;

    this.mBg = this.scene.make
      .image({
        key: this.key,
        frame: "bg.png",
      })
      .setScale(zoom);
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
      )
      .setScale(zoom);
    this.carIcon.x = (-(this.mBg.width - this.carIcon.width) * zoom) / 2 + 28 * this.dpr * zoom;
    this.carIcon.y = (-(this.mBg.height - this.carIcon.height / 2) * zoom) / 2 + 10 * this.dpr * zoom;

    this.mCloseBtn = this.scene.make
      .image(
        {
          // x: 110 * this.dpr * zoom,
          // y: -125 * this.dpr * zoom,
          key: this.key,
          frame: "close_btn.png",
        },
        false
      )
      .setScale(zoom);
    this.mCloseBtn.setInteractive();
    this.mCloseBtn.x = (this.mBg.width * zoom) / 2;
    this.mCloseBtn.y = (-(this.mBg.height - this.mCloseBtn.height) * zoom) / 2 + 10 * this.dpr * zoom;

    this.mCounter = this.scene.make.text(
      {
        text: "25/50",
        style: {
          fontFamily: Font.DEFULT_FONT,
          color: "#FFFFFF",
          fontSize: 12 * this.dpr * zoom,
        },
      },
      false
    );
    this.mCounter.x = -this.displayWidth / 2 + 17 * this.dpr * zoom;
    this.mCounter.y = this.displayHeight / 2 - 18 * this.dpr * zoom - this.mCounter.height;
    this.mCounter.setFontStyle("bold");

    this.mTips = new Tips(this.scene, this.key, this.dpr, zoom);
    this.mTips.scale = zoom;
    this.mTips.x = 40 * this.dpr * zoom; // - this.mTips.width / 2;
    this.mTips.y = (-(this.mBg.height + this.mTips.height) * zoom) / 2 + 15 * this.dpr * zoom;

    this.mDiscardBtn = new DiscardButton(this.scene, this.key, "yellow_btn.png", undefined, "丢弃");
    this.mDiscardBtn.scale = zoom;
    (this.mDiscardBtn.x = ((this.mBg.width - this.mDiscardBtn.displayWidth) * zoom) / 2 - 17 * this.dpr * zoom),
      (this.mDiscardBtn.y = ((this.mBg.height - this.mDiscardBtn.displayHeight) * zoom) / 2 - 10 * this.dpr * zoom),
      this.mDiscardBtn.setTextStyle({
        color: "##996600",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 10 * this.dpr * zoom,
      });
    this.mDiscardBtn.changeState(DiscardEnum.Discard);
    this.categoriesBg = this.scene.make
      .image({
        key: this.key,
        frame: "nav_bg.png",
      })
      .setScale(zoom);
    // this.categoriesBg.y = -111 * this.dpr * zoom + this.categoriesBg.height * zoom / 2;
    this.categoriesBg.y = -(this.displayHeight - this.categoriesBg.displayHeight) / 2 + 36 * this.dpr * zoom;

    const propFrame = this.scene.textures.getFrame(this.key, "item_border.png");
    const capW = propFrame.width * zoom + 4 * this.dpr * zoom;
    const capH = propFrame.height * zoom + 4 * this.dpr * zoom;
    // this.cellHeight = capH;
    const gridW = 236 * this.dpr * zoom;
    const propConfig: GridTableConfig = {
      x: -7 * this.dpr * zoom,
      y: -16 * this.dpr * zoom,
      table: {
        width: gridW,
        height: 295 * this.dpr * zoom,
        columns: 4,
        cellsCount: 25,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
        // mask: false
      },
      scrollMode: 0,
      clamplChildOY: false,
      // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new PackageItem(scene, this.key, this.dpr, zoom);
          this.add(cellContainer);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
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

    const frame = this.scene.textures.getFrame(this.key, "nav_btn_normal.png");
    const categoryTableConfig: GridTableConfig = {
      x: -9 * this.dpr * zoom,
      y: -155 * this.dpr * zoom,
      table: {
        width: gridW,
        height: this.categoriesBg.displayHeight,
        cellWidth: (frame.width + 4 * this.dpr) * zoom,
        cellHeight: (29 * this.dpr) * zoom,
        reuseCellContainer: true,
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
            fontSize: 10 * this.dpr * zoom
          });
          cellContainer.setFontStyle("bold");
          this.add(cellContainer);
        }
        cellContainer.setText(item.value);
        cellContainer.setData("data", item);
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
      // this.mMask,
      this.mBg,
      this.carIcon,
      this.mCounter,
      this.categoriesBg,
      this.mPropGrid.table,
      this.mCategoryTable.table,
      this.mCloseBtn,
      this.mDiscardBtn,
    ]);
    this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
    super.init();
  }

  private refreshData() {
    const minePackage: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE = this.mShowData;
    const mineItem = minePackage.items || [];
    this.mLimit = minePackage.limit || 0;
    this.mAllItem = [];
    for (const item of mineItem) {
      this.mAllItem.push({ item });
    }

    this.mDiscardBtn.changeState(DiscardEnum.Discard);
    this.mCounter.setText(`${mineItem.length}/${this.mLimit}`);
    this.setCategories(minePackage.subcategories);
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onSelectedCategory(subcategory: string) {
    this.mFilterItem = [];
    let pkgItem = null;
    for (const item of this.mAllItem) {
      pkgItem = item.item;
      if (pkgItem && (pkgItem.subcategory === subcategory || subcategory === "all")) {
        this.mFilterItem.push(item);
      }
    }
    const len = this.mLimit - this.mFilterItem.length;
    for (let i = 0; i < len; i++) {
      this.mFilterItem.push({ item: null });
    }
    this.mPropGrid.setItems(this.mFilterItem);
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
    const data = item.getData("data");
    if (data) {
      this.onSelectedCategory(data.key);
      if (this.mPreSelectedCategorie) {
        this.mPreSelectedCategorie.changeNormal();
      }
      item.changeDown();
      this.mPreSelectedCategorie = item;
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

    new AlertView(this.scene, this.mWorld).show({
      text: `您确定要丢弃 [color=#0157BC]${label.join("、")}[/color] 吗？`,
      title: "丢弃",
      oy: 302 * this.dpr * this.mWorld.uiScaleNew,
      callback: () => {
        this.emit("discard", selected);
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
  private mItemImage: DynamicImage;
  private mCounter: Phaser.GameObjects.Text;
  private mItem: IPackageItem;
  private mSelectedIcon: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
    super(scene);

    const border = this.scene.make
      .image(
        {
          key,
          frame: "item_border.png",
        },
        false
      )
      .setOrigin(0)
      .setScale(zoom);
    this.setSize(border.width * zoom, border.height * zoom);

    this.mItemImage = new DynamicImage(this.scene, 0, 0);
    this.mItemImage.setOrigin(0);
    this.mItemImage.setScale(dpr * zoom);

    this.mCounter = this.scene.make
      .text({
        x: border.displayWidth - 2 * dpr,
        y: border.displayHeight - 1 * dpr,
        style: {
          fontFamily: Font.DEFULT_FONT,
          fontSize: 9 * dpr * zoom,
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
    this.mSelectedIcon.x = border.width * zoom - 2 * dpr - (this.mSelectedIcon.width * zoom) / 2;
    this.mSelectedIcon.y = 2 * dpr + (this.mSelectedIcon.height * zoom) / 2;
    this.add(border);
  }

  setProp(data: IPackageItem) {
    this.mItem = data;
    const packageItem = data.item;
    if (!data || !packageItem) {
      this.remove([this.mItemImage, this.mCounter, this.mSelectedIcon]);
      return;
    }
    if (this.mItem) {
      this.mItemImage.load(Url.getOsdRes(packageItem.display.texturePath), this, this.onLoadCompleteHandler);
      this.add(this.mItemImage);
      if (packageItem.count > 1) {
        this.mCounter.setText(packageItem.count.toString());
        this.add(this.mCounter);
      }
      if (this.mItem.selectVisible) {
        this.add(this.mSelectedIcon);
      } else {
        this.remove(this.mSelectedIcon);
      }
      this.setSelected();
    }
  }

  switchSelect() {
    if (!this.mItem.item) {
      return;
    }
    this.mItem.selected = !this.mItem.selected;
    this.setSelected();
  }

  get item(): IPackageItem {
    return this.mItem;
  }

  private onLoadCompleteHandler() {
    if (this.mItemImage) {
      this.mItemImage.x = (this.width - this.mItemImage.displayWidth) >> 1;
      this.mItemImage.y = (this.height - this.mItemImage.displayHeight) >> 1;
    }
  }

  private setSelected() {
    if (this.mItem.selected) {
      this.mSelectedIcon.setFrame("icon_selected.png");
    } else {
      this.mSelectedIcon.setFrame("icon_normal.png");
    }
  }
}

interface IPackageItem {
  item: op_client.ICountablePackageItem;
  selected?: boolean;
  selectVisible?: boolean;
}

class Tips extends Phaser.GameObjects.Container {
  private mName: Phaser.GameObjects.Text;
  private mDes: Phaser.GameObjects.Text;
  private mDpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.mDpr = dpr;
    const bg = this.scene.make.image(
      {
        key,
        frame: "tips_bg.png",
      },
      false
    );
    this.mName = this.scene.make.text(
      {
        x: -bg.width / 2 + 12 * dpr * zoom,
        y: -bg.height / 2 + 5 * dpr * zoom,
        style: {
          fontFamily: Font.DEFULT_FONT,
          fontSize: 10 * dpr * zoom,
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
            fontSize: 10 * dpr * zoom,
            color: "#000000",
          },
        },
        false
      )
      .setOrigin(0, 1);
    this.add([bg, this.mName, this.mDes]);
    this.setSize(bg.width * zoom, bg.height * zoom);
  }

  setItem(item: op_client.ICountablePackageItem) {
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
    this.mBackground.setOrigin(0);
    if (this.mText) {
      this.mText.setPosition(this.mBackground.width / 2, this.mBackground.height / 2);
    }
  }
}
