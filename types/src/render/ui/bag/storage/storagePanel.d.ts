import { BasePanel } from "../../components";
import { UiManager } from "../../ui.manager";
export declare class StoragePanel extends BasePanel {
    private mResStr;
    private mResPng;
    private mResJson;
    private mBagItemSlotList;
    private mClsBtn;
    private mBg;
    private mBorder;
    constructor(uiManager: UiManager);
    resize(wid: number, hei: number): void;
    destroy(): void;
    addListen(): void;
    removeListen(): void;
    protected init(): void;
    protected preload(): void;
    protected tweenComplete(show: boolean): void;
}
