import { BasicMediator, Game } from "gamecore";
export declare class PicaElementStorageMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    /**
     * 展开
     */
    expand(): void;
    /**
     * 收起
     */
    collapse(): void;
    destroy(): void;
    private onQueryElementHandler;
    private register;
    private unregister;
    private onEditModeQueryPackageHandler;
    private onSelectedElement;
    private onExpanedHandler;
    private onCollapseHandler;
    private get model();
}
