/// <reference types="tooqinggamephaser" />
import { ProgressMaskBar } from "./progress.mask.bar";
import { ThreeSlicePath } from "./three.slice.path";
export declare class ProgressThreeMaskBar extends ProgressMaskBar {
    protected mBackground: Phaser.GameObjects.Image | ThreeSlicePath | any;
    protected mBar: Phaser.GameObjects.Image | ThreeSlicePath | any;
    protected maskGraphics: Phaser.GameObjects.Graphics;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number;
    constructor(scene: Phaser.Scene, key: string, background: string[], bar: string[], style?: any, barconfig?: any, bgconfig?: any);
    protected createBackgroundBar(key: string, background: any, bar: any, style?: any, barconfig?: any, bgconfig?: any): void;
}
