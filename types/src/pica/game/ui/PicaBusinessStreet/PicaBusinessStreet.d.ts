import { BasicModel, Game } from "gamecore";
import { ConnectionService } from "lib/net/connection.service";
export declare class PicaBusinessStreet extends BasicModel {
    constructor(game: Game);
    register(): void;
    unregister(): void;
    destroy(): void;
    get connection(): ConnectionService;
    query_My_STORE(): void;
    query_TAKE_ALL_STORE_SAVINGS(): void;
    query_COMMERCIAL_STREET(sortedBy: string, storeType: string): void;
    query_INDUSTRY_MODELS(): void;
    query_CREATE_STORE(modelId: string): void;
    query_ENTER_ROOM(roomId: string, password: string): void;
    query_RANKING_LIST(): void;
    query_STORE_RANKING_DETAIL(key: string, type: string): void;
    query_STORE_RANKING_REWARD(key: string, type: string): void;
    query_STORE_ENTER_HISTORY(): void;
    private onMyStoreList;
    private onCOMMERCIAL_STREET;
    private onINDUSTRY_MODELS;
    private onSTORE_RANKING_LIST;
    private onSTORE_RANKING_DETAIL;
    private onSTORE_RANKING_REWARD;
    private onSTORE_ENTER_HISTORY;
}
