import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaElevatorPanel extends BasePanel {
    private mBackground;
    private bg;
    private closeBtn;
    private mGameGrid;
    private content;
    constructor(uiManager: UiManager);
    resize(width?: number, height?: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    preload(): void;
    init(): void;
    setElevtorDataList(ui: any): void;
    destroy(): void;
    private OnClosePanel;
    private onSendHandler;
    private onSelectItemHandler;
}
