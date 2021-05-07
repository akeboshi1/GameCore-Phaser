import { BaseUI, NineSlicePatch } from "apowophaserui";
export declare class ProgressMaskBar extends BaseUI {
    value: number;
    max: number;
    protected mBackground: Phaser.GameObjects.Image | NineSlicePatch;
    protected mBar: Phaser.GameObjects.Image | NineSlicePatch;
    protected maskGraphics: Phaser.GameObjects.Graphics;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number;
    constructor(scene: Phaser.Scene, key: string, background: string, bar: string, style?: any, barconfig?: any, bgconfig?: any);
    setProgress(curVal: any, maxVal: any): void;
    setText(val: any): void;
    refreshMask(): void;
    destroy(): void;
    get text(): Phaser.GameObjects.Text;
    get bar(): Phaser.GameObjects.Image | NineSlicePatch;
    protected createBackgroundBar(key: string, background: string, bar: string, style?: any, barconfig?: any, bgconfig?: any): void;
}
