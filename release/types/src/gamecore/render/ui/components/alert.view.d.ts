/// <reference types="tooqingphaser" />
import { BaseBatchPanel } from "./base.batch.panel";
import { UiManager } from "../ui.manager";
export declare class AlertView extends BaseBatchPanel {
    private uiManager;
    protected skinName: string;
    private mOkBtn;
    private mCancelBtn;
    private mContent;
    private mTitleLabel;
    private mOkText;
    private mBackGround;
    constructor(scene: Phaser.Scene, uiManager: UiManager);
    show(config: IAlertConfig): void;
    preload(): void;
    setOKText(val: string): this;
    protected init(): void;
    private onOkHandler;
    private onCancelHandler;
    private closePanel;
}
export interface IAlertConfig {
    text: string;
    title?: string;
    callback: Function;
    content?: any;
    cancelback?: Function;
    ox?: number;
    oy?: number;
    btns?: Buttons;
    once?: boolean;
}
export declare enum Buttons {
    Ok = 0,
    Cancel = 1,
    OKAndCancel = 2
}
