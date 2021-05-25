/// <reference types="tooqingphaser" />
export declare class TextButton extends Phaser.GameObjects.Container {
    private mText;
    private normalColor;
    private changeColor;
    constructor(scene: Phaser.Scene, dpr: number, scale?: number, text?: string, x?: number, y?: number);
    setText(val: string): void;
    setFontSize(size: number): void;
    setFontStyle(val: string): void;
    setStyle(style: object): void;
    setNormalColor(color: string): void;
    setChangeColor(color: string): void;
    changeDown(): void;
    changeNormal(): void;
    private onPointerUpHandler;
    get text(): Phaser.GameObjects.Text;
}
