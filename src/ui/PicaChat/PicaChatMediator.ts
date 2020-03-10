import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaChatPanel } from "./PicaChatPanel";
import { PicaNavigateMediator } from "../PicaNavigate/PicaNavigateMediator";

export class PicaChatMediator extends BaseMediator {
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
            this.layerManager.addToUILayer(this.mView);
            return;
        }
        if (!this.mView) {
            this.mView = new PicaChatPanel(this.scene, this.world);
            this.mView.on("showNavigate", this.onShowNavigateHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    isSceneUI() {
        return true;
    }

    private onShowNavigateHandler() {
        if (!this.world) {
            return;
        }
        const uiManager = this.world.uiManager;
        const mediator = uiManager.getMediator(PicaNavigateMediator.name);
        if (mediator) {
            mediator.show();
            this.layerManager.removeToUILayer(this.mView);
        }
    }
}
