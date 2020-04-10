import { WorldService } from "../../game/world.service";
import { Font } from "../../utils/font";
import { op_def } from "pixelpai_proto";
import { DynamicImage } from "../components/dynamic.image";
import { BasePanel } from "../components/BasePanel";

export class MineCarPanel extends BasePanel {
  private readonly key = "mine_car";
  private mPanel: Phaser.GameObjects.Container;
  private mMask: Phaser.GameObjects.Graphics;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mCounter: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
  }

  resize(width: number, height: number) {
    super.resize(width, height);
    this.x = width / 2;
    this.y = height / 2;

    this.mMask.clear();
    this.mMask.fillStyle(0x000000, 0.6);
    this.mMask.fillRect(-width / 2, -height / 2, width, height);
    this.mMask.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    // this.mPanel.y = -

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
  }

  register() {
    if (!this.mInitialized) {
      return;
    }
    this.mCloseBtn.setInteractive();
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
  }

  protected preload() {
    this.addAtlas(this.key, `mine_car/mine_car.png`, `mine_car/mine_car.json`);
    super.preload();
  }

  protected init() {
    this.mPanel = this.scene.make.container(undefined, false);
    this.mMask = this.scene.make.graphics(undefined, false);

    const bg = this.scene.make.image({
      key: this.key,
      frame: "bg.png"
    });
    this.mPanel.setSize(bg.width, bg.height);

    this.mCloseBtn = this.scene.make.image({
      x: 110 * this.dpr,
      y: -125 * this.dpr,
      key: this.key,
      frame: "close_btn.png"
    }, false);

    this.mCounter = this.scene.make.text({
      x: -84 * this.dpr,
      y: bg.height / 2 - 23 * this.dpr,
      text: "25/50",
      style: {
        fontFamily: Font.DEFULT_FONT,
        color: "#FFFFFF",
        fontSize: 14 * this.dpr
      }
    }, false);

    const categoriesBg = this.scene.make.image({
      key: this.key,
      frame: "nav_bg.png"
    });
    categoriesBg.y = -111 * this.dpr + categoriesBg.height / 2;

    this.add(this.mPanel);
    this.mPanel.add([this.mMask, bg, this.mCloseBtn, this.mCounter, categoriesBg]);
    super.init();
    this.resize(this.scene.cameras.main.width, this.scene.cameras.main.height);

    this.register();
  }

  private onCloseHandler() {
    this.emit("close");
  }
}

class Item extends Phaser.GameObjects.Container {
  private mItem: DynamicImage;
  private mCounter: Phaser.GameObjects.Text;
  private mLockImg: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, key: string, dpr: number) {
    super(scene);

    const border = this.scene.make.image({
      key,
      frame: "border.png"
    }, false);

    this.mItem = new DynamicImage(this.scene, 0, 0);
    this.add([border, this.mItem, this.mCounter]);
  }

  setItem(data: any) {
  }
}
