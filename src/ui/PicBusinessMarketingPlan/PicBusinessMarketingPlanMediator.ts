import { ILayerManager } from "../layer.manager";
import { op_client, op_pkt_def } from "pixelpai_proto";
import { BaseMediator } from "../../../lib/rexui/lib/ui/baseUI/BaseMediator";
import { WorldService } from "../../game/world.service";
import PicBusinessStreetPanel from "./PicBusinessMarketingPlanPanel";
import { PicBusinessMarketingPlan } from "./PicBusinessMarketingPlan";
import PicBusinessMarketingPlanPanel from "./PicBusinessMarketingPlanPanel";
import { PicaMainUIMediator } from "../PicaMainUI/PicaMainUIMediator";
export class PicBusinessMarketingPlanMediator extends BaseMediator {
    protected mView: PicBusinessMarketingPlanPanel;
    private scene: Phaser.Scene;
    private layerMgr: ILayerManager;
    private picPlan: PicBusinessMarketingPlan;
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
            this.mView = new PicBusinessMarketingPlanPanel(this.scene, this.world);
            this.mView.on("queryplanmodels", this.query_MARKET_PLAN_MODELS_BY_TYPE, this);
            this.mView.on("querymarketplan", this.query_Equiped_MARKET_PLAN, this);
            this.mView.on("queryselectplan", this.query_SELECT_MARKET_PLAN, this);
            this.mView.on("hide", this.onHidePanel, this);
        }
        if (!this.picPlan) {
            this.picPlan = new PicBusinessMarketingPlan(this.world);
            this.picPlan.on("onequipedplan", this.onEquiped_MARKET_PLAN, this);
            this.picPlan.on("onplanmodels", this.onMARKET_PLAN_MODELS_BY_TYPE, this);
            this.picPlan.register();
        }
        this.layerMgr.addToUILayer(this.mView);
        this.mView.show();
    }

    destroy() {
        if (this.picPlan) {
            this.picPlan.destroy();
            this.picPlan = undefined;
        }
        if (this.mView) {
            this.mView.hide();
            this.mView = undefined;
        }
    }
    get playerData() {
        if (this.world.playerDataManager) {
            return this.world.playerDataManager.playerData;
        }
        return null;
    }

    private onHidePanel() {
        this.destroy();
    }

    private query_MARKET_PLAN_MODELS_BY_TYPE(market_plan_type: string) {
        this.picPlan.query_MARKET_PLAN_MODELS_BY_TYPE(market_plan_type);
    }
    private query_Equiped_MARKET_PLAN() {
        const uimanager = this.world.uiManager;
        const picmainui = <PicaMainUIMediator>uimanager.getMediator("PicaMainUIMediator");
        const room_id = picmainui.roomInfo.roomId;
        this.picPlan.query_Equiped_MARKET_PLAN(room_id);
    }

    private query_SELECT_MARKET_PLAN(marketPlanId: string) {
        const uimanager = this.world.uiManager;
        const picmainui = <PicaMainUIMediator>uimanager.getMediator("PicaMainUIMediator");
        const room_id = picmainui.roomInfo.roomId;
        this.picPlan.query_SELECT_MARKET_PLAN(room_id, marketPlanId);
    }
    private onEquiped_MARKET_PLAN(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN) {
        // const materials = content.marketPlanPairs.
        if (content.marketPlanPairs) {
            for (const plan of content.marketPlanPairs) {
                const requirements = plan.marketPlan.requirements;
                this.updateMaterials(requirements);
            }
        }
        this.mView.setEquipedPlan(content);
    }
    private onMARKET_PLAN_MODELS_BY_TYPE(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN_MODELS_BY_TYPE) {
        this.mView.setPlanModels(content);
    }
    private updateMaterials(materials: op_client.ICountablePackageItem[]) {
        if (this.playerData) {
            if (materials) {
                for (const data of materials) {
                    const count = this.playerData.getItemsCount(op_pkt_def.PKT_PackageType.PropPackage, data.id, data.subcategory);
                    data.count = count;
                }
            }
        }
    }
}
