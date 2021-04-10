import { UiManager } from "../ui.manager";
import { BasicRankPanel } from "./basicRankPanel";
export declare class RankPanel extends BasicRankPanel {
    private mZoonInBtn;
    private mCurrentIndex;
    private mClsBtn;
    constructor(uiManager: UiManager);
    addListen(): void;
    removeListen(): void;
    resize(wid?: number, hei?: number): void;
    tweenView(show: boolean): void;
    destroy(): void;
    protected init(): void;
    protected tweenComplete(show: boolean): void;
    private closeHandler;
    private onZoomHandler;
    private set currentSizeIndex(value);
}
