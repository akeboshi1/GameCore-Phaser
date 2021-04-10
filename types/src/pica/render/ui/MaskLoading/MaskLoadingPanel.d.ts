import { BasePanel, UiManager } from "gamecoreRender";
export declare class MaskLoadingPanel extends BasePanel {
    private maskGrap;
    private ani;
    constructor(uiManager: UiManager);
    resize(): void;
    protected init(): void;
    protected __exportProperty(): void;
}
