import { IAnimationBase, AnimationUrlData } from "./ianimationbase";
export declare class BaseAnimation extends Phaser.GameObjects.Container implements IAnimationBase {
    resName: string;
    textureUrl: string;
    animUrlData: AnimationUrlData;
    loaded: boolean;
    isPlaying: boolean;
    loop: boolean;
    curAniName: string;
    constructor(scene: Phaser.Scene);
    load(resName: string, textureUrl: string, jsonUrl?: string): void;
    play(aniName?: string): void;
    destroy(): void;
    onLoadComplete(loader?: any, totalComplete?: number, totalFailed?: number): void;
}
