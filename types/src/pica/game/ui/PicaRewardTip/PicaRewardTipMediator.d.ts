import { BasicMediator, Game } from "gamecore";
export declare class PicaRewardTipMediator extends BasicMediator {
    private mCacheData;
    constructor(game: Game);
    show(param?: any): void;
    panelInit(): void;
    setParam(param: any): void;
    destroy(): void;
    private onShowAwardHandler;
    private onUpdateItemBase;
}
