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
            this.mView.on("queryallsaves", this.query_TAKE_ALL_STORE_SAVINGS, this);
            this.mView.on("querystreet", this.query_COMMERCIAL_STREET, this);
            this.mView.on("querymodels", this.query_INDUSTRY_MODELS, this);
            this.mView.on("querycreatestore", this.query_CREATE_STORE, this);
            this.mView.on("queryenterroom", this.query_ENTER_ROOM, this);
            this.mView.on("queryranklist", this.query_RANKING_LIST, this);
            this.mView.on("queryrankdetail", this.query_STORE_RANKING_DETAIL, this);
            this.mView.on("queryrankreward", this.query_STORE_RANKING_REWARD, this);
            this.mView.on("queryenterhistory", this.query_STORE_ENTER_HISTORY, this);
            this.mView.on("hide", this.onHidePanel, this);
        }
        if (!this.picStreet) {
            this.picStreet = new PicBusinessStreet(this.world);
            this.picStreet.on("onmystore", this.onMyStoreList, this);
            this.picStreet.on("onstreet", this.onCOMMERCIAL_STREET, this);
            this.picStreet.on("onmodels", this.onINDUSTRY_MODELS, this);
            this.picStreet.on("onranklist", this.onSTORE_RANKING_LIST, this);
            this.picStreet.on("onrankdetail", this.onSTORE_RANKING_DETAIL, this);
            this.picStreet.on("onrankreward", this.onSTORE_RANKING_REWARD, this);
            this.picStreet.on("onenterhistory", this.onSTORE_ENTER_HISTORY, this);
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
    private query_TAKE_ALL_STORE_SAVINGS() {
        this.picStreet.query_TAKE_ALL_STORE_SAVINGS();
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

    private query_ENTER_ROOM(roomId: string, password: string) {
        this.picStreet.query_ENTER_ROOM(roomId, password);
    }

    private query_RANKING_LIST() {
        this.picStreet.query_RANKING_LIST();
    }

    private query_STORE_RANKING_DETAIL(key: string, type: string) {
        this.picStreet.query_STORE_RANKING_DETAIL(key, type);
    }

    private query_STORE_RANKING_REWARD(key: string, type: string) {
        this.picStreet.query_STORE_RANKING_REWARD(key, type);
    }
    private query_STORE_ENTER_HISTORY() {
        this.picStreet.query_STORE_ENTER_HISTORY();
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
    private onSTORE_RANKING_LIST(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_LIST) {
        this.mView.setStoreRankingList(content);
    }
    private onSTORE_RANKING_DETAIL(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_DETAIL) {
        this.mView.setStoreRankingDetial(content);
    }
    private onSTORE_RANKING_REWARD(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_RANKING_REWARD) {
        this.mView.setStoreRankingReward(content);
    }
    private onSTORE_ENTER_HISTORY(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_QUERY_STORE_ENTER_HISTORY) {
        this.mView.setEnterHistory(content);
    }
}
