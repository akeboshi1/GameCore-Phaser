import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
import { op_def } from "pixelpai_proto";
export declare class PicaMarket extends BasicModel {
    market_name: string;
    market_data: any;
    constructor(game: Game);
    register(): void;
    unregister(): void;
    setMarketName(market_name: string): void;
    queryMarket(page: number, category: string, subCategory: string): void;
    buyMarketCommodities(commodities: op_def.IOrderCommodities[]): void;
    queryCommodityResource(id: string, category: string): void;
    queryShopData(): void;
    destroy(): void;
    private onGetMarketCategoriesHandler;
    private onQueryMarketHandler;
    private onQueryCommodityResultHandler;
    private openMarketPanel;
    private setMarketData;
    get connection(): ConnectionService;
}
