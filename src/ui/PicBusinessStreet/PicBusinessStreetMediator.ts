import { ILayerManager } from "../layer.manager";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import PicBusinessStreetPanel from "./PicBusinessStreetPanel";
import { PicBusinessStreet } from "./PicBusinessStreet";

export class PicBusinessStreetMediator extends BaseMediator {
    protected mView: PicBusinessStreetPanel;
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private picStreet: PicBusinessStreet;
    private world: WorldService;
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
            this.mView = new PicBusinessStreetPanel(this.scene, this.world);
            this.mView.on("hide", this.onHidePanel, this);
        }
        if (!this.picStreet) {
            this.picStreet = new PicBusinessStreet(this.world);
            this.picStreet.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    destroy() {
        if (this.picStreet) {
            this.picStreet.destroy();
            this.picStreet = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }

    private onHidePanel() {
        this.destroy();
    }
}
