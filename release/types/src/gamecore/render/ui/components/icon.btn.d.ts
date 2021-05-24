/// <reference types="phaser" />
import { Render } from "../../render";
import { Pos } from "structure";
export interface IBtnData {
    readonly name?: string;
    key: string;
    bgResKey: string;
    bgTextures: string[];
    iconResKey: string;
    iconTexture: string;
    scale: number;
    pngUrl: string;
    jsonUrl: string;
    callBack?: Function;
}
/**
 * 多帧资源按钮
 */
export declare class IconBtn extends Phaser.GameObjects.Container {
    private monClick;
    private mScene;
    private mRender;
    private mBgResKey;
    private mBtnBg;
    private mBtnIcon;
    private mBtnData;
    private mBasePos;
    private mBgTexture;
    private mData;
    constructor(scene: Phaser.Scene, render: Render, data: IBtnData);
    getKey(): string;
    setPos(x: number, y: number): void;
    /**
     * 获取按钮的初始化时的位置，用于tween时，按钮来回切换位置用
     */
    getPos(): Pos;
    setBtnData(value: any): void;
    getBtnData(): any;
    setClick(func: Function): void;
    destroy(): void;
    protected loadComplete(): void;
    private overHandler;
    private outHandler;
    private upHandler;
    private downHandler;
    private scaleHandler;
}
