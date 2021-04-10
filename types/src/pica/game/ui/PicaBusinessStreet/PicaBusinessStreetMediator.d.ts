import { BasicMediator, Game } from "gamecore";
export declare class PicaBusinessStreetMediator extends BasicMediator {
    private mCacheData_MyStore;
    private mCacheData_Street;
    private mCacheData_Models;
    private mCacheData_RankindList;
    private mCacheData_RankindDetail;
    private mCacheData_RankindReward;
    private mCacheData_History;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    protected panelInit(): void;
    private onHidePanel;
    private queryMyStoreList;
    private query_TAKE_ALL_STORE_SAVINGS;
    private query_COMMERCIAL_STREET;
    private query_INDUSTRY_MODELS;
    private query_CREATE_STORE;
    private query_ENTER_ROOM;
    private query_RANKING_LIST;
    private query_STORE_RANKING_DETAIL;
    private query_STORE_RANKING_REWARD;
    private query_STORE_ENTER_HISTORY;
    private onMyStoreList;
    private onCOMMERCIAL_STREET;
    private onINDUSTRY_MODELS;
    private onSTORE_RANKING_LIST;
    private onSTORE_RANKING_DETAIL;
    private onSTORE_RANKING_REWARD;
    private onSTORE_ENTER_HISTORY;
    private get model();
    private get config();
}
