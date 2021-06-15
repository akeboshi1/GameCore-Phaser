/// <reference types="tooqingphaser" />
import { BaseUI } from "apowophaserui";
export declare class ProgressMaskBar extends BaseUI {
    value: number;
    max: number;
    protected mBackground: Phaser.GameObjects.Image;
    protected mBar: Phaser.GameObjects.Image;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number;
    constructor(scene: Phaser.Scene, key: string, background: string, bar: string, style?: any);
    setProgress(curVal: any, maxVal: any): void;
    setText(val: any): void;
    refreshMask(): void;
    destroy(): void;
    get text(): Phaser.GameObjects.Text;
    get bar(): Phaser.GameObjects.Image;
    protected createBackgroundBar(key: string, background: string, bar: string, style?: any): void;
}
