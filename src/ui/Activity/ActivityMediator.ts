import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ActivityPanel } from "./ActivityPanel";
import { UIType, BaseMediator } from "tooqingui";
export class ActivityMediator extends BaseMediator {
    public static NAME: string = "ActivityMediator";
    private world: WorldService;
    constructor(private layerManager: ILayerManager, private scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.mUIType = UIType.Scene;
        this.world = worldService;
    }

    show() {
        if (this.mView && this.mView.isShow() || this.mShow) {
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
