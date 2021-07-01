/// <reference types="tooqingphaser" />
import { BaseDisplay } from "./base.display";
import { DisplayField, IFramesModel, RunningAnimation, IResPath } from "structure";
import { BaseDragonbonesDisplay } from "./base.dragonbones.display";
/**
 * 序列帧显示对象
 */
export declare class BaseFramesDisplay extends BaseDisplay {
    private pathObj;
    protected mFadeTween: Phaser.Tweens.Tween;
    protected mDisplayDatas: Map<DisplayField, IFramesModel>;
    protected mScaleTween: Phaser.Tweens.Tween;
    protected mDisplays: Map<number, Phaser.GameObjects.Sprite | Phaser.GameObjects.Image>;
    protected mMainSprite: Phaser.GameObjects.Sprite;
    protected mMountContainer: Phaser.GameObjects.Container;
    protected mCurAnimation: any;
    protected mIsSetInteractive: boolean;
    protected mIsInteracitve: boolean;
    protected mPreAnimation: RunningAnimation;
    protected mNodeType: number;
    private mField;
    constructor(scene: Phaser.Scene, pathObj: IResPath, id?: number, nodeType?: number);
    load(displayInfo: IFramesModel, field?: DisplayField): Promise<any>;
    play(animation: RunningAnimation, field?: DisplayField): void;
    playEffect(): void;
    fadeIn(callback?: () => void): void;
    fadeOut(callback?: () => void): void;
    setInteractive(shape?: Phaser.Types.Input.InputConfiguration | any, callback?: (hitArea: any, x: number, y: number, gameObject: Phaser.GameObjects.GameObject) => void, dropZone?: boolean): this;
    disableInteractive(): this;
    removeDisplay(field: DisplayField): void;
    mount(display: BaseFramesDisplay | BaseDragonbonesDisplay, targetIndex?: number): void;
    unmount(display: BaseFramesDisplay | BaseDragonbonesDisplay): void;
    destroy(): void;
    protected createDisplays(key: string, ani: any): void;
    protected createDisplay(key: string, layer: any): Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
    protected clearFadeTween(): void;
    protected completeFrameAnimationQueue(): void;
    protected tryCreateDisplay(key: string, animations: any, newAni: any): void;
    protected clearDisplay(): void;
    protected onAddTextureHandler(key: string, field?: DisplayField, cb?: (key: string) => void): void;
    protected mAllLoadCompleted(): void;
    protected onLoadCompleted(field: DisplayField): void;
    protected makeAnimation(gen: string, key: string, frameName: string[], frameVisible: boolean[], frameRate: number, loop: boolean, frameDuration?: number[]): void;
    protected updateBaseLoc(display: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image, flip: boolean, offsetLoc: any): void;
    protected onAnimationRepeatHander(): void;
    protected addToStageContainer(display: any): void;
    protected get framesInfo(): IFramesModel;
    get spriteWidth(): number;
    get spriteHeight(): number;
    get topPoint(): Phaser.Geom.Point;
    get nodeType(): number;
}
