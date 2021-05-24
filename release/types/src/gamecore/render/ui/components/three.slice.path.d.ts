import { BaseUI } from "apowophaserui";
export declare class ThreeSlicePath extends BaseUI {
    protected imgs: Phaser.GameObjects.Image[];
    protected mCorrection: number;
    protected internalTint: number;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string[], dpr?: number, scale?: number, correct?: number);
    resize(width: number, height: number): this;
    set correctValue(value: any);
    setTexture(key: string, frame: string[]): this;
    setFrame(frame: string[]): this;
    setSize(width: number, height: number): this;
    setTint(tint: number): this;
    setTintFill(tint: number): this;
    get tintFill(): boolean;
    set tintFill(value: boolean);
    set tint(value: number);
    get isTinted(): boolean;
    clearTint(): void;
    destroy(): void;
}
