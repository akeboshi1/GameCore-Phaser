import { BasicMediator, Game } from "gamecore";
export declare class PicaNavigateMediator extends BasicMediator {
    constructor(game: Game);
    show(param?: any): void;
    hide(): void;
    isSceneUI(): boolean;
    destroy(): void;
    private onCloseHandler;
    private onShowPanelHandler;
    private onGomeHomeHandler;
}
