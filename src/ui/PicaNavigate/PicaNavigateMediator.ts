import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaNavigatePanel } from "./PicaNavigatePanel";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class PicaNavigateMediator extends BaseMediator {
  public static NAME: string = "PicaNavigateMediator";
  private scene: Phaser.Scene;
  private world: WorldService;
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
      this.layerManager.addToUILayer(this.mView.view);
      return;
    }
    if (!this.mView) {
      this.mView = new PicaNavigatePanel(this.scene, this.world);
      this.mView.on("showPanel", this.onShowPanelHandler, this);
      this.mView.on("close", this.onCloseHandler, this);
    }
    this.mView.show();
    this.layerManager.addToUILayer(this.mView.view);
  }

  isSceneUI() {
    return false;
  }

  private onCloseHandler() {
    if (!this.world) {
      return;
    }
    const uiManager = this.world.uiManager;
    const mediator = uiManager.getMediator(PicaChatMediator.name);
    if (mediator) {
      mediator.show();
      this.mView.hide();
      (<PicaNavigatePanel>this.mView).removeListen();
      this.layerManager.removeToUILayer(this.mView.view);
    }
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
}
