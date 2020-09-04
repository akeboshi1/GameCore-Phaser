import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { PicOrderPanel } from "./PicOrderPanel";
import { PicOrder } from "./PicOrder";
export class PicOrderMediator extends BaseMediator {
    protected mView: PicOrderPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picOrder: PicOrder;
    constructor(layerMgr: ILayerManager, scene: Phaser.Scene, worldService: WorldService) {
        super();
        this.scene = scene;
        this.layerMgr = layerMgr;
        this.world = worldService;
    }

    show() {
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            return;
        }
        if (!this.mView) {
            this.mView = new PicOrderPanel(this.scene, this.world);
            this.mView.on("hide", this.onHideView, this);
        }
        if (!this.picOrder) {
            this.picOrder = new PicOrder(this.world);
            this.picOrder.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    isSceneUI() {
        return true;
    }

    destroy() {
        if (this.picOrder) {
            this.picOrder.destroy();
            this.picOrder = undefined;
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
