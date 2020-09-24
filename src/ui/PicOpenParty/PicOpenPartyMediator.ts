import { ILayerManager } from "../layer.manager";
import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "apowophaserui";
import { PicOpenPartyPanel } from "./PicOpenPartyPanel";
import { PicOpenParty } from "./PicOpenParty";
export class PicOpenPartyMediator extends BaseMediator {
    protected mView: PicOpenPartyPanel;
    private scene: Phaser.Scene;
    private world: WorldService;
    private layerMgr: ILayerManager;
    private picOrder: PicOpenParty;
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
            this.mView = new PicOpenPartyPanel(this.scene, this.world);
            this.mView.on("close", this.onCloseHandler, this);
        }
        if (!this.picOrder) {
            this.picOrder = new PicOpenParty(this.world);
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
        super.destroy();
    }
    get playerData() {
        if (this.world.playerDataManager) {
            return this.world.playerDataManager.playerData;
        }
        return null;
    }

    private onCloseHandler() {
        this.destroy();
    }
}
