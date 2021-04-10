import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaRewardTipPanel extends BasePanel {
    private uiManager;
    private mTips;
    private showingList;
    constructor(uiManager: UiManager);
    show(): void;
    appendAward(tips: any): void;
    addAward(): void;
    destroy(): void;
    protected preload(): void;
    protected init(): void;
    private showAward;
    private onAwardItemShowHandler;
    private onDestroyHanlder;
}
