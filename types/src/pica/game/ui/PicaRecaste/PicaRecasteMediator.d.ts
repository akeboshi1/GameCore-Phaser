import { BasicMediator, Game } from "gamecore";
import { PicaRecaste } from "./PicaRecaste";
export declare class PicaRecasteMediator extends BasicMediator {
    protected mModel: PicaRecaste;
    private mScneType;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    get bag(): import("../../../../game").PlayerBag;
    get userData(): import("../../../../game").UserDataManager;
    protected panelInit(): void;
    private onCloseHandler;
    private addLisenter;
    private removeLisenter;
    private onUpdatePlayerInfoHandler;
    private onRetRescateHandler;
    private onRetRescateListHandler;
    private queryRecaste;
    private queryFuriListByStar;
    private setCategories;
    private get cacheMgr();
}
