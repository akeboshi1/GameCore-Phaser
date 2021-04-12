import { BasicMediator, Game } from "gamecore";
import { BaseDataConfigManager } from "../../config";
import { PicaEffectMgr } from "./PicaEffectMgr";
export declare class PicaEffectMgrMediator extends BasicMediator {
    protected mModel: PicaEffectMgr;
    protected tempQueue: any[];
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    panelInit(): void;
    setParam(param: any): void;
    private setViewEffect;
    private onCloseHandler;
    private onItemDataHandler;
    get config(): BaseDataConfigManager;
}
