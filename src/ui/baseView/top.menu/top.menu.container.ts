import { Panel } from "../../components/panel";
import { IconBtn, IBtnData } from "../icon.btn";
import { WorldService } from "../../../game/world.service";

export class TopMenuContainer extends Panel {
  private readonly maxNum = 3;
  private turnBtn: IconBtn;
  private mButtons: IconBtn[];
  private mExpaned: boolean;
  constructor(scene: Phaser.Scene, world: WorldService) {
    super(scene, world);
    this.mButtons = [];
  }

  resize() {

  }

  show() {
    if (this.mWorld) {
      this.mWorld.uiManager.getUILayerManager().addToUILayer(this);
    }
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
    this.add(iconBtn);
    this.mButtons.push(iconBtn);

    if (this.mButtons.length > 3) {
      // TODO add turn button
    }
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
  }

  refresh() {
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

}