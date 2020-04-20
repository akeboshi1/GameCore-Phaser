import { MineCarPanel } from "./MineCarPanel";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class MineCarMediator extends BaseMediator {
  private world: WorldService;
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
    super();
    this.world = worldService;
  }

  show() {
    if (this.mView && this.mView.isShow() || this.mShow) {
      return;
    }
    if (!this.mView) {
      this.mView = new MineCarPanel(this.scene, this.world);
    }
    this.mView.show();
    this.mView.on("close", this.onCloseHandler, this);
    this.layerManager.addToUILayer(this.mView.view);
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
