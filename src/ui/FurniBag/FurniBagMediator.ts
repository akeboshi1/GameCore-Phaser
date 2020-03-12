import { BaseMediator } from "../baseMediator";
import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PicaNavigateMediator } from "../PicaNavigate/PicaNavigateMediator";
import { FurniBagPanel } from "./FurniBagPanel";

export class FurniBagMediator extends BaseMediator {
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
            this.mView = new FurniBagPanel(this.scene, this.world);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    isSceneUI() {
        return true;
    }
}
