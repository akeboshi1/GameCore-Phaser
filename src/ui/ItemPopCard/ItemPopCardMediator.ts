import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ItemPopCardPanel } from "./ItemPopCardPanel";
import { ILayerManager } from "../layer.manager";

export class ItemPopCardMediator extends BaseMediator {
  protected mView: ItemPopCardPanel;
  private readonly scene: Phaser.Scene;
  private readonly layerManager: ILayerManager;

  constructor($layerManager: ILayerManager, $scene: Phaser.Scene, worldService: WorldService) {
    super(worldService);
    this.scene = $scene;
    this.layerManager = $layerManager;
  }

  public show(param: any) {
    if (this.mView && this.mView.isShow() || this.isShowing) {
      return;
    }
    this.mView = new ItemPopCardPanel(this.scene, this.world);
    this.mView.show(param);
    this.mView.on("close", this.onCloseHandler, this);
    this.layerManager.addToDialogLayer(this.mView);
  }

  private onCloseHandler() {
    this.mView.hide();
    this.mView = undefined;
  }
}
