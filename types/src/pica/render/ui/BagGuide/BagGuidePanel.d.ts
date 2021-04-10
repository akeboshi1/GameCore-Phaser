import { BaseGuide, UiManager } from "gamecoreRender";
export declare class BagGuidePanel extends BaseGuide {
    private bagBtn;
    private clsBtn;
    constructor(uiManager: UiManager);
    show(param?: any): void;
    end(): void;
    private step1;
    private step2;
    private step3;
}
