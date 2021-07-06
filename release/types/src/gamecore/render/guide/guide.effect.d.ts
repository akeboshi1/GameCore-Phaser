/// <reference types="tooqingphaser" />
import { IPos } from "structure";
import { Url } from "utils";
export interface IGuideRes {
    key: string;
    url: string;
    type: string;
    data?: string;
}
export declare class GuideEffect extends Phaser.GameObjects.Container {
    private tmpScale;
    private url;
    protected mInitialized: boolean;
    private mGuideEffect;
    private mMask;
    private guideText;
    private mScaleTween;
    private mScale;
    private mResources;
    private mCachePos;
    private mHandDisplay;
    private mCacheText;
    constructor(scene: Phaser.Scene, tmpScale: number, url: Url);
    preload(): void;
    createGuideEffect(pos: IPos, text?: string): void;
    setGuideText(text: string): void;
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
