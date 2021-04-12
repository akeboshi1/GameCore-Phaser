import { BasePanel, UiManager } from "gamecoreRender";
export declare class FriendInvitePanel extends BasePanel {
    private bg;
    private refused;
    private agree;
    private text;
    private countdown;
    private interval;
    private tween;
    constructor(uiManager: UiManager);
    show(params?: any): void;
    addListen(): void;
    removeListen(): void;
    destroy(): void;
    protected preload(): void;
    protected init(): void;
    private showInvite;
    private onAgreeHandler;
    private onRefusedHandler;
    private close;
    private setAgressText;
    private targetUI;
    get mediator(): any;
}
