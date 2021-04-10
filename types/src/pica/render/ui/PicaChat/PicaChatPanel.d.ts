import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaChatPanel extends BasePanel {
    private uiManager;
    private readonly MAX_HEIGHT;
    private readonly MIN_HEIGHT;
    private mBackground;
    private mScrollBtn;
    private mTileContainer;
    private mTitleBg;
    private mChatBtn;
    private mHornBtn;
    private mEmojiBtn;
    private mGiftBtn;
    private mOutputText;
    private mTextArea;
    private mInputText;
    private chatCatchArr;
    private chatMaxLen;
    private giftPanel;
    constructor(uiManager: UiManager);
    show(param?: any): void;
    resize(w: number, h: number): void;
    chatHandler(content: any): Promise<void>;
    showChat(chat: string): void;
    getChannel(channel: any): string;
    setGiftData(content: any): void;
    appendChat(val: string): void;
    isShowChatPanel(): boolean;
    hide(): void;
    addListen(): void;
    removeListen(): void;
    updateUIState(active?: any): void;
    destroy(): void;
    protected preload(): void;
    protected init(): void;
    private onDragHandler;
    private setGiftButtonState;
    private onShowNavigateHandler;
    private onEmojiHandler;
    private onGiftHandler;
    private onShowInputHanldler;
    private sendChat;
    private openAppInputPanel;
    private appSendChat;
    private appCloseChat;
    private checkUpdateActive;
    private hideAllChildPanel;
    private showChatTextArea;
    private onBuyItemHandler;
    private showPropFun;
    private showNoticeHandler;
    private showPanelHandler;
}
