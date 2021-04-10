import { UiManager } from "gamecoreRender";
import { PicaBasePanel } from "../pica.base.panel";
export declare class PicaDecorateControlPanel extends PicaBasePanel {
    private mSaveBtn;
    private mRotateBtn;
    private mRecycleBtn;
    private mExitBtn;
    private mBtns;
    constructor(uiManager: UiManager);
    addListen(): void;
    removeListen(): void;
    resize(w: number, h: number): void;
    updateCanPlace(canPlace: boolean): void;
    updatePosition(): void;
    protected preload(): void;
    protected init(): void;
    private changePosFollowTarget;
    private onSaveHandler;
    private onRotateHandler;
    private onRecycleAllHandler;
    private onAutoPlaceHandler;
    private onExitHandler;
    private get mediator();
}
