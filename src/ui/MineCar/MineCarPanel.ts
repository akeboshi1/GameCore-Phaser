import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BasePanel } from "../components/BasePanel";
import GridTable from "../../../lib/rexui/lib/ui/gridtable/GridTable";
import { Button } from "../components/button";
import { Logger } from "../../utils/log";
import { CheckboxGroup } from "../components/checkbox.group";

export class MineCarPanel extends BasePanel {
  private readonly key = "mine_car";
  private mPanel: Phaser.GameObjects.Container;
  private mMask: Phaser.GameObjects.Graphics;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mCounter: Phaser.GameObjects.Text;
  private mPropGrid: GridTable;
  private mPropContainer: Phaser.GameObjects.Container;
  private mCategorieContainer: Phaser.GameObjects.Container;
  private mHelpBtn: Phaser.GameObjects.Image;
  private mTips: Tips;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    this.scale = 1;
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
    this.mPropContainer.y = -this.mPropGrid.y;

    this.setSize(width, height);
    // this.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
  }

  setCategories(subcategorys: op_def.IStrMap[]) {
    subcategorys = [
      {key: "all", value: "全部"},
      {key: "矿石", value: "矿石"},
      {key: "宝石", value: "宝石"},
      {key: "化石", value: "化石"},
      {key: "杂物", value: "杂物"}];
    const items = [];
    const zoom = this.mWorld.uiScaleNew;
    const frame = this.scene.textures.getFrame(this.key, "nav_btn_normal.png").width * zoom;
    const gap = (this.mCategorieContainer.width - frame / 2 - subcategorys.length * frame) / ((subcategorys.length - 1));
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
      item.x = i * (item.displayWidth + gap * this.dpr) + item.displayWidth / 2 - this.mCategorieContainer.width / 2;
      item.y = (this.mCategorieContainer.height - item.displayHeight) / 2;
      items.push(item);
    }

    const checkbox = new CheckboxGroup();
    checkbox.appendItemAll(items);
    checkbox.on("selected", this.onClickCategoryHandler, this);
    this.mCategorieContainer.add(items);
  }

  register() {
    if (!this.mInitialized) {
      return;
    }
    this.mCloseBtn.setInteractive();
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
  }

  setProp() {

  }

  destroy() {
    if (this.mPropGrid) {
      this.mPropGrid.destroy();
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

    this.mCategorieContainer = this.scene.make.container(undefined, false);
    const categoriesBg = this.scene.make.image({
      key: this.key,
      frame: "nav_bg.png"
    }).setScale(zoom);
    categoriesBg.y = -111 * this.dpr * zoom + categoriesBg.height * zoom / 2;
    this.mCategorieContainer.setSize(categoriesBg.displayWidth, categoriesBg.displayHeight);
    // this.mCategorieContainer.x = -categoriesBg.width / 2;
    this.mCategorieContainer.y = categoriesBg.y;

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
          cellContainer = new Item(scene, this.key, this.dpr, zoom);
          this.mPropContainer.add(cellContainer);
        }
        cellContainer.setData({ item });
        cellContainer.setProp(item);
        return cellContainer;
      },
    });
    this.mPropGrid.layout();
    this.mPropGrid.on("cell.1tap", (cell) => {
      const item = cell.getData("item");
      if (item) {
        this.onSelectItemHandler(item);
      }
    });
    this.mHelpBtn = this.scene.make.image({
      x: this.mCounter.x + this.mCounter.width + 14 * this.dpr,
      y: this.mCounter.y,
      key: this.key,
      frame: "help.png"
    }, false).setOrigin(0).setScale(zoom);

    this.add(this.mPanel);
    this.mPanel.add([this.mMask, bg, this.mCloseBtn, this.mTips, this.mCounter, categoriesBg, this.mCategorieContainer, this.mPropContainer, this.mHelpBtn]);
    super.init();
    this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);
    const items = new Array(50).fill({item: "", locked: true});
    this.mPropGrid.setItems(items);

    this.setCategories([]);

    this.register();
  }

  private onCloseHandler() {
    this.emit("close");
  }

  private onSelectItemHandler(item: Item) {

  }

  private onClickCategoryHandler() {
    Logger.getInstance().log("clicked");
  }
}

class Item extends Phaser.GameObjects.Container {
  private mItem: DynamicImage;
  private mCounter: Phaser.GameObjects.Text;
  private mLockImg: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number) {
    super(scene);

    const border = this.scene.make.image({
      key,
      frame: "item_boder.png"
    }, false).setOrigin(0).setScale(zoom);
    this.setSize(border.width * zoom, border.height * zoom);

    this.mItem = new DynamicImage(this.scene, 0, 0);

    this.mLockImg = this.scene.make.image({
      x: border.width * zoom / 2,
      y: border.height * zoom / 2,
      key,
      frame: "lock.png"
    }, false).setScale(zoom);
    this.add([border, this.mItem]);
  }

  setProp(data: any) {
    if (data.locked) {
      this.add(this.mLockImg);
    } else {
      this.remove(this.mLockImg);
    }
  }
}

class Tips extends Phaser.GameObjects.Container {
  private mName: Phaser.GameObjects.Text;
  private mDes: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, key: string, dpr: number, zoom: number = 1) {
    super(scene);
    const bg = this.scene.make.image({
      key,
      frame: "tips_bg.png"
    }, false);
    this.mName = this.scene.make.text({
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr,
        colof: "#2d3a56"
      }
    }, false);
    this.mDes = this.scene.make.text({
      style: {
        fontFamily: Font.DEFULT_FONT,
        fontSize: 14 * dpr,
        color: "#4e4b4b"
      }
    }, false);
    this.add([bg, this.mName, this.mDes]);
    this.setSize(bg.width * zoom, bg.height * zoom);
  }

  setItem() {

  }
}
