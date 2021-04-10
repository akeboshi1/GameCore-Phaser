import { BasicMediator, Game } from "gamecore";
export declare class PicaMarketMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    panelInit(): void;
    destroy(): void;
    protected mediatorExport(): void;
    private onUpdatePlayerInfoHandler;
    private onCategoriesHandler;
    private onQueryResuleHandler;
    private onGetCategoriesHandler;
    private setMarketData;
    private convertMarketData;
    private onQueryPropHandler;
    private onBuyItemHandler;
    private onQueryPropresouceHandler;
    private onShowOpenPanel;
    private onPopItemCardHandler;
    private onQueryCommodityResourceHandler;
    private setCategories;
    private setMarketProp;
    private onCloseHandler;
    private get model();
}
