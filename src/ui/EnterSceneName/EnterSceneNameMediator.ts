import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { EnterSceneNamePanel } from "./EnterSceneNamePanel";

export class EnterSceneNameMediator extends BaseMediator {
  constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, world: WorldService) {
    super();
  }

  show(param?: any) {
    if (this.mView && this.mView.isShow()) {
      return;
    }
    this.mView = new EnterSceneNamePanel(this.scene, this.world);
    this.mView.show(param);
    this.layerManager.addToToolTipsLayer(this.mView);
  }
}
