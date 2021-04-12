import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaHandheldPanel extends BasePanel {
    private gridContent;
    private handeldEqiped;
    private mPropGrid;
    private curHandheldItem;
    private isExtendsGrid;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    show(param?: any): void;
    hide(): void;
    addListen(): void;
    removeListen(): void;
    destroy(): void;
    setEqipedDatas(content: any): void;
    protected preload(): void;
    protected init(): void;
    private updateData;
    private updateLayout;
    private onSelectItemHandler;
    private onHandheldEqipedHandler;
    private onShortcutHandler;
}
