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
        if ((this.mView && this.mView.isShow()) || this.mShow) {
            this.layerMgr.addToUILayer(this.mView);
            return;
        }
        if (!this.mView) {
            this.mView = new PicBusinessStreetPanel(this.scene, this.world);
            this.mView.on("querymystore", this.queryMyStoreList, this);
            this.mView.on("querystreet", this.query_COMMERCIAL_STREET, this);
            this.mView.on("querymodels", this.query_INDUSTRY_MODELS, this);
            this.mView.on("querycreatestore", this.query_CREATE_STORE, this);
            this.mView.on("hide", this.onHidePanel, this);
        }
        if (!this.picStreet) {
            this.picStreet = new PicBusinessStreet(this.world);
            this.picStreet.on("onmystore", this.onMyStoreList, this);
            this.picStreet.on("onstreet", this.onCOMMERCIAL_STREET, this);
            this.picStreet.on("onmodels", this.onINDUSTRY_MODELS, this);
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

    private queryMyStoreList() {
        this.picStreet.query_My_STORE();
    }
    private query_COMMERCIAL_STREET(sortedBy: string, storeType: string) {
        this.picStreet.query_COMMERCIAL_STREET(sortedBy, storeType);
    }

    private query_INDUSTRY_MODELS() {
        this.picStreet.query_INDUSTRY_MODELS();
    }
    private query_CREATE_STORE(modelId: string) {
        this.picStreet.query_CREATE_STORE(modelId);
    }
    private onMyStoreList(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MY_STORE) {
        this.mView.setMyStore(content);
    }
    private onCOMMERCIAL_STREET(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_COMMERCIAL_STREET) {
        this.mView.setCommercialStreet(content);
    }

    private onINDUSTRY_MODELS(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_INDUSTRY_MODELS) {
        this.mView.setIndustryModels(content);
    }
}
