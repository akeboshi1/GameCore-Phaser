import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { IconBtn } from "../baseView/mobile/icon.btn";

export class TopGroupContainer extends Panel {
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

  addItem(data: any) {
    if (!this.mShowing) {
      this.show();
    }

    // TODO dynamic load texture
    const iconBtn = new IconBtn(this.scene, this.mWorld, data.key, [], "");
    iconBtn.setMedName(data.name);
    this.add(iconBtn);
    this.mButtons.push(iconBtn);

    if (this.mButtons.length > 3) {
      // TODO add turn button
    }
  }

  removeItem(name: string) {
    const index = this.mButtons.findIndex((icon: IconBtn) => icon.getMedName() === name);
    if (index >= 0) {
      this.mButtons[index].destroy();
      this.mButtons.splice(index, 1);
    }

    if (this.mButtons.length < this.maxNum) {
      // TODO remove turn button
    }

    if (this.mButtons.length === 0) {
      // TODO remove
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
