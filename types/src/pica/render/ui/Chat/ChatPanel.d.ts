import { BasePanel, UiManager } from "gamecoreRender";
export declare class ChatPanel extends BasePanel {
    private uiManager;
    private mBackground;
    private mOutputText;
    private mTextArea;
    private mInputPanel;
    private chatCatchArr;
    private chatMaxLen;
    constructor(uiManager: UiManager);
    show(param?: any): void;
    resize(w: number, h: number): void;
    addListen(): void;
    removeListen(): void;
    appendChat(val: string): void;
    protected init(): void;
    private checkUpdateActive;
    private sendChat;
    private onSendMsgHandler;
    get mediator(): any;
}
