import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { op_def } from "pixelpai_proto";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";
import { i18n } from "../../i18n";
import { UIAtlasKey, UIAtlasName } from "../ui.atals.name";
export class PicaNavigatePanel extends BasePanel {
  private readonly key: string = "pica_navigate";
  private readonly key_lang: string = "key_lang";
  private mBackground: Phaser.GameObjects.Image;
  private mMapBtn: Phaser.GameObjects.Image;
  private mShopBtn: Phaser.GameObjects.Image;
  private mBagBtn: Phaser.GameObjects.Image;
  private mFamilyBtn: Phaser.GameObjects.Image;
  private mGoHomeBtn: Phaser.GameObjects.Image;
  private mCloseBtn: Phaser.GameObjects.Image;
  private mTestBtn: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.UIType = UIType.Scene;
    this.setTween(false);
    this.setInteractive();
  }

  resize(w: number, h: number) {
    this.setSize(w, h);
    const zoom = this.scale;
    const width = this.scene.cameras.main.width / zoom;
    const height = this.scene.cameras.main.height;
    const frame = this.scene.textures.getFrame(UIAtlasKey.commonKey, "menu_bg");
    const scaleRatio = width / frame.width * this.dpr;
    this.mBackground.scaleX = scaleRatio;
    this.mBackground.x = width / 2;
    this.mBackground.setInteractive();
    this.mCloseBtn.x = width - this.mCloseBtn.width / 2 - 3 * this.dpr;
    this.mGoHomeBtn.x = this.mCloseBtn.x - this.mCloseBtn.width * 0.5 - this.mGoHomeBtn.width * 0.5 - 10 * this.dpr;

    this.y = height - this.height / 2;
    super.resize(w, h);
  }

  public addListen() {
    if (!this.mInitialized || !this.interactiveBoo) return;
    this.mMapBtn.on("pointerup", this.onShowMapHandler, this);
    this.mShopBtn.on("pointerup", this.onShowShopHandler, this);
    this.mBagBtn.on("pointerup", this.onShowBagHandler, this);
    this.mFamilyBtn.on("pointerup", this.onShowFamilyHandler, this);
    this.mGoHomeBtn.on("pointerup", this.onShowGoHomeHandler, this);
    this.mTestBtn.on("pointerup", this.onShowTestHandler, this);
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mMapBtn.off("pointerup", this.onShowMapHandler, this);
    this.mShopBtn.off("pointerup", this.onShowShopHandler, this);
    this.mBagBtn.off("pointerup", this.onShowBagHandler, this);
    this.mFamilyBtn.off("pointerup", this.onShowFamilyHandler, this);
    this.mGoHomeBtn.on("pointerup", this.onShowGoHomeHandler, this);
    this.mTestBtn.on("pointerup", this.onShowTestHandler, this);
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
  }

  public hide() {
    this.mShow = false;
  }

  show(param?: any) {
    super.show(param);
    this.checkUpdateActive();
  }
  updateUIState(active?: op_pkt_def.IPKT_UI) {
    if (!this.mInitialized) {
      return;
    }
    if (active.name === "picanavigate.mapbtn") {
      this.mMapBtn.visible = active.visible;
      if (!active.disabled) this.mMapBtn.setInteractive();
      else this.mMapBtn.removeInteractive();
    }
    if (active.name === "picanavigate.marketbtn") {
      this.mShopBtn.visible = active.visible;
      if (!active.disabled) this.mShopBtn.setInteractive();
      else this.mShopBtn.removeInteractive();
    }
    if (active.name === "picanavigate.bagbtn") {
      this.mBagBtn.visible = active.visible;
      if (!active.disabled) this.mBagBtn.setInteractive();
      else this.mBagBtn.removeInteractive();
    }
    if (active.name === "picanavigate.gohomebtn") {
      this.mGoHomeBtn.visible = active.visible;
      if (!active.disabled) this.mGoHomeBtn.setInteractive();
      else this.mGoHomeBtn.removeInteractive();
    }
  }
  protected preload() {
    this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
    let lang = "cn";
    if (i18n.language !== "zh-CN") {
      lang = "en";
    }
    this.addAtlas(this.key_lang, "pica_navigate/pica_navigate" + `_${lang}.png`, "pica_navigate/pica_navigate" + `_${lang}.json`);
    super.preload();
  }

  protected init() {
    this.mBackground = this.createImage(UIAtlasKey.commonKey, "menu_bg");
    this.mBackground.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mMapBtn = this.createImage(this.key_lang, "map_btn").setInteractive();
    this.mShopBtn = this.createImage(this.key_lang, "shop_btn").setInteractive();
    this.mBagBtn = this.createImage(this.key_lang, "bag_btn").setInteractive();
    this.mFamilyBtn = this.createImage(this.key_lang, "family_btn").setInteractive();
    this.mGoHomeBtn = this.createImage(this.key_lang, "home_btn").setInteractive();
    this.mTestBtn = this.createImage(this.key_lang, "family_btn").setInteractive();
    this.mCloseBtn = this.createImage(UIAtlasKey.commonKey, "close_1").setInteractive();
    const list = [this.mMapBtn, this.mMapBtn, this.mShopBtn, this.mBagBtn,this.mTestBtn,this.mGoHomeBtn];
    this.add([this.mBackground]);
    this.add(list);
    this.add(this.mCloseBtn);
    for (let i = 0; i < list.length; i++) {
      list[i].x = i * 50 * this.dpr - list[i].width / 2;
    }
    const zoom = this.scale;
    this.resize(this.mBackground.width * zoom, this.mBackground.height * zoom);
    super.init();
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
    this.emit("showPanel", "CharacterInfo");
  }
  private onShowGoHomeHandler() {
    this.emit("goHome");
  }
  private onShowTestHandler() {
  }
  private onCloseHandler() {
    this.emit("close");
  }
  private checkUpdateActive() {
    const arr = this.mWorld.uiManager.getActiveUIData("PicHandheld");
    if (arr) {
      for (const data of arr) {
        this.updateUIState(data);
      }
    }

  }
}
