import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";

export class PicaNavigatePanel extends BasePanel {
  private readonly key: string = "pica_navigate";
  private mBackground: Phaser.GameObjects.Image;
  private mMapBtn: Phaser.GameObjects.Image;
  private mShopBtn: Phaser.GameObjects.Image;
  private mBagBtn: Phaser.GameObjects.Image;
  private mFamilyBtn: Phaser.GameObjects.Image;
  private mCloseBtn: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
  }

  resize(w: number, h: number) {
    this.setSize(w, h);
    const height = this.scene.cameras.main.height;
    const frame = this.scene.textures.getFrame(this.key, "bg.png");
    const scaleRatio = (w / frame.width) * this.scale;
    this.mBackground.scaleX = scaleRatio;
    this.mBackground.x = w / 2;
    this.mBackground.setInteractive();

    this.mCloseBtn.x = w - this.mCloseBtn.width / 2 - 10 * this.dpr;

    this.y = height - this.height / 2 * this.scale;
    super.resize(w, h);
  }

  public addListen() {
    if (!this.mInitialized) return;
    this.mMapBtn.on("pointerup", this.onShowMapHandler, this);
    this.mShopBtn.on("pointerup", this.onShowShopHandler, this);
    this.mBagBtn.on("pointerup", this.onShowBagHandler, this);
    this.mFamilyBtn.on("pointerup", this.onShowFamilyHandler, this);
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mMapBtn.off("pointerup", this.onShowMapHandler, this);
    this.mShopBtn.off("pointerup", this.onShowShopHandler, this);
    this.mBagBtn.off("pointerup", this.onShowBagHandler, this);
    this.mFamilyBtn.off("pointerup", this.onShowFamilyHandler, this);
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
  }

  public hide() {
    this.mShow = false;
  }

  protected preload() {
    this.addAtlas(this.key, "pica_navigate/pica_navigate.png", "pica_navigate/pica_navigate.json");
    super.preload();
  }

  protected init() {
    this.mBackground = this.createImage(this.key, "bg.png");
    this.mBackground.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.mMapBtn = this.createImage(this.key, "map_btn.png").setInteractive();
    this.mShopBtn = this.createImage(this.key, "shop_btn.png").setInteractive();
    this.mBagBtn = this.createImage(this.key, "bag_btn.png").setInteractive();
    this.mFamilyBtn = this.createImage(this.key, "family_btn.png").setInteractive();
    this.mCloseBtn = this.createImage(this.key, "close_btn.png").setInteractive();
    const list = [this.mMapBtn, this.mMapBtn, this.mShopBtn, this.mBagBtn, this.mFamilyBtn];
    this.add([this.mBackground]);
    this.add(list);
    this.add(this.mCloseBtn);

    for (let i = 0; i < list.length; i++) {
      list[i].x = i * 50 * this.dpr - list[i].width / 2;
    }
    super.init();
    this.resize(this.mScene.cameras.main.width / this.scale, this.mBackground.height);
  }

  private createImage(key: string, frame: string) {
    return this.scene.make.image({
      key,
      frame
    }, false);
  }

  private onShowMapHandler() {
    this.emit("showPanel", "PicaRoomList");
  }

  private onShowShopHandler() {
    this.emit("showPanel", "Market");

  }

  private onShowBagHandler() {
    this.emit("showPanel", "FurniBag");
  }

  private onShowFamilyHandler() {
    this.emit("showPanel", "");
  }

  private onCloseHandler() {
    this.emit("close");
  }
}
