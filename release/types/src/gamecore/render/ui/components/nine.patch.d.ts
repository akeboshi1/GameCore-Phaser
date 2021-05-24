/// <reference types="phaser" />
import { IPatchesConfig } from "./patches.config";
export declare class NinePatch extends Phaser.GameObjects.Container {
    private static readonly __BASE;
    private static readonly patches;
    private originTexture;
    private originFrame;
    private config;
    private finalXs;
    private finalYs;
    private internalTint;
    private patchKey;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, frame: string | number, config?: IPatchesConfig);
    resize(width: number, height: number): this;
    setTexture(key: string, frame?: string | integer): this;
    setFrame(frame: string | integer): this;
    setSize(width: number, height: number): this;
    setTint(tint: number): this;
    setTintFill(tint: number): this;
    get tintFill(): boolean;
    set tintFill(value: boolean);
    set tint(value: number);
    get isTinted(): boolean;
    clearTint(): void;
    destroy(): void;
    protected getPatchNameByIndex(index: number): string;
    private createPatches;
    private drawPatches;
    private createPatchFrame;
}
