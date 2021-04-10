import { BasePanel, UiManager } from "gamecoreRender";
import { IJob } from "src/pica/structure/ijob";
export declare class PicaWorkPanel extends BasePanel {
    private bg;
    private titleName;
    private closeBtn;
    private headIcon;
    private content;
    private workbutton;
    private salaryLabel;
    private salaryvalue;
    private itemtips;
    private starSprite;
    private moneySprite;
    private jobData;
    private imageValues;
    private curProgress;
    private isWorking;
    private interTimeerID;
    private moneyAniKey;
    private starAniKey;
    constructor(uiManager: UiManager);
    resize(width?: number, height?: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    destroy(): void;
    preload(): void;
    init(): void;
    setWorkData(jobData: IJob): void;
    setWorkChance(count: number): void;
    setJobData(data: IJob): void;
    private createSprite;
    private calculateTimeout;
    private OnClosePanel;
    private onSendHandler;
    private onItemInfoTips;
    private getDesText;
}
