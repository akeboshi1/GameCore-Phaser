import { op_gameconfig, op_def } from "pixelpai_proto";
import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicManorInfo extends BasicModel {
    private market_name;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_BUY_EDITOR_MANOR(roomid: string, index: number, op: number, manorName: any): void;
    /**
     * 获取商品分类
     */
    getMarkCategories(index: number): void;
    queryMarket(page: number, category: string, subCategory: string): void;
    buyMarketCommodities(commodities: op_def.IOrderCommodities[]): void;
    use_MANOR_SHOP_USE_COMMODITY(id: string): void;
    private onGetMarketCategoriesHandler;
    private onQueryMarketHandler;
}
export interface IManorBillboardData {
    uiName?: string;
    manorIndex?: number;
    ownerName?: string;
    streetName?: string;
    alreadyBuy?: boolean;
    ownerId?: string;
    price?: op_gameconfig.IPrice;
    myowner?: boolean;
    requireLevel?: number;
    manorName?: string;
}
