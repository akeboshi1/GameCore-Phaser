import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaItemPopCardPanel extends BasePanel {
    private mCardContainer;
    private mNickName;
    private mDesText;
    private mCloseBtn;
    private mSource;
    private mNickNameDown;
    private mDetailDisplay;
    private mBorder;
    private mPressDelay;
    private mPressTime;
    constructor(uiManager: UiManager);
    addListen(): void;
    removeListen(): void;
    resize(w: number, h: number): void;
    setProp(): void;
    protected preload(): void;
    protected init(): void;
    private onCloseHandler;
    private onPointerNickNameHandler;
    private onPointerNickNameDownHandler;
    private onPointerDesDownHandler;
    private copyName;
    private copyDes;
    private onShowHandler;
}
