import { BaseMediator } from "../baseMediator";
import { MineCarPanel } from "./MineCarPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";

export class MineCarMediator extends BaseMediator {

  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
    super(worldService);
  }

  show() {
    if (this.mView && this.mView.isShow() || this.isShowing) {
        return;
    }
    if (!this.mView) {
        this.mView = new MineCarPanel(this.scene, this.world);
    }
    this.mView.show();
    this.mView.on("close", this.onCloseHandler, this);
    this.layerManager.addToUILayer(this.mView);
  }

  isSceneUI() {
    return true;
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
  }
}
