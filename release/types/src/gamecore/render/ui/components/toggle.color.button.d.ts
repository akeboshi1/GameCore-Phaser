/// <reference types="tooqinggamephaser" />
import { ClickEvent } from "apowophaserui";
import { ButtonEventDispatcher } from "./button.event.dispatch";
export declare class ToggleColorButton extends ButtonEventDispatcher {
    private mText;
    private normalColor;
    private changeColor;
    private mIsOn;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, text?: string, style?: any);
    setText(val: string): void;
    setFontSize(size: number): void;
    setFontStyle(val: string): void;
    setStyle(style: object): void;
    setNormalColor(color: string): void;
    setChangeColor(color: string): void;
    set isOn(value: boolean);
    get isOn(): boolean;
    changeDown(): void;
    changeNormal(): void;
    get text(): Phaser.GameObjects.Text;
    protected EventStateChange(state: ClickEvent): void;
}
