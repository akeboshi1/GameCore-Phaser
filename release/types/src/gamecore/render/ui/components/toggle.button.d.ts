/// <reference types="tooqingphaser" />
import { ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher } from ".";
export declare class ToggleButton extends ButtonEventDispatcher {
    private mText;
    private normalColor;
    private changeColor;
    private mBackground;
    private mIsOn;
    private key;
    private mNormal;
    private mDown;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, down: string, dpr: number, text?: string);
    setText(val: string): void;
    setFontSize(size: number): void;
    setFontStyle(val: string): void;
    setStyle(style: object): void;
    setNormalColor(color: string): void;
    setChangeColor(color: string): void;
    setNormalFrame(normal: string, down: string): void;
    set isOn(value: boolean);
    get isOn(): boolean;
    changeDown(): void;
    changeNormal(): void;
    get text(): Phaser.GameObjects.Text;
    protected EventStateChange(state: ClickEvent): void;
}
