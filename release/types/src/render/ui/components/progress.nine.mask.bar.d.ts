/// <reference types="tooqinggamephaser" />
import { BaseUI } from "apowophaserui";
export declare class ProgressNineMaskBar extends BaseUI {
    value: number;
    max: number;
    protected mBackground: any;
    protected mBar: any;
    protected maskGraphics: Phaser.GameObjects.Graphics;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number;
    constructor(scene: Phaser.Scene, key: string, background: string, bar: string, style?: any, barconfig?: any, bgconfig?: any);
    setProgress(curVal: any, maxVal: any): void;
    setText(val: any): void;
    refreshMask(): void;
    destroy(): void;
    get text(): Phaser.GameObjects.Text;
    get bar(): any;
    protected createBackgroundBar(key: string, background: string, bar: string, style?: any, barconfig?: any, bgconfig?: any): void;
}
