/// <reference types="phaser" />
import { BaseAnimation } from "./base.animation";
export declare class DragonbonesAnimation extends BaseAnimation {
    private armatureDisplay;
    constructor(scene: Phaser.Scene);
    load(resName: string, textureUrl: string, jsonUrl?: string, boneUrl?: string): void;
    play(aniName?: string): void;
    destroy(): void;
    onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number): void;
}
