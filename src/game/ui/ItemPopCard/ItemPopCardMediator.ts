import { WorldService } from "../../game/world.service";
import { ItemPopCardPanel } from "./ItemPopCardPanel";
import { ILayerManager } from "../layer.manager";
import { BaseMediator } from "apowophaserui";

export class ItemPopCardMediator extends BaseMediator {
  protected mView: ItemPopCardPanel;
  private readonly scene: Phaser.Scene;
  private readonly layerManager: ILayerManager;
  private world: WorldService;
  constructor($layerManager: ILayerManager, $scene: Phaser.Scene, worldService: WorldService) {
    super();
    this.scene = $scene;
    this.world = worldService;
    this.layerManager = $layerManager;
  }

  public show(param: any) {
    if (this.mView && this.mView.isShow() || this.mShow) {
      return;
    }
    this.mView = new ItemPopCardPanel(this.scene, this.world);
    this.mView.show(param);
    this.mView.on("close", this.onCloseHandler, this);
    this.layerManager.addToDialogLayer(this.mView);
  }

  private onCloseHandler() {
    if (!this.mView) return;
    this.mView.hide();
    this.mView = undefined;
  }
}
