import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicManorInfoPanel extends BasePanel {
    private content;
    private mBackGround;
    private picChildPanel;
    private picTipsPanel;
    private picShopPanel;
    private manorInfo;
    constructor(uiManager: UiManager);
    resize(width: number, height: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    preload(): void;
    init(): void;
    setManorInfo(data: any): void;
    setShopCategories(content: any): void;
    setShopDatas(content: any): void;
    setManorTips(): void;
    destroy(): void;
    private openManorChild;
    private openManorShop;
    private showChildPanel;
    private hideChildPanel;
    private showShopPanel;
    private hideShopPanel;
    private OnCloseHandler;
}
