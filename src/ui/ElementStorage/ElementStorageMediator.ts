import {BaseMediator} from "../baseMediator";
import {WorldService} from "../../game/world.service";
import {ElementStoragePanel} from "./ElementStoragePanel";
import {ILayerManager} from "../layer.manager";

export class ElementStorageMediator extends BaseMediator {
    private mLayerManager: ILayerManager;
    private mScene: Phaser.Scene;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene, world: WorldService) {
        super(world);
    }

    show(param?: any): void {
        if (this.mView && this.mView.isShow() || this.isShowing) {
            return;
        }
        this.mView = new ElementStoragePanel(this.mScene);
        this.mLayerManager.addToUILayer(this.mView);
        this.mView.show(param);
        super.show(param);
    }
}
