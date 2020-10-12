import { ILayerManager } from "../Layer.manager";
import { PicaNoticePanel } from "./PicaNoticePanel";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";

export class PicaNoticeMediator extends BaseMediator {
  private world: WorldService;
  private panelQueue: any[] = [];
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, world: WorldService) {
    super();
    this.world = world;
  }

  show(param?: any) {
    const view = new PicaNoticePanel(this.scene, this.world);
    view.once("close", this.onCloseHandler, this);
    if (this.mView) {
      const obj = { param, view };
      this.panelQueue.push(obj);
    } else {
      this.mView = view;
      this.mView.show(param);
    }
    // this.layerManager.addToToolTipsLayer(this.mView.view);
  }

  private onCloseHandler() {
    if (this.mView) {
      this.mView.destroy();
      this.mView = undefined;
    }
    if (this.panelQueue.length > 0) {
      const obj = this.panelQueue.shift();
      obj.view.show(obj.param);
    }
  }
}