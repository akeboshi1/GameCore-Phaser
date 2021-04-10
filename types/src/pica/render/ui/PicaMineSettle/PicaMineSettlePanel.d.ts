import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicaMineSettlePanel extends BasePanel {
    private confirmBtn;
    private mPropGrid;
    private blackGraphic;
    private bg;
    private titleimage;
    private titleName;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    show(param?: any): void;
    addListen(): void;
    removeListen(): void;
    preload(): void;
    init(): void;
    setMineSettlePacket(content: any): void;
    destroy(): void;
    private refreshData;
    private onSelectItemHandler;
    private onConfirmBtnClick;
    private checkPointerDis;
}
