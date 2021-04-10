import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaMessageBoxPanel extends BasePanel {
    private mTitleLabel;
    private mButtons;
    private mText;
    private mButtonContaier;
    private closeBtn;
    private border;
    constructor(uiManager: UiManager);
    show(param: any): void;
    resize(w: number, h: number): void;
    protected preload(): void;
    protected init(): void;
    private onClickHandler;
    private onCloseHandler;
}
