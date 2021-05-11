/// <reference types="tooqinggamephaser" />
import { BaseUI, ISoundGroup } from "apowophaserui";
export declare class SoundButton extends BaseUI {
    protected soundGroup: any;
    protected mDownTime: number;
    protected mPressDelay: number;
    protected mPressTime: any;
    protected mIsMove: boolean;
    protected mIsDown: boolean;
    protected mRectangle: Phaser.Geom.Rectangle;
    protected mTweening: boolean;
    protected tweenScale: number;
    protected mTweenBoo: boolean;
    constructor(scene: Phaser.Scene, x: number, y: number, tweenBoo?: boolean, music?: ISoundGroup);
    addListen(): void;
    removeListen(): void;
    set enable(value: any);
    protected onPointerMoveHandler(pointer: Phaser.Input.Pointer): void;
    protected onPointerUpHandler(pointer: Phaser.Input.Pointer): void;
    protected pointerUp(pointer: any): void;
    protected onPointerOutHandler(pointer: any): void;
    protected onPointerDownHandler(pointer: Phaser.Input.Pointer): void;
    protected checkPointerInBounds(gameObject: any, pointerx: number, pointery: number): boolean;
    protected tween(show: any, callback?: any): void;
    protected tweenComplete(show: any): void;
}
