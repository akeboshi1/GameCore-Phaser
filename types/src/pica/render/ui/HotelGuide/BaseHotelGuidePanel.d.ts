import { BaseGuide, UiManager } from "gamecoreRender";
export declare class BaseHotelGuidePanel extends BaseGuide {
    protected taskButton: any;
    protected itemTaskBtn: any;
    constructor(uiManager: UiManager);
    show(param?: any): void;
    end(): void;
    protected step1(): void;
    protected step2(): void;
    protected step3(pos: any): void;
    protected step4(): void;
}
