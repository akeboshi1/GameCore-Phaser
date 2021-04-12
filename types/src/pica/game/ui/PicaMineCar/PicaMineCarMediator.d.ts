import { BasicMediator, Game } from "gamecore";
export declare class PicaMineCarMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    get playerData(): import("../../../../game").PlayerBag;
    get bag(): import("../../../../game").UserDataManager;
    private addLisenter;
    private removeLisenter;
    private onSyncFinishHandler;
    private onUpdateHandler;
    private onPackageCategoryHandler;
    private onQueryCategoryHandler;
    private onQueryPackage;
    private onDiscardHandler;
    private onCloseHandler;
    private get model();
}
