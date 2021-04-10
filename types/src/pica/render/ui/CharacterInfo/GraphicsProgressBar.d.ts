export declare class GraphicsProgressBar extends Phaser.GameObjects.Container {
    private bgGraphics;
    private barGraphics;
    private barColor;
    private bgColor;
    private isHorizontal;
    private value;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, isHorizontal?: boolean);
    setColor(barColor: number, bgColor?: number): void;
    setValue(value: number): void;
    setRoundedRectValue(value: number, radius: number): void;
}
