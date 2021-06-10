/// <reference types="tooqinggamephaser" />
import { IToolTip } from "./itoolTip";
export declare class ToolTip extends Phaser.GameObjects.Container implements IToolTip {
    private mScene;
    private resStr;
    private resJson;
    private resUrl;
    private uiScale;
    private static TOP;
    private static MID;
    private static BOT;
    private mWidth;
    private mHeight;
    private mBaseMidHeight;
    private topImage;
    private midImage;
    private botImage;
    private mText;
    constructor(mScene: Phaser.Scene, resStr: string, resJson: string, resUrl: string, uiScale: number);
    setToolTipData(value: string): void;
    destroy(): void;
    protected preLoad(): void;
    protected init(): void;
    protected refreshTip(): void;
    private onLoadComplete;
}
