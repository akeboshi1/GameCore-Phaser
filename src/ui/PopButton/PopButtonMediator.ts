import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { PopButtonPanel } from "./PopButtonPanel";
import { op_client } from "pixelpai_proto";
import { PopButton } from "./PopButton";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class PopButtonMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private popButton: PopButton;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if (this.mView) {
            return;
        }
        if (!this.mView) {
            this.mView = new PopButtonPanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.popButton) {
            this.popButton = new PopButton(this.world);
            this.popButton.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.popButton) {
            this.popButton.destroy();
            this.popButton = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHideView() {
        this.destroy();
    }

}
