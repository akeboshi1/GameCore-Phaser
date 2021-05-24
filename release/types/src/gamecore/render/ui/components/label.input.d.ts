/// <reference types="phaser" />
import { InputText } from "apowophaserui";
export declare class LabelInput extends Phaser.GameObjects.Container {
    private mBackground;
    private mLabel;
    private mInputText;
    private mInputConfig;
    private mOriginX;
    private mOriginY;
    private mPlaceholder;
    private mAutoBlur;
    constructor(scene: Phaser.Scene, config: any);
    setText(val: string): this;
    setPlaceholder(val: string): this;
    setOrigin(x?: number, y?: number): this;
    createBackground(padding: number, radius: number): void;
    setSize(w: number, h: number): this;
    setAutoBlur(val: boolean): this;
    setBlur(): void;
    destroy(): void;
    private createInputText;
    private onShowInputHandler;
    private onPointerDownHandler;
    private onShowLabel;
    private destroyInput;
    private onTextChangeHandler;
    private onTextBlurHandler;
    private onTextFocusHandler;
    private onTapHandler;
    get object(): Phaser.GameObjects.Text | InputText;
    get text(): string;
}
