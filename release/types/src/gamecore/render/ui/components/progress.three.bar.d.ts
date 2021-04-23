/// <reference types="tooqinggamephaser" />
import { BaseUI } from "apowophaserui";
import { ThreeSlicePath } from "./three.slice.path";
export declare class ProgressThreeBar extends BaseUI {
    value: number;
    max: number;
    protected mBackground: ThreeSlicePath | any;
    protected mBar: ThreeSlicePath | any;
    protected mText: Phaser.GameObjects.Text;
    protected zoom: number;
    constructor(scene: Phaser.Scene, key: string, background: string[], bar: string[], style?: any, barconfig?: any, bgconfig?: any);
    setProgress(curVal: any, maxVal: any): void;
    setText(val: any): void;
    get text(): Phaser.GameObjects.Text;
    get bar(): any;
    protected createBackgroundBar(key: string, background: any, bar: any, style?: any, barconfig?: any, bgconfig?: any): void;
}
