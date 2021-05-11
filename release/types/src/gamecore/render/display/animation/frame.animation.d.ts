/// <reference types="tooqinggamephaser" />
import { Handler } from "structure";
import { BaseAnimation } from "./base.animation";
export declare class FrameAnimation extends BaseAnimation {
    private frameAnim;
    private complHandler;
    constructor(scene: Phaser.Scene);
    load(resName: string, textureUrl: string, jsonUrl?: string, compl?: Handler): void;
    play(aniName?: string): void;
    destroy(): void;
    onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number): void;
}
