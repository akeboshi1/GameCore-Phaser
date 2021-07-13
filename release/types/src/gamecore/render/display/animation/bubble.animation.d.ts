import { BaseAnimation } from "./base.animation";
export declare class BubbleAnimation extends BaseAnimation {
    private frameAnim;
    private bubblebg;
    constructor(scene: Phaser.Scene);
    load(resName: string, textureUrl: string, jsonUrl?: string): void;
    play(aniName?: string): void;
    destroy(): void;
    onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number): void;
}
