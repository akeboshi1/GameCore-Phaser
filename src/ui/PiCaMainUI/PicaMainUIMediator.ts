import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { PicaMainUIPanel } from "./PicaMainUIPanel";

export class PicaMainUIMediator extends BaseMediator {
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
        super(worldService);
    }

    show() {
        if (this.mView && this.mView.isShow() || this.isShowing) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicaMainUIPanel(this.scene, this.world);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    isSceneUI() {
        return true;
    }
}
