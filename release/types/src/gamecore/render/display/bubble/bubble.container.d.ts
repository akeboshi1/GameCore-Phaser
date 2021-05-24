/// <reference types="phaser" />
import { IDisplayObject } from "../display.object";
export declare class BubbleContainer extends Phaser.GameObjects.Container {
    private mBubbles;
    private mArrow;
    private mScale;
    constructor(scene: Phaser.Scene, scale: number);
    addBubble(text: string, bubbleSetting: any): void;
    follow(target: IDisplayObject): void;
    updatePos(x: number, y: number): void;
    destroy(fromScene?: boolean): void;
    removeFormParent(): void;
    private createBubble;
    private onRemoveBubble;
}
