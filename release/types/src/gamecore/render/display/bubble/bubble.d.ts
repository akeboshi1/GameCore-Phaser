import { Url } from "utils";
export declare class Bubble extends Phaser.GameObjects.Container {
    private url;
    private mChatContent;
    private mBubbleBg;
    private mMinWidth;
    private mMinHeight;
    private mToY;
    private mTweenCompleteCallback;
    private mTweenCallContext;
    private mRemoveDelay;
    private mScale;
    constructor(scene: Phaser.Scene, scale: number, url: Url);
    show(text: string, bubble: any): void;
    tweenTo(toY: number): void;
    durationRemove(duration: number, callback?: Function, callbackContext?: any): void;
    removeTween(): void;
    destroy(): void;
    private onComplete;
    get minWidth(): number;
    get minHeight(): number;
}
