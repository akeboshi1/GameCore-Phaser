import { Render } from "gamecoreRender";
import { Pos } from "utils";
/**
 * 切换状态按钮(点击后状态改变的按钮，需要多帧资源)
 */
export declare class IconSelectBtn extends Phaser.GameObjects.Container {
    private monClick;
    private mScene;
    private mRender;
    private mBgResKey;
    private mBtnBg;
    private mBtnIcon;
    private mBtnData;
    private mBasePos;
    private mBgTexture;
    constructor(scene: Phaser.Scene, render: Render, bgResKey: string, bgTexture: string[], scale?: number);
    setPos(x: number, y: number): void;
    /**
     * 获取按钮的初始化时的位置，用于tween时，按钮来回切换位置用
     */
    getPos(): Pos;
    setBtnData(value: any): void;
    getBtnData(): any;
    setClick(func: Function): void;
    setBgRes(index: number): void;
    destroy(): void;
    private overHandler;
    private outHandler;
    private upHandler;
    private downHandler;
    private scaleHandler;
}
