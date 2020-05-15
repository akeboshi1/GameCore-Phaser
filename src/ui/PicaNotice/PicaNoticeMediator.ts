import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicaNoticePanel } from "./PicaNoticePanel";

export class PicaNoticeMediator extends BaseMediator {
  private world: WorldService;
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, world: WorldService) {
    super();
    this.world = world;
  }

  show(param?: any) {
    if (this.mView && this.mView.isShow()) {
      return;
    }
    this.mView = new PicaNoticePanel(this.scene, this.world);
    this.mView.once("close", this.onCloseHandler, this);
    this.mView.show(param);
    // this.layerManager.addToToolTipsLayer(this.mView.view);
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
  }
}