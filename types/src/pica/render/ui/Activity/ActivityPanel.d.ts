import { BasePanel, UiManager } from "gamecoreRender";
export declare class ActivityPanel extends BasePanel {
    private content;
    private mGameScroll;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    updateUIState(active?: any): void;
    protected preload(): void;
    protected init(): void;
    private onClickHandler;
    private checkUpdateActive;
    private onPointerUpHandler;
}
