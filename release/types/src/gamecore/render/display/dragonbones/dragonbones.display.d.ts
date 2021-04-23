/// <reference types="tooqinggamephaser" />
import { Render } from "../../render";
import { DisplayField, ElementStateType, IDragonbonesModel, RunningAnimation, IPos, IProjection } from "structure";
import { IDisplayObject } from "../display.object";
import { ElementTopDisplay } from "../element.top.display";
import { FramesDisplay } from "../frames/frames.display";
import { BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
export declare class DragonbonesDisplay extends BaseDragonbonesDisplay implements IDisplayObject {
    private render;
    private uuid?;
    protected mTitleMask: number;
    protected mNodeType: number;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    protected mSortX: number;
    protected mSortY: number;
    private mLoadQueue;
    private mName;
    private mStartFireTween;
    constructor(scene: Phaser.Scene, render: Render, id?: number, uuid?: number, type?: number);
    load(display: IDragonbonesModel, field?: DisplayField): Promise<any>;
    get hasInteractive(): boolean;
    set hasInteractive(val: boolean);
    startLoad(): Promise<any>;
    destroy(): void;
    get id(): number;
    get nodeType(): number;
    set titleMask(val: number);
    get titleMask(): number;
    checkCollision(sprite: any): boolean;
    showRefernceArea(area: number[][], origin: IPos): Promise<void>;
    hideRefernceArea(): void;
    updateTopDisplay(): void;
    setVisible(value: boolean): this;
    showNickname(name?: string): void;
    showTopDisplay(data?: ElementStateType): void;
    showBubble(text: string, setting: any): void;
    clearBubble(): void;
    displayCreated(): void;
    get projectionSize(): IProjection;
    play(val: RunningAnimation): void;
    startFireMove(pos: any): void;
    doMove(moveData: any): void;
    update(): void;
    addEffect(display: IDisplayObject): void;
    removeEffect(display: IDisplayObject): void;
    mount(display: FramesDisplay | DragonbonesDisplay, index?: number): void;
    unmount(display: FramesDisplay | DragonbonesDisplay): void;
    get sortX(): number;
    get sortY(): number;
    protected refreshAvatar(): void;
    protected fetchProjection(): Promise<void>;
    protected fileComplete(progress: number, key: string, type: string): void;
    protected fileError(key: string): void;
    protected onArmatureLoopComplete(event: dragonBones.EventObject): void;
    protected loadDragonBones(pngUrl: string, jsonUrl: string, dbbinUrl: string): void;
    protected checkShowNickname(): boolean;
    get nickname(): string;
}
