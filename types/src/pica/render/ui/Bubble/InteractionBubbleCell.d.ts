import { Handler } from "utils";
export declare class InteractionBubbleCell extends Phaser.GameObjects.Container {
    private mBubbleAni;
    private mWdith;
    private mHeight;
    private content;
    private mRemoveDelay;
    private handler;
    constructor(scene: Phaser.Scene, dpr: number);
    setContentData(content: any, handler: Handler): void;
    load(resName?: string, url?: string, jsonUrl?: string): void;
    show(): void;
    hide(): void;
    destroy(): void;
    private createAnimation;
    private onBubbleClick;
    private removeDelay;
}
