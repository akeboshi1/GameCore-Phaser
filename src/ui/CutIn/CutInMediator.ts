import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { CutInPanel } from "./CutInPanel";

export class CutInMediator extends BaseMediator {
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, world: WorldService) {
    super(world);
  }

  show(param?: any) {
    if (this.mView && this.mView.isShow()) {
      return;
    }
    this.mView = new CutInPanel(this.scene, this.world);
    this.mView.once("close", this.onCloseHandler, this);
    this.mView.show(param);
    this.layerManager.addToToolTipsLayer(this.mView);
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
  }
}
