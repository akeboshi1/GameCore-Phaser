import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { ComposePanel } from "./ComposePanel";
import { op_client } from "pixelpai_proto";
import { Compose } from "./Compose";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";

export class ComposeMediator extends BaseMediator {
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private Compose: Compose;
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
            this.mView = new ComposePanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.Compose) {
            this.Compose = new Compose(this.world);
            this.Compose.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.Compose) {
            this.Compose.destroy();
            this.Compose = undefined;
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
