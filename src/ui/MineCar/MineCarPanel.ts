import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BasePanel } from "../components/BasePanel";
import GridTable from "../../../lib/rexui/lib/ui/gridtable/GridTable";
import { Button } from "../components/button";
import { Logger } from "../../utils/log";
import { CheckboxGroup } from "../components/checkbox.group";
import { op_client } from "pixelpai_proto";
import { Url, ResUtils } from "../../utils/resUtil";

export class MineCarPanel extends BasePanel {
  private readonly key = "mine_car";
  private mPanel: Phaser.GameObjects.Container;
  private mMask: Phaser.GameObjects.Graphics;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mCounter: Phaser.GameObjects.Text;
  private mPropGrid: GridTable;
  private mPropContainer: Phaser.GameObjects.Container;
  private mCategorieContainer: Phaser.GameObjects.Container;
  private mTips: Tips;
  private mDiscardBtn: DiscardButton;
  private mDiscardMode: boolean = false;
  private mAllItem: IPackageItem[];
  private mFilterItem: IPackageItem[];
  private mLimit: number;
  private mCheckBox: CheckboxGroup;
  private categoriesBg;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.scale = 1;
    this.disInteractive();
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    this.x = width / 2;
    this.y = height / 2;

    this.mMask.clear();
    this.mMask.fillStyle(0x000000, 0.6);
    this.mMask.fillRect(-width / 2, -height / 2, width, height);
    this.mMask.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    this.mPropGrid.x = this.x;
    this.mPropGrid.y = this.y + 16 * this.dpr * this.mWorld.uiScaleNew;
    this.mPropGrid.layout();
    this.mPropContainer.x = -this.mPropGrid.x;
    this.mPropContainer.y = -this.mPropGrid.y + 16 * this.dpr * this.mWorld.uiScaleNew;

    this.setSize(width, height);
    // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
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

  setCategories(subcategorys: op_def.IStrMap[]) {
    this.mCategorieContainer.removeAll(true);
    this.mCategorieContainer.setSize(this.categoriesBg.width, this.categoriesBg.height);
    const items = [];
    const zoom = this.mWorld.uiScaleNew;
    const gap = 4 * zoom;
    const style = {
      fontFamily: Font.DEFULT_FONT,
      fontSize: 8 * this.dpr * zoom,
      color: "#566ddb"
    };
    for (let i = 0; i < subcategorys.length; i++) {
      const item = new Button(this.scene, this.key, "nav_btn_normal.png", "nav_btn_down.png", subcategorys[i].value);
      item.setScale(zoom);
      item.setTextStyle(style);
      item.setFontStyle("bold");
      item.setData("data", subcategorys[i]);
      item.x = i * (item.displayWidth + gap * this.dpr) + item.displayWidth / 2 - this.mCategorieContainer.width / 2;
      item.y = (this.mCategorieContainer.height - item.displayHeight) / 2;
      items.push(item);
    }
    if (this.mCheckBox) {
      this.mCheckBox.reset();
      this.mCheckBox.off("selected", this.onClickCategoryHandler, this);
    }
    this.mCheckBox.on("selected", this.onClickCategoryHandler, this);
    this.mCheckBox.appendItemAll(items);
    this.mCategorieContainer.add(items);
    this.mCheckBox.selectIndex(0);
  }

  addListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
    this.mDiscardBtn.on("click", this.enterDiscardMode, this);
  }

  removeListen() {
    if (!this.mInitialized) return;
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
    this.mDiscardBtn.off("click", this.enterDiscardMode, this);
  }

  setProp() {

  }

  destroy() {
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
    }
    if (this.mCheckBox) {
      this.mCheckBox.destroy();
    }
    super.destroy();
  }

  protected preload() {
    this.addAtlas(this.key, `mine_car/mine_car.png`, `mine_car/mine_car.json`);
    super.preload();
  }

  protected init() {
    this.mPanel = this.scene.make.container(undefined, false);
    this.mMask = this.scene.make.graphics(undefined, false);
    const zoom = this.mWorld.uiScaleNew;

    const bg = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    }).setScale(zoom);
    this.mPanel.setSize(bg.displayWidth, bg.displayHeight);

    this.mCloseBtn = this.scene.make.image({
      x: 110 * this.dpr * zoom,
      y: -125 * this.dpr * zoom,
      key: this.key,
      frame: "close_btn.png"
    }, false).setScale(zoom);
    this.mCloseBtn.setInteractive();

    this.mCounter = this.scene.make.text({
      x: -86 * this.dpr * zoom,
      y: bg.displayHeight / 2 - 23 * this.dpr * zoom,
      text: "25/50",
      style: {
        fontFamily: Font.DEFULT_FONT,
        color: "#FFFFFF",
        fontSize: 14 * this.dpr
      }
    }, false).setScale(zoom);

    this.mTips = new Tips(this.scene, this.key, this.dpr, zoom);
    this.mTips.scale = zoom;
    this.mTips.x = 40 * this.dpr * zoom;// - this.mTips.width / 2;
    this.mTips.y = -130 * this.dpr * zoom - this.mTips.height / 2;

    this.mDiscardBtn = new DiscardButton(this.scene, this.key, "yellow_btn.png", undefined, "丢弃");
    this.mDiscardBtn.x = (bg.width - this.mDiscardBtn.width) / 2,
      this.mDiscardBtn.y = (bg.height - this.mDiscardBtn.height) / 2,
      this.mDiscardBtn.setTextStyle({
        color: "##996600",
        fontFamily: Font.DEFULT_FONT,
        fontSize: 10 * this.dpr * zoom
      });
    this.mDiscardBtn.switchState(DiscardEnum.Discard);

    this.mCategorieContainer = this.scene.make.container(undefined, false);
    this.categoriesBg = this.scene.make.image({
      key: this.key,
      frame: "nav_bg.png"
    }).setScale(zoom);
    this.categoriesBg.y = -111 * this.dpr * zoom + this.categoriesBg.height * zoom / 2;
    this.mCategorieContainer.setSize(this.categoriesBg.displayWidth, this.categoriesBg.displayHeight);
    // this.mCategorieContainer.x = -categoriesBg.width / 2;
    this.mCategorieContainer.y = this.categoriesBg.y;

    this.mPropContainer = this.scene.make.container(undefined, false);
    const propFrame = this.scene.textures.getFrame(this.key, "item_boder.png");
    const capW = propFrame.width * zoom + 3 * this.dpr;
    const capH = propFrame.height * zoom + 3 * this.dpr;
    const w = this.scene.cameras.main.width;
    const gridW = 190 * this.dpr * zoom;
    this.mPropGrid = new GridTable(this.scene, {
      table: {
        width: gridW,
        height: 190 * this.dpr * zoom,
        columns: 5,
        cellWidth: capW,
        cellHeight: capH,
        reuseCellContainer: true,
      },
      clamplChildOY: true,
      createCellContainerCallback: (cell, cellContainer) => {
        const scene = cell.scene,
          item = cell.item;
        if (cellContainer === null) {
          cellContainer = new PackageItem(scene, this.key, this.dpr, zoom);
          this.mPropContainer.add(cellContainer);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        return cellContainer;
      },
    });
    this.mPropGrid.layout();
    this.mPropGrid.on("cell.1tap", (cell: PackageItem) => {
      // const item = cell.getData("item");
      // if (item) {
      this.onSelectItemHandler(cell);
      // }
    });
    this.mCheckBox = new CheckboxGroup();
    this.add(this.mPanel);
    this.mPanel.add([this.mMask, bg, this.mCloseBtn, this.mCounter, this.categoriesBg, this.mPropContainer, this.mCategorieContainer, this.mDiscardBtn]);
    super.init();
    this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
  }

  private refreshData() {
    const minePackage: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_MINING_MODE_QUERY_MINE_PACKAGE = this.data;
    const mineItem = minePackage.items || [];
    const limit = minePackage.limit || 0;
    this.mLimit = minePackage.limit || 0;
    this.mAllItem = [];
    for (const item of mineItem) {
      this.mAllItem.push({ item });
    }
    this.mCounter.setText(`${mineItem.length}/${limit}`);
    this.setCategories(minePackage.categories);
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onSelectedCategory(category: string) {
    // TODO 多语言未适配 全部可能是个其他语言
    // this.mFilterItem = this.mAllItem.filter((item) => item.item.category === ca || ca === "全部");
    this.mFilterItem = [];
    let pkgItem = null;
    for (const item of this.mAllItem) {
      pkgItem = item.item;
      if (pkgItem && (pkgItem.category === category || category === "all")) {
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
    if (this.mDiscardMode) {
      packageItem.switchSelect();
      this.checkMode();
      return;
    }
    if (packageItem) {
      if (!this.mTips.parentContainer) {
        this.mPanel.add(this.mTips);
      }
      this.mTips.setItem(packageItem.item.item);
    } else {
      this.mPanel.remove(this.mTips);
    }
  }

  private onClickCategoryHandler(item: Button) {
    const data = item.getData("data");
    if (data) {
      this.onSelectedCategory(data.key);
    }
  }

  private checkMode() {
    if (!this.mAllItem || this.mAllItem.length < 1) {
      return;
    }
    for (const item of this.mAllItem) {
      if (item.selected) {
        this.mDiscardBtn.switchState(DiscardEnum.Sutmit);
        return;
      }
    }
    this.mDiscardBtn.switchState(DiscardEnum.Cancel);
  }

  private onDiscardSelectedItem() {
    if (!this.mAllItem || this.mAllItem.length < 1) {
      return;
    }
    // const selected = this.mAllItem.filter((item) => item.selected);
    const selected = [];
    for (const item of this.mAllItem) {
      if (item.item && item.selected) {
        selected.push(item.item);
      }
    }
    this.emit("discard", selected);
  }

  private enterDiscardMode() {
    // TODO
    const state = this.mDiscardBtn.buttonState;
    if (state === DiscardEnum.Discard) {
      this.mDiscardMode = true;
      this.mDiscardBtn.switchState(DiscardEnum.Cancel);
    } else if (state === DiscardEnum.Sutmit) {
      this.mDiscardMode = false;
      this.onDiscardSelectedItem();
      this.mDiscardBtn.switchState(DiscardEnum.Discard);
    } else {
      this.mDiscardMode = false;
      this.mDiscardBtn.switchState(DiscardEnum.Discard);
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

    const border = this.scene.make.image({
      key,
      frame: "item_boder.png"
    }, false).setOrigin(0).setScale(zoom);
    this.setSize(border.width * zoom, border.height * zoom);

    this.mItemImage = new DynamicImage(this.scene, 0, 0);
    this.mItemImage.setOrigin(0);
    this.mItemImage.setScale(dpr * zoom);

    this.mCounter = this.scene.make.text({
      x: border.displayWidth - 2 * dpr,
      y: border.displayHeight - 1 * dpr,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 11 * dpr * zoom,
        color: "#6666cc"
      }
    }).setOrigin(1);

    this.mSelectedIcon = this.scene.make.image({
      key,
      frame: "selected_icon.png"
    }, false);
    this.mSelectedIcon.x = border.width - 3 * dpr - this.mSelectedIcon.width / 2;
    this.mSelectedIcon.y = 3 * dpr + this.mSelectedIcon.height / 2;
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
    }
  }

  switchSelect() {
    if (!this.mItem.item) {
      return;
    }
    this.mItem.selected = !this.mItem.selected;
    if (this.mItem.selected) {
      this.add(this.mSelectedIcon);
    } else {
      this.remove(this.mSelectedIcon);
    }
  }

  get item(): IPackageItem {
    return this.mItem;
  }

  private onLoadCompleteHandler() {
    if (this.mItemImage) {
      this.mItemImage.x = this.width - this.mItemImage.displayWidth >> 1;
      this.mItemImage.y = this.height - this.mItemImage.displayHeight >> 1;
    }
  }
}

interface IPackageItem {
  item: op_client.ICountablePackageItem;
  selected?: boolean;
  locked?: boolean;
}

class Tips extends Phaser.GameObjects.Container {
  private mName: Phaser.GameObjects.Text;
  private mDes: Phaser.GameObjects.Text;
  private mDpr: number;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    this.mDpr = dpr;
    const bg = this.scene.make.image({
      key,
      frame: "tips_bg.png"
    }, false);
    this.mName = this.scene.make.text({
      x: -bg.width * zoom / 2 + 6 * dpr * zoom,
      y: -bg.height * zoom / 2 + 6 * dpr * zoom,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr,
        color: "#000000"
      }
    }, false);
    this.mDes = this.scene.make.text({
      x: this.mName.x,
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr,
        color: "#000000"
      }
    }, false).setOrigin(0, 1);
    this.add([bg, this.mName, this.mDes]);
    this.setSize(bg.width * zoom, bg.height * zoom);
  }

  setItem(item: op_client.ICountablePackageItem) {
    if (!item) return;
    const tmpY = this.y;
    const tmpAlpha = this.alpha;
    this.y = tmpY + 100 * this.mDpr;
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      props: {
        alpha: tmpAlpha,
        y: tmpY
      },
      duration: 100
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

  switchState(val: DiscardEnum) {
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
  Sutmit
}
