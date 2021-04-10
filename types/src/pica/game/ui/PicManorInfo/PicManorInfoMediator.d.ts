import { BasicMediator, ElementDataManager, Game } from "gamecore";
export declare class PicManorInfoMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    private onHidePanel;
    private query_BUY_EDITOR_MANOR;
    private disposalManorInfo;
    private onUpdateData;
    get eleDataMgr(): ElementDataManager;
    private addActionLisenter;
    private onCategoriesHandler;
    private onQueryResuleHandler;
    private onGetCategoriesHandler;
    private onQueryPropHandler;
    private onBuyItemHandler;
    private onUsingItemHandler;
    private get model();
}
