import { WorldService } from "../../game/world.service";
import { ILayerManager } from "../layer.manager";
import { ActivityPanel } from "./ActivityPanel";
import { UIType } from "../../../lib/rexui/lib/ui/interface/baseUI/UIType";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

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
            this.mView.on("showPanel", this.onShowPanelHandler, this);
        }
        this.mView.show();
        this.layerManager.addToUILayer(this.mView);
    }

    isSceneUI() {
        return true;
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
