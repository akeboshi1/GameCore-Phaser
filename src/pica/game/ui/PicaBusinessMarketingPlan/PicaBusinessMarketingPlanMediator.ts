import { op_client, op_pkt_def } from "pixelpai_proto";
import { PicaBusinessMarketingPlan } from "./PicaBusinessMarketingPlan";
import { BasicMediator, Game } from "gamecore";
import { ModuleName, RENDER_PEER } from "structure";
import { BaseDataConfigManager } from "../../data";
export class PicaBusinessMarketingPlanMediator extends BasicMediator {
    constructor(game: Game) {
        super(ModuleName.PICABUSINESSMARKETINGPLAN_NAME, game);
        this.mModel = new PicaBusinessMarketingPlan(this.game);
        this.game.emitter.on("onequipedplan", this.onEquiped_MARKET_PLAN, this);
        this.game.emitter.on("onplanmodels", this.onMARKET_PLAN_MODELS_BY_TYPE, this);
    }

    show(param?: any) {
        super.show(param);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryplanmodels", this.query_MARKET_PLAN_MODELS_BY_TYPE, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_querymarketplan", this.query_Equiped_MARKET_PLAN, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_queryselectplan", this.query_SELECT_MARKET_PLAN, this);
        this.game.emitter.on(RENDER_PEER + "_" + this.key + "_hide", this.onHidePanel, this);
    }

    hide() {
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryplanmodels", this.query_MARKET_PLAN_MODELS_BY_TYPE, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_querymarketplan", this.query_Equiped_MARKET_PLAN, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_queryselectplan", this.query_SELECT_MARKET_PLAN, this);
        this.game.emitter.off(RENDER_PEER + "_" + this.key + "_hide", this.onHidePanel, this);
        super.hide();
    }

    destroy() {
        this.game.emitter.off("onequipedplan", this.onEquiped_MARKET_PLAN, this);
        this.game.emitter.off("onplanmodels", this.onMARKET_PLAN_MODELS_BY_TYPE, this);
        super.destroy();
    }

    get playerData() {
        if (this.bag) {
            return this.bag.playerBag;
        }
        return null;
    }

    get bag() {
        const user = this.game.user;
        if (!user || !user.userData) {
            return;
        }
        return user.userData;
    }

    private onHidePanel() {
        this.hide();
    }

    private query_MARKET_PLAN_MODELS_BY_TYPE(market_plan_type: string) {
        this.model.query_MARKET_PLAN_MODELS_BY_TYPE(market_plan_type);
    }
    private query_Equiped_MARKET_PLAN() {
        const room_id = this.game.user.userData.curRoomID;
        this.model.query_Equiped_MARKET_PLAN(room_id);
    }

    private query_SELECT_MARKET_PLAN(marketPlanId: string) {
        const room_id = this.game.user.userData.curRoomID;
        this.model.query_SELECT_MARKET_PLAN(room_id, marketPlanId);
    }
    private onEquiped_MARKET_PLAN(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN) {
        // const materials = content.marketPlanPairs.
        if (content.industryBuffDes) {
            const texts = content.industryBuffDes.split(" ");
            content.industryBuffDes = this.config.getI18n(texts[0]) + " " + (texts[1] ? texts[1] : "");
        }
        content.industryDes = this.config.getI18n(content.industryDes);
        this.mView.setEquipedPlan(content);
    }
    private onMARKET_PLAN_MODELS_BY_TYPE(content: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_PKT_MARKET_PLAN_MODELS_BY_TYPE) {
        if (content.marketPlan) {
            for (const plan of content.marketPlan) {
                const requirements = plan.requirements;
                this.updateMaterials(requirements);
            }
        }
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
    private get model(): PicaBusinessMarketingPlan {
        return (<PicaBusinessMarketingPlan>this.mModel);
    }

    private get config(): BaseDataConfigManager {
        return <BaseDataConfigManager>this.game.configManager;
    }
}
