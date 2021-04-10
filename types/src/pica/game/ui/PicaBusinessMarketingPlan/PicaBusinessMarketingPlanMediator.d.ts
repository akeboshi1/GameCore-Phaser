import { BasicMediator, Game } from "gamecore";
export declare class PicaBusinessMarketingPlanMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    get playerData(): import("../../../../game").PlayerBag;
    get bag(): import("../../../../game").UserDataManager;
    private onHidePanel;
    private query_MARKET_PLAN_MODELS_BY_TYPE;
    private query_Equiped_MARKET_PLAN;
    private query_SELECT_MARKET_PLAN;
    private onEquiped_MARKET_PLAN;
    private onMARKET_PLAN_MODELS_BY_TYPE;
    private updateMaterials;
    private get model();
    private get config();
}
