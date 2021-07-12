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
    protected mGuideEffect: Phaser.GameObjects.Image;
    protected mMask: Phaser.GameObjects.Graphics;
    protected guideText: Phaser.GameObjects.Text;
    protected mScaleTween: any;
    protected mScale: number;
    protected mResources: Map<string, IGuideRes>;
    protected mCachePos: IPos;
    protected mHandDisplay: HandDisplay;
    protected mCacheText: string;
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
declare class HandDisplay extends Phaser.GameObjects.Container {
    private mImage;
    constructor(scene: Phaser.Scene, key: string);
}
export {};
