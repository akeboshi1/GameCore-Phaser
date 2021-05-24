/// <reference types="phaser" />
export declare class TweenCompent {
    private mTweening;
    private mScale;
    private mX;
    private mY;
    private mTween;
    private mScene;
    private mTarget;
    private mPingpang;
    private mTempPing;
    private tempData;
    private mOnce;
    constructor(scene: Phaser.Scene, gameobject: any, config: {
        scale?: number;
        x?: number;
        y?: number;
        pingpang?: boolean;
        once?: boolean;
    });
    setObject(obj: any): void;
    zoomIn(): void;
    zoomOut(once?: boolean): void;
    tween(): void;
    tweenComplete(): void;
}
