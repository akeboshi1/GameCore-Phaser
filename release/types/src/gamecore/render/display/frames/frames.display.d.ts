/// <reference types="phaser" />
import { BaseFramesDisplay, ReferenceArea } from "baseRender";
import { Render } from "../../render";
import { ElementStateType, RunningAnimation, IPos } from "structure";
import { IDisplayObject } from "../display.object";
import { ElementTopDisplay } from "../element.top.display";
import { DragonbonesDisplay } from "../dragonbones/dragonbones.display";
/**
 * 序列帧显示对象
 */
export declare class FramesDisplay extends BaseFramesDisplay implements IDisplayObject {
    private render;
    protected mID: number;
    protected mTitleMask: number;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    private mName;
    private mStartFireTween;
    private mDebugPoint;
    private mGrids;
    constructor(scene: Phaser.Scene, render: Render, id?: number, type?: number);
    startLoad(): Promise<any>;
    destroy(): void;
    set titleMask(val: number);
    get titleMask(): number;
    get hasInteractive(): boolean;
    set hasInteractive(val: boolean);
    update(): void;
    checkCollision(sprite: any): boolean;
    showRefernceArea(area: number[][], origin: IPos, conflictMap?: number[][]): Promise<void>;
    hideRefernceArea(): void;
    showGrids(): void;
    hideGrids(): void;
    updateTopDisplay(): void;
    showNickname(name?: string): void;
    showTopDisplay(data?: ElementStateType): void;
    showBubble(text: string, setting: any): void;
    clearBubble(): void;
    displayCreated(): void;
    play(val: RunningAnimation): void;
    doMove(moveData: any): void;
    startFireMove(pos: any): void;
    setPosition(x?: number, y?: number, z?: number, w?: number): this;
    addEffect(display: IDisplayObject): void;
    removeEffect(display: IDisplayObject): void;
    unmount(display: FramesDisplay | DragonbonesDisplay): void;
    scaleTween(): void;
    protected fetchProjection(): Promise<void>;
    protected completeFrameAnimationQueue(): void;
    protected checkShowNickname(): boolean;
    private onAnimationUpdateHandler;
    private getMaskValue;
    get nickname(): string;
}
