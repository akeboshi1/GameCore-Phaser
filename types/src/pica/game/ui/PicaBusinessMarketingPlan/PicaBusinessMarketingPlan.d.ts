import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaBusinessMarketingPlan extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_Equiped_MARKET_PLAN(room_id: string): void;
    query_MARKET_PLAN_MODELS_BY_TYPE(market_plan_type: string): void;
    query_SELECT_MARKET_PLAN(room_id: string, marketPlanId: string): void;
    private onEquiped_MARKET_PLAN;
    private onMARKET_PLAN_MODELS_BY_TYPE;
}
