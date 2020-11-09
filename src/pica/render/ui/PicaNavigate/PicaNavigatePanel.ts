import { UIType } from "apowophaserui";
import { BasePanel, UiManager } from "gamecoreRender";
import { UIAtlasKey, UIAtlasName } from "picaRes";
import { ModuleName } from "structure";
import { i18n } from "utils";
export class PicaNavigatePanel extends BasePanel {
  private readonly key_lang: string = "key_lang";
  private mBackground: Phaser.GameObjects.Image;
  private mMapBtn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private mShopBtn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private mBagBtn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private mFamilyBtn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private mGoHomeBtn: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private mCloseBtn: Phaser.GameObjects.Image;
  constructor(uiManager: UiManager) {
    super(uiManager.scene, uiManager.render);
    this.key = ModuleName.PICANAVIGATE_NAME;
    this.UIType = UIType.Scene;
    this.setTween(false);
    this.setInteractive();
  }

  resize(w: number, h: number) {
    const zoom = this.scale;
    w = w ? w : this.mBackground.width * zoom;
    h = h ? h : this.mBackground.height * zoom;
    this.setSize(w, h);
    const width = this.scene.cameras.main.width / zoom;
    const height = this.scene.cameras.main.height;
    const frame = this.scene.textures.getFrame(UIAtlasKey.commonKey, "menu_bg");
    const scaleRatio = width / frame.width * this.dpr;
    this.mBackground.scaleX = scaleRatio;
    this.mBackground.x = width / 2;
    this.mBackground.setInteractive();
    this.mCloseBtn.x = width - this.mCloseBtn.width / 2 - 3 * this.dpr;
    this.mGoHomeBtn.x = this.mCloseBtn.x - this.mCloseBtn.width * 0.5 - this.mGoHomeBtn.width * 0.5 - 24 * this.dpr;

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
    this.mCloseBtn.on("pointerup", this.onCloseHandler, this);
  }

  public removeListen() {
    if (!this.mInitialized) return;
    this.mMapBtn.off("pointerup", this.onShowMapHandler, this);
    this.mShopBtn.off("pointerup", this.onShowShopHandler, this);
    this.mBagBtn.off("pointerup", this.onShowBagHandler, this);
    this.mFamilyBtn.off("pointerup", this.onShowFamilyHandler, this);
    this.mGoHomeBtn.on("pointerup", this.onShowGoHomeHandler, this);
    this.mCloseBtn.off("pointerup", this.onCloseHandler, this);
  }

  public hide() {
    this.mShow = false;
  }

  show(param?: any) {
    super.show(param);
    this.checkUpdateActive();
  }
  updateUIState(active?: any) {// op_pkt_def.IPKT_UI
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
  public get isZh_CN() {
    if (i18n.language !== "zh-CN") {
      return false;
    }
    return true;
  }
  protected preload() {
    this.addAtlas(UIAtlasKey.commonKey, UIAtlasName.commonUrl + ".png", UIAtlasName.commonUrl + ".json");
    let lang = "cn";
    if (!this.isZh_CN) {
      lang = "en";
    }
    this.addAtlas(this.key_lang, "pica_navigate/pica_navigate" + `_${lang}.png`, "pica_navigate/pica_navigate" + `_${lang}.json`);
    super.preload();
  }

  protected init() {
    this.mBackground = this.createImage(UIAtlasKey.commonKey, "menu_bg");
    this.mBackground.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    this.mMapBtn = this.createButton(this.key_lang, "map_btn");
    this.mShopBtn = this.createButton(this.key_lang, "shop_btn");
    this.mBagBtn = this.createButton(this.key_lang, "bag_btn");
    this.mFamilyBtn = this.createButton(this.key_lang, "family_btn");
    this.mGoHomeBtn = this.createImage(this.key_lang, "home_btn").setInteractive();
    this.mCloseBtn = this.createImage(UIAtlasKey.commonKey, "close_1").setInteractive();
    const list = [this.mMapBtn, this.mShopBtn, this.mBagBtn, this.mFamilyBtn, this.mGoHomeBtn];
    this.add([this.mBackground]);
    this.add(list);
    this.add(this.mCloseBtn);
    let preItem: Phaser.GameObjects.Image;
    for (let i = 0; i < list.length; i++) {
      if (i === 0) {
        list[i].x = 10.33 * this.dpr + list[i].width * 0.5;
      } else {
        preItem = list[i - 1];
        list[i].x = preItem.x + 12 * this.dpr + (list[i].width + preItem.width) * 0.5;
        // pad = list[i].width * 0.5;
      }
      // list[i].x = i * 50 * this.dpr + list[i].width * 0.5 + pad;
    }
    const zoom = this.scale;
    this.resize(this.mBackground.width * zoom, this.mBackground.height * zoom);
    super.init();
  }

  private createButton(key: string, frame: string) {
    let button: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
    if (this.isZh_CN) button = this.createImage(key, frame);
    else button = this.createSprite(key, frame);
    button.setInteractive();
    return button;
  }
  private createImage(key: string, frame: string) {
    return this.scene.make.image({
      key,
      frame
    }, false);
  }

  private createSprite(key: string, frame: string) {
    const sprite = this.scene.make.sprite({ key: this.key_lang, frame: frame + "_1" });
    this.scene.anims.create({ key: frame, frames: this.scene.anims.generateFrameNames(this.key_lang, { prefix: frame + "_", frames: [1, 3] }), duration: 500, repeat: -1 });
    sprite.play(frame);
    return sprite;
  }

  private onShowMapHandler() {
    this.render.renderEmitter("showPanel", "PicPartyList");
  }

  private onShowShopHandler() {
    this.render.renderEmitter("showPanel", "Market");
  }

  private onShowBagHandler() {
    this.render.renderEmitter("showPanel", "FurniBag");
  }

  private onShowFamilyHandler() {
    this.render.renderEmitter("showPanel", "PicManorList");
  }

  private onShowGoHomeHandler() {
    this.render.renderEmitter("goHome");
  }

  private onCloseHandler() {
    this.render.renderEmitter("close");
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
