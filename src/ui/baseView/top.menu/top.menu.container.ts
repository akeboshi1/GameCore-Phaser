import { Panel } from "../../components/panel";
import { IconBtn, IBtnData } from "../icon.btn";
import { WorldService } from "../../../game/world.service";
import { Url } from "../../../utils/resUtil";
import { Logger } from "../../../utils/log";

export class TopMenuContainer extends Panel {
  private readonly maxNum = 3;
  private turnBtn: IconBtn;
  private mButtons: IconBtn[];
  private mExpaned: boolean;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.setTween(false);
    this.mButtons = [];
  }

  resize() {
    const size = this.mWorld.getSize();
    this.x = size.width - 50 * this.mWorld.uiScale;
    this.y = this.height / 2 + 120 * this.mWorld.uiScale;
    this.scale = this.dpr;
    // this.scaleX = this.scaleY = this.mWorld.uiScale;
  }

  show() {
    if (this.mWorld) {
      this.mWorld.uiManager.getUILayerManager().addToUILayer(this);
    }
    super.show();
  }

  hide() {
    if (this.parentContainer) {
      this.parentContainer.remove(this);
    }
  }

  addItem(data: IBtnData) {
    if (!this.mShowing) {
      this.show();
    }

    // TODO dynamic load texture
    const iconBtn = new IconBtn(this.scene, this.mWorld, data);
    iconBtn.setName(data.name);
    iconBtn.y = iconBtn.height >> 1;
    this.add(iconBtn);
    iconBtn.on("click", this.onGameObjectUpHandler, this);
    this.mButtons.push(iconBtn);

    if (this.mButtons.length > 3) {
      // TODO add turn button
    }
    this.refresh();
  }

  removeItem(name: string) {
    const index = this.mButtons.findIndex((icon: IconBtn) => icon.name === name);
    if (index >= 0) {
      this.mButtons[index].destroy();
      this.mButtons.splice(index, 1);
    }

    if (this.mButtons.length < this.maxNum) {
      // TODO remove turn button
    }

    if (this.mButtons.length === 0) {
      // TODO remove
      this.hide();
    }
    this.refresh();
  }

  preload() {
    this.mScene.load.atlas("baseView", Url.getRes("ui/baseView/mainui_mobile.png"), Url.getRes("ui/baseView/mainui_mobile.json"));
    super.preload();
  }

  init() {
    if (this.mInitialized) {
      return;
    }
    super.init();
    // this.addItem({ key: "Turn_Btn_Top", bgResKey: "baseView", bgTextures: ["btnGroup_yellow_normal.png", "btnGroup_yellow_light.png", "btnGroup_yellow_select.png"], iconResKey: "", iconTexture: "btnGroup_top_expand.png", scale: 1 });
    this.resize();
  }

  refresh() {
    for (let i = 0; i < this.mButtons.length; i++) {
      this.mButtons[i].x = -(i * 60 + 30);
    }
  }

  expand() {
  }

  collapse() {
  }

  destroy() {
    this.mButtons.map((btn: IconBtn) => btn.destroy());
    this.mButtons.length = 0;
    super.destroy();
  }

  private onGameObjectUpHandler(btn: IconBtn) {
    switch (btn.name) {
      case "SaveDecorate":
        this.emit("saveDecorate");
        break;
      case "EnterDecorate":
        this.emit("enterDecorate");
        break;
      case "Market":
        this.emit("showMarket");
        break;
    }
  }

}
