import { BasicMediator, Game } from "gamecore";
export declare class PicaDecorateControlMediator extends BasicMediator {
    private mDecorateManager;
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    destroy(): void;
    isSceneUI(): boolean;
    ensureChanges(): void;
    rotate(): void;
    recycle(): void;
    autoPlace(): void;
    exit(): void;
    protected panelInit(): void;
    private updateCanPlace;
    private updatePanelPos;
}
