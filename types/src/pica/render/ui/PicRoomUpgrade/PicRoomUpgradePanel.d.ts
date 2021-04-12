import { BasePanel, UiManager } from "gamecoreRender";
export declare class PicRoomUpgradePanel extends BasePanel {
    private content;
    private mBackground;
    private mTitleName;
    private roomIcon;
    private mPlayedTimes;
    private readonly MAX_TIMES;
    constructor(uiManager: UiManager);
    resize(w: number, h: number): void;
    show(param?: any): void;
    hide(): void;
    updateData(): void;
    addListen(): void;
    removeListen(): void;
    destroy(): void;
    protected preload(): void;
    protected init(): void;
    private onClickHandler;
    private createAnimations;
    private animationRepeat;
}
