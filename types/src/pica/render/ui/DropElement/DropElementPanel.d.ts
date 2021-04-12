import { BasePanel, UiManager } from "gamecoreRender";
export declare class DropElementPanel extends BasePanel {
    private element;
    constructor(uiManager: UiManager);
    update(param?: any): void;
    protected preload(): void;
    protected init(): void;
    private updateElement;
    private onTapHandler;
}
