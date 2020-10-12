import { ILayerManager } from "../Layer.manager";
import { PicaNavigatePanel } from "./PicaNavigatePanel";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { PicaNavigate } from "./PicaNavigate";
import { PicHandheldMediator } from "../PicHandheld/PicHandheldMediator";
import { BaseMediator } from "apowophaserui";
import { WorldService } from "../../world.service";

export class PicaNavigateMediator extends BaseMediator {
  public static NAME: string = "PicaNavigateMediator";
  private scene: Phaser.Scene;
  private world: WorldService;
  private picaNa: PicaNavigate;
  constructor(
    private layerManager: ILayerManager,
    scene: Phaser.Scene,
    worldService: WorldService
  ) {
    super();
    this.world = worldService;
    this.scene = this.layerManager.scene;
  }

  show() {
    if ((this.mView && this.mView.isShow()) || this.mShow) {
      this.mView.show();
      this.layerManager.addToUILayer(this.mView);
      return;
    }
    if (!this.mView) {
      this.mView = new PicaNavigatePanel(this.scene, this.world);
      this.mView.on("showPanel", this.onShowPanelHandler, this);
      this.mView.on("close", this.onCloseHandler, this);
      this.mView.on("goHome", this.onGomeHomeHandler, this);
    }
    if (!this.picaNa) {
      this.picaNa = new PicaNavigate(this.world);
    }
    this.mView.show();
    this.layerManager.addToUILayer(this.mView);
  }

  isSceneUI() {
    return false;
  }

  destroy() {
    if (this.picaNa) {
      this.picaNa.destroy();
      this.picaNa = undefined;
    }
    super.destroy();
  }

  private onCloseHandler() {
    if (!this.world) {
      return;
    }
    const uiManager = this.world.uiManager;
    uiManager.showExistMed(PicaChatMediator.name, "");
    uiManager.showExistMed(PicHandheldMediator.name, "");
    this.destroy();
  }

  private onShowPanelHandler(panel: string, data?: any) {
    if (!panel || !this.world) {
      return;
    }
    const uiManager = this.world.uiManager;
    if (data)
      uiManager.showMed(panel, data);
    else uiManager.showMed(panel);
  }
  private onGomeHomeHandler() {
    this.picaNa.queryGOHomeHandler();
  }
}