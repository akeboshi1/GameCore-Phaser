import { BasicMediator, Game } from "gamecore";
export declare class PicaDecorateMediator extends BasicMediator {
    private readonly QUICK_SELECT_COUNT;
    private mDecorateManager;
    private mCacheData_UpdateCount;
    private mCacheData_SelectFurniture;
    constructor(game: Game);
    show(param?: any): void;
    destroy(): void;
    isSceneUI(): boolean;
    btnHandler_Close(): void;
    btnHandler_SaveAndExit(): void;
    btnHandler_RemoveAll(): void;
    btnHandler_Reverse(): void;
    btnHandler_Bag(): void;
    onFurnitureClick(baseID: string): void;
    onSelectFurniture(baseID: string): void;
    onUnselectFurniture(): void;
    updateFurnitureCount(baseID: string, count: number): void;
    protected panelInit(): void;
    private get bagData();
}
