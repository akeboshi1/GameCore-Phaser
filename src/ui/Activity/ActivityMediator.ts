import { BaseMediator } from "../baseMediator";
import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ActivityPanel } from "./ActivityPanel";

export class ActivityMediator extends BaseMediator {
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
        super(worldService);
    }

    show() {
        if (this.mView && this.mView.isShow() || this.isShowing) {
            return;
        }
        if (!this.mView) {
            this.mView = new ActivityPanel(this.scene, this.world);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    isSceneUI() {
        return true;
    }
}
