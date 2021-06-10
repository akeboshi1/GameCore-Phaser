/// <reference types="tooqinggamephaser" />
import { IPos } from "structure";
export interface IGuideRes {
    key: string;
    url: string;
    type: string;
    data?: string;
}
export declare class GuideEffect extends Phaser.GameObjects.Container {
    private tmpScale;
    protected mInitialized: boolean;
    private mGuideEffect;
    private mMask;
    private mScaleTween;
    private mScale;
    private mResources;
    private mCachePos;
    private mHandDisplay;
    constructor(scene: Phaser.Scene, tmpScale?: number);
    preload(): void;
    createGuideEffect(pos: IPos): void;
    updatePos(pos: IPos): void;
    start(): void;
    stop(): void;
    scaleTween(): void;
    destroy(): void;
    setInitialize(val: boolean): void;
    private addListen;
    private removeListen;
    private loadImageHandler;
    private loadError;
}
