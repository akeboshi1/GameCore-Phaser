import { BasePanel, UiManager } from "gamecoreRender";
export declare class CutInMenuPanel extends BasePanel {
    private rightPopButton;
    private mapPop;
    private popData;
    constructor(uiManager: UiManager);
    resize(width: number, height: number): void;
    preload(): void;
    init(): void;
    onShow(): void;
    setPopData(data: any): void;
    destroy(): void;
    opneButton(): void;
    private onRightClickHandler;
    private get buttonType();
}
