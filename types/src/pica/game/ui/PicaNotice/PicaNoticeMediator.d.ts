import { BasicMediator, Game } from "gamecore";
export declare class PicaNoticeMediator extends BasicMediator {
    private mPanelQueue;
    private mCreatingPanel;
    constructor(game: Game);
    show(param?: any): void;
    panelInit(): void;
    hide(): void;
    private onCloseHandler;
}
