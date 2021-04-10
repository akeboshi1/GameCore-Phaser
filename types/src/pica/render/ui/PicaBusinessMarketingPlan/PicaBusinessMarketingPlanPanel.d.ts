import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaBusinessMarketingPlanPanel extends BasePanel {
    private key2;
    private content;
    private mBackGround;
    private picBusinessPlanPanel;
    private picChoosePlanPanel;
    constructor(uiManager: UiManager);
    resize(width: number, height: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    preload(): void;
    init(): void;
    setPlanModels(content: any): void;
    setEquipedPlan(content: any): void;
    destroy(): void;
    private openPlanPanel;
    private openChoosePlanPanel;
    private showMarketingPlanPanel;
    private hideMarketingPlanPanel;
    private showChoosePlanPanel;
    private hideChoosePlanPanel;
    private setContentSize;
    private OnCloseHandler;
}
