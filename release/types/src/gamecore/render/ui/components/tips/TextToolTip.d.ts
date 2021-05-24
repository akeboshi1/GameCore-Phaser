/// <reference types="phaser" />
import { Handler } from "structure";
export declare class TextToolTips extends Phaser.GameObjects.Container {
    private bg;
    private text;
    private timeID;
    private dpr;
    constructor(scene: Phaser.Scene, key: string, frame: string, dpr: number, zoom: number);
    setSize(width: number, height: number): this;
    setText(text: string): void;
    setDelayText(text: string, delay: number, compl?: Handler): void;
}
