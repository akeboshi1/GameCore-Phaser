/// <reference types="phaser" />
import { NineSlicePatch, IPatchesConfig } from "apowophaserui";
export declare class NinePatchButton extends Phaser.GameObjects.Container {
    protected mLabel: Phaser.GameObjects.Text;
    protected mNingBg: NineSlicePatch;
    protected mKey: string;
    protected mFrame: string;
    protected mFrame_nrmal: string;
    protected mFrame_down: string;
    protected mFrame_over: string;
    protected btnData: any;
    private mScene;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string, text?: string, config?: IPatchesConfig, data?: any);
    set enable(value: any);
    getBtnData(): any;
    setText(text: string): void;
    getText(): string;
    setTextStyle(style: object): void;
    setFontStyle(val: string): void;
    setTextOffset(x: number, y: number): void;
    setFrame(frame: string | number): this;
    destroy(fromScene?: boolean): void;
    setFrameNormal(normal: string, down?: string, over?: string): this;
    changeNormal(): void;
    changeDown(): void;
    protected changeOver(): void;
    protected isExists(frame: string): boolean;
    protected onPointerDown(pointer: any): void;
    protected onPointerUp(pointer: any): void;
    get label(): Phaser.GameObjects.Text;
    private scaleHandler;
    private initFrame;
}
