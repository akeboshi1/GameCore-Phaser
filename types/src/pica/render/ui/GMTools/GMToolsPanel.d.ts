import { BasePanel, UiManager } from "gamecoreRender";
export declare class GMToolsPanel extends BasePanel {
    private background;
    private gridtable;
    private closeBtn;
    private command;
    private commitBtn;
    constructor(uiManager: UiManager);
    show(param?: any): void;
    update(param?: any): void;
    addListen(): void;
    removeListen(): void;
    resize(): void;
    protected preload(): void;
    protected init(): void;
    protected showButtons(): void;
    private onTargetUIHandler;
    private onCloseHandler;
    private onCommitCmdHandler;
    private onEnterCommandHandler;
}
