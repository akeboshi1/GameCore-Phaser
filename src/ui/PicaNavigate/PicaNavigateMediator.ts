import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaNavigatePanel } from "./PicaNavigatePanel";
import { PicaChatMediator } from "../PicaChat/PicaChatMediator";

export class PicaNavigateMediator extends BaseMediator {
    private scene: Phaser.Scene;
    constructor(
        private layerManager: ILayerManager,
        scene: Phaser.Scene,
        worldService: WorldService
    ) {
        super(worldService);
        this.scene = this.layerManager.scene;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.isShowing) {
            this.mView.show();
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        if (!this.mView) {
            this.mView = new PicaNavigatePanel(this.scene, this.world);
            this.mView.on("showPanel", this.onShowPanelHandler, this);
            this.mView.on("close", this.onCloseHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
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
        (<PicaNavigatePanel> this.mView).removeListen();
        this.layerManager.removeToUILayer(this.mView);
      }
    }

    private onShowPanelHandler(panel: string) {
      if (!panel || !this.world) {
        return;
      }
      const uiManager = this.world.uiManager;
      uiManager.showMed(panel);
    }
}
