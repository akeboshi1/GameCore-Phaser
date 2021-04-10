import { BasePanel, UiManager } from "gamecoreRender";
export declare class CutInPanel extends BasePanel {
    private mName;
    constructor(uiManager: UiManager);
    show(param: any): void;
    resize(w: number, h: number): void;
    preload(): void;
    init(): void;
}
