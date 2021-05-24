/// <reference types="phaser" />
import { BaseUI, ISoundGroup } from "apowophaserui";
import { ThreeSlicePath } from "./three.slice.path";
export declare enum ButtonState {
    Normal = "normal",
    Over = "over",
    Select = "select",
    Disable = "disable"
}
export interface IButtonState extends Phaser.Events.EventEmitter {
    changeNormal(): any;
    changeDown(): any;
}
export declare class ThreeSliceButton extends BaseUI implements IButtonState {
    protected soundGroup: any;
    protected mDownTime: number;
    protected mPressDelay: number;
    protected mPressTime: any;
    protected mBackground: ThreeSlicePath;
    protected mKey: string;
    protected mFrame: string[];
    protected mDownFrame: string[];
    protected mText: Phaser.GameObjects.Text;
    protected mIsMove: boolean;
    protected mIsDown: boolean;
    private mRectangle;
    private zoom;
    private mTweening;
    private tweenScale;
    private mTweenBoo;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string[], downFrame: string[], text?: string, dpr?: number, scale?: number, tweenBoo?: boolean, music?: ISoundGroup);
    get background(): ThreeSlicePath;
    get text(): Phaser.GameObjects.Text;
    addListen(): void;
    removeListen(): void;
    setEnable(value: any, tint?: boolean): void;
    set tweenEnable(value: any);
    mute(boo: boolean): void;
    changeNormal(): void;
    changeDown(): void;
    setFrame(frame: string[]): void;
    setText(val: string): void;
    setTextStyle(style: object): void;
    setFontStyle(val: string): void;
    setTextOffset(x: number, y: number): void;
    setTextColor(color: string): void;
    setFrameNormal(normal: string[], down?: string[]): this;
    protected createBackground(): void;
    protected setBgFrame(frame: string[]): void;
    protected buttonStateChange(state: ButtonState): void;
    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer): void;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer): void;
    protected pointerUp(pointer: any): void;
    protected onPointerOutHandler(pointer: any): void;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer): void;
    protected checkPointerInBounds(gameObject: any, pointerx: number, pointery: number): boolean;
    private tween;
    private tweenComplete;
}
